"""Tiny Flask API around the trained model. The Spring Boot backend calls this.

    python app.py            # http://localhost:8000
"""
import os
from flask import Flask, jsonify, request

from recommender import Recommender

MODEL_PATH = os.environ.get("ML_MODEL_PATH", os.path.join(os.path.dirname(__file__), "artifacts", "model.joblib"))
app = Flask(__name__)
model = None


def get_model():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError("Model not trained yet. Run: python train.py --csv data/<dataset>.csv")
        model = Recommender.load(MODEL_PATH)
    return model


@app.get("/health")
def health():
    try:
        m = get_model()
        return jsonify(status="ok", dishes=len(m.dishes), ingredients=len(m.vocab))
    except FileNotFoundError as e:
        return jsonify(status="model_missing", detail=str(e)), 503


@app.post("/recommend")
def recommend():
    body = request.get_json(silent=True) or {}
    ingredients = body.get("ingredients")
    if not isinstance(ingredients, list) or not ingredients:
        return jsonify(error="'ingredients' must be a non-empty list"), 400
    try:
        top_n = max(1, min(int(body.get("topN", 10)), 50))
        return jsonify(get_model().recommend([str(i) for i in ingredients], top_n=top_n, diet=body.get("diet")))
    except FileNotFoundError as e:
        return jsonify(error=str(e)), 503


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
