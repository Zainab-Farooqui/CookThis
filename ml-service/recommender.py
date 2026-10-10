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
from substitutions import swaps_for


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

    @staticmethod
    def _total_time(meta: dict):
        """prep + cook minutes, or None when the dataset has neither."""
        if "prep_time" not in meta and "cook_time" not in meta:
            return None
        try:
            return int(float(meta.get("prep_time", 0)) + float(meta.get("cook_time", 0)))
        except (TypeError, ValueError):
            return None

    def recommend(self, ingredients: list[str], top_n: int = 10, diet: str | None = None,
                  min_score: float = 0.0, course: str | None = None, max_missing: int | None = None,
                  exclude: list[str] | None = None, sort: str = "match") -> dict:
        """Rank dishes for a basket of ingredients.

        diet / course   - keep only dishes whose meta matches (case-insensitive)
        max_missing     - keep only dishes that need at most N more ingredients
        exclude         - drop dishes containing any of these ingredients (allergies, dislikes)
        sort            - "match" (default) | "fewest_missing" | "quickest"
        """
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
        excluded = {normalize(e) for e in (exclude or []) if normalize(e)}
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
            meta = d.get("meta", {})
            if diet and str(meta.get("diet", "")).lower() != diet.lower():
                continue
            if course and str(meta.get("course", "")).lower() != course.lower():
                continue
            dish_ings = d["ingredients"]
            if excluded and excluded.intersection(dish_ings):
                continue
            have_list = [x for x in dish_ings if x in user_set]
            missing = [x for x in dish_ings if x not in user_set]
            if max_missing is not None and len(missing) > max_missing:
                continue
            swaps = swaps_for(missing, user_set)
            results.append({
                "name": d["name"],
                "score": round(float(score[i]) * 100, 1),
                "coverage": round(float(coverage[i]) * 100, 1),
                "can_cook_now": len(missing) == 0,
                "swap_ready": len(missing) > 0 and len(swaps) == len(missing),
                "have": have_list,
                "missing": missing,
                "substitutions": swaps,
                "ingredients": dish_ings,
                "total_time": self._total_time(meta),
                "meta": meta,
            })

        # fully cookable dishes first, then dishes cookable with swaps, then the chosen order
        if sort == "fewest_missing":
            key = lambda r: (len(r["missing"]), -r["score"])
        elif sort == "quickest":
            key = lambda r: (not r["can_cook_now"], r["total_time"] if r["total_time"] is not None else 10**6, -r["score"])
        else:
            key = lambda r: (not r["can_cook_now"], not r["swap_ready"], -r["score"])
        results.sort(key=key)
        total = len(results)
        return {"results": results[:top_n], "total_matches": total, "unknown_ingredients": unknown}

    # ---- similar dishes ---------------------------------------------------
    def similar(self, name: str, top_n: int = 6) -> dict | None:
        """Dishes closest to `name` (TF-IDF + latent blend). None if the dish is unknown."""
        idx = next((i for i, d in enumerate(self.dishes) if d["name"].lower() == name.strip().lower()), None)
        if idx is None:
            return None
        sim_tfidf = np.asarray(self.dish_tfidf @ self.dish_tfidf[idx].T.toarray()).ravel()
        sim_latent = np.clip(self.dish_latent @ self.dish_latent[idx], 0, 1)
        sim = 0.5 * sim_tfidf + 0.5 * sim_latent
        base = set(self.dishes[idx]["ingredients"])
        out = []
        for j in np.argsort(-sim):
            if j == idx:
                continue
            d = self.dishes[j]
            out.append({
                "name": d["name"],
                "similarity": round(float(sim[j]) * 100, 1),
                "shared": [x for x in d["ingredients"] if x in base],
                "meta": d.get("meta", {}),
            })
            if len(out) >= top_n:
                break
        return {"dish": self.dishes[idx]["name"], "similar": out}

    # ---- filter options for the UI ----------------------------------------
    def options(self) -> dict:
        def uniq(key):
            return sorted({str(d.get("meta", {}).get(key)).strip() for d in self.dishes
                           if d.get("meta", {}).get(key) not in (None, "")})
        return {"diets": uniq("diet"), "courses": uniq("course"), "regions": uniq("region")}

    # ---- persistence ------------------------------------------------------
    def save(self, path):
        joblib.dump(self, path, compress=3)

    @staticmethod
    def load(path) -> "Recommender":
        return joblib.load(path)