"""Honest offline evaluation.

For every dish we hide part of its ingredient list, pretend the rest is what the
user has in the fridge, and check whether the recommender ranks the original dish
near the top. Compares the full hybrid model against each single signal.

    python evaluate.py --csv data/indian_food.csv --keep 0.7
"""
import argparse, random
import numpy as np, pandas as pd

from ingredient_meta import PANTRY, split_ingredients
from recommender import Recommender, DEFAULT_WEIGHTS
from train import pick, NAME_CANDIDATES, ING_CANDIDATES


def run(dishes, weights, keep, seeds=(0, 1, 2), k_list=(1, 5, 10)):
    m = Recommender(weights=weights).fit(dishes)
    hits = {k: 0 for k in k_list}; rr = 0.0; n = 0
    for s in seeds:
        rng = random.Random(s)
        for d in dishes:
            pool = [i for i in d["ingredients"] if i not in PANTRY]
            if len(pool) < 3:
                continue
            q = rng.sample(pool, max(2, round(len(pool) * keep)))
            res = m.recommend(q, top_n=50)["results"]
            names = [r["name"] for r in res]
            rank = names.index(d["name"]) + 1 if d["name"] in names else None
            n += 1
            for k in k_list:
                hits[k] += rank is not None and rank <= k
            rr += 1 / rank if rank else 0
    return {**{f"top{k}": hits[k] / n for k in k_list}, "MRR": rr / n, "queries": n}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True); ap.add_argument("--name-col"); ap.add_argument("--ing-col")
    ap.add_argument("--keep", type=float, default=0.7, help="fraction of a dish's ingredients the 'user' has")
    a = ap.parse_args()
    df = pd.read_csv(a.csv)
    nc, ic = pick(df.columns, a.name_col, NAME_CANDIDATES, "name"), pick(df.columns, a.ing_col, ING_CANDIDATES, "ingredients")
    dishes, seen = [], set()
    for _, r in df.iterrows():
        ing = split_ingredients(r[ic])
        if len(ing) >= 2 and isinstance(r[nc], str) and r[nc].lower() not in seen:
            seen.add(r[nc].lower()); dishes.append({"name": r[nc].strip(), "ingredients": ing, "meta": {}})
    variants = {
        "hybrid (default)": DEFAULT_WEIGHTS,
        "coverage only": {"coverage": 1, "cosine": 0, "latent": 0},
        "tfidf cosine only": {"coverage": 0, "cosine": 1, "latent": 0},
        "latent (SVD) only": {"coverage": 0, "cosine": 0, "latent": 1},
    }
    print(f"{len(dishes)} dishes, user has {a.keep:.0%} of each dish's ingredients\n")
    print(f"{'model':22s} top1   top5   top10  MRR")
    for name, w in variants.items():
        r = run(dishes, w, a.keep)
        print(f"{name:22s} {r['top1']:.3f}  {r['top5']:.3f}  {r['top10']:.3f}  {r['MRR']:.3f}")
