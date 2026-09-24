"""Hybrid ingredient -> dish recommender.

Three signals are blended into one 0..1 score for every dish:

1. coverage  - IDF-weighted share of the dish's ingredients the user already has
               ("how much of this dish can I make?"). Rare ingredients (saffron)
               matter more than common ones (oil).
2. tfidf cosine - cosine similarity between the user's basket and the dish in
               TF-IDF space (penalises dishes needing lots of things the user lacks
               and rewards baskets that "look like" the dish).
3. latent    - cosine similarity in a TruncatedSVD (LSA) space learned from all dishes.
               It captures co-occurrence ("ghee + cardamom + milk" ~ sweets) so a dish
               can still surface when only part of its ingredient set is selected.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

import joblib
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize as l2_normalize

from ingredient_meta import PANTRY, normalize


def _identity(x):  # module-level so the fitted vectorizer can be pickled
    return x


DEFAULT_WEIGHTS = {"coverage": 0.65, "cosine": 0.20, "latent": 0.15}


@dataclass
class Recommender:
    weights: dict = field(default_factory=lambda: dict(DEFAULT_WEIGHTS))
    n_components: int = 64

    # ---- training ---------------------------------------------------------
    def fit(self, dishes: list[dict]):
        """dishes: [{"name": str, "ingredients": [normalised names], ...meta}]"""
        self.dishes = dishes
        docs = [d["ingredients"] for d in dishes]
        self.vec = TfidfVectorizer(analyzer=_identity, binary=True, norm=None, smooth_idf=True)
        raw = self.vec.fit_transform(docs)                       # binary * idf
        self.vocab = self.vec.vocabulary_
        self.idf = self.vec.idf_.astype(np.float32)
        self.dish_binary = (raw > 0).astype(np.float32).tocsr()
        self.dish_weight_total = np.asarray(raw.sum(axis=1)).ravel() + 1e-9
        self.dish_tfidf = l2_normalize(raw, norm="l2").tocsr()

        k = max(2, min(self.n_components, raw.shape[1] - 1, raw.shape[0] - 1))
        self.svd = TruncatedSVD(n_components=k, random_state=42)
        self.dish_latent = l2_normalize(self.svd.fit_transform(self.dish_tfidf))
        return self

    # ---- inference --------------------------------------------------------
    def _query_vector(self, names: list[str]):
        idx = [self.vocab[n] for n in names if n in self.vocab]
        q = np.zeros(len(self.vocab), dtype=np.float32)
        q[idx] = 1.0
        return q

    def recommend(self, ingredients: list[str], top_n: int = 10, diet: str | None = None,
                  min_score: float = 0.0) -> dict:
        wanted = []
        for raw in ingredients:
            n = normalize(raw)
            if n and n not in wanted:
                wanted.append(n)
        known = [n for n in wanted if n in self.vocab]
        unknown = [n for n in wanted if n not in self.vocab]
        pantry_known = [p for p in PANTRY if p in self.vocab]

        have = self._query_vector(known + pantry_known)          # for coverage
        user_only = self._query_vector(known)                     # for similarity
        if user_only.sum() == 0:
            return {"results": [], "unknown_ingredients": unknown}

        overlap_w = self.dish_binary.multiply(self.idf * have).sum(axis=1).A1
        coverage = overlap_w / self.dish_weight_total

        q_tfidf = l2_normalize((user_only * self.idf).reshape(1, -1))
        cosine = np.asarray(self.dish_tfidf @ q_tfidf.T).ravel()

        q_lat = l2_normalize(self.svd.transform(q_tfidf))
        latent = np.clip(self.dish_latent @ q_lat.ravel(), 0, 1)

        w = self.weights
        score = w["coverage"] * coverage + w["cosine"] * cosine + w["latent"] * latent

        shared_with_user = self.dish_binary @ user_only          # count of user's picks in each dish
        order = np.argsort(-score)
        inv_vocab = getattr(self, "_inv_vocab", None)
        if inv_vocab is None:
            inv_vocab = self._inv_vocab = {i: t for t, i in self.vocab.items()}

        results = []
        user_set = set(known) | set(pantry_known)
        for i in order:
            if shared_with_user[i] <= 0 or score[i] < min_score:
                continue
            d = self.dishes[i]
            if diet and str(d.get("meta", {}).get("diet", "")).lower() != diet.lower():
                continue
            dish_ings = d["ingredients"]
            have_list = [x for x in dish_ings if x in user_set]
            missing = [x for x in dish_ings if x not in user_set]
            results.append({
                "name": d["name"],
                "score": round(float(score[i]) * 100, 1),
                "coverage": round(float(coverage[i]) * 100, 1),
                "can_cook_now": len(missing) == 0,
                "have": have_list,
                "missing": missing,
                "ingredients": dish_ings,
                "meta": d.get("meta", {}),
            })
            if len(results) >= top_n:
                break
        # dishes that are fully cookable float to the top, then by score
        results.sort(key=lambda r: (not r["can_cook_now"], -r["score"]))
        return {"results": results, "unknown_ingredients": unknown}

    # ---- persistence ------------------------------------------------------
    def save(self, path):
        joblib.dump(self, path, compress=3)

    @staticmethod
    def load(path) -> "Recommender":
        return joblib.load(path)
