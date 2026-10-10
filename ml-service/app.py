"""Tiny Flask API around the trained model. The Spring Boot backend calls this.

    python app.py            # http://localhost:8000

Endpoints
  GET  /health                     model status
  GET  /meta                       filter options (diets, courses, regions)
  POST /recommend                  {ingredients, topN, diet, course, maxMissing, exclude, sort}
  GET  /similar?name=Kheer&topN=6  dishes closest to a given dish
"""
import os
from flask import Flask, jsonify, request

from recommender import Recommender

MODEL_PATH = os.environ.get("ML_MODEL_PATH", os.path.join(os.path.dirname(__file__), "artifacts", "model.joblib"))
VALID_SORTS = {"match", "fewest_missing", "quickest"}
app = Flask(__name__)
model = None


def get_model():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError("Model not trained yet. Run: python train.py --csv data/<dataset>.csv")
        model = Recommender.load(MODEL_PATH)
    return model


def _clean(value):
    """Empty strings from the UI mean 'no filter'."""
    value = (value or "").strip() if isinstance(value, str) else value
    return value or None


def _int_or_none(value):
    try:
        return None if value in (None, "") else max(0, int(value))
    except (TypeError, ValueError):
        return None


@app.get("/health")
def health():
    try:
        m = get_model()
        return jsonify(status="ok", dishes=len(m.dishes), ingredients=len(m.vocab))
    except FileNotFoundError as e:
        return jsonify(status="model_missing", detail=str(e)), 503


@app.get("/meta")
def meta():
    try:
        return jsonify(get_model().options())
    except FileNotFoundError as e:
        return jsonify(error=str(e)), 503


@app.post("/recommend")
def recommend():
    body = request.get_json(silent=True) or {}
    ingredients = body.get("ingredients")
    if not isinstance(ingredients, list) or not ingredients:
        return jsonify(error="'ingredients' must be a non-empty list"), 400
    exclude = body.get("exclude") or []
    if not isinstance(exclude, list):
        return jsonify(error="'exclude' must be a list"), 400
    sort = body.get("sort") or "match"
    if sort not in VALID_SORTS:
        return jsonify(error=f"'sort' must be one of {sorted(VALID_SORTS)}"), 400
    try:
        top_n = max(1, min(int(body.get("topN", 10)), 50))
        return jsonify(get_model().recommend(
            [str(i) for i in ingredients],
            top_n=top_n,
            diet=_clean(body.get("diet")),
            course=_clean(body.get("course")),
            max_missing=_int_or_none(body.get("maxMissing")),
            exclude=[str(e) for e in exclude],
            sort=sort,
        ))
    except FileNotFoundError as e:
        return jsonify(error=str(e)), 503


@app.get("/similar")
def similar():
    name = (request.args.get("name") or "").strip()
    if not name:
        return jsonify(error="'name' is required"), 400
    try:
        top_n = max(1, min(int(request.args.get("topN", 6)), 20))
        found = get_model().similar(name, top_n=top_n)
    except FileNotFoundError as e:
        return jsonify(error=str(e)), 503
    if found is None:
        return jsonify(error=f"Unknown dish '{name}'"), 404
    return jsonify(found)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))