# Dataset

Download **Indian Food 101** from Kaggle and put the CSV here as `indian_food.csv`:

https://www.kaggle.com/datasets/nehaprabhavalkar/indian-food-101

```
kaggle datasets download -d nehaprabhavalkar/indian-food-101 --unzip -p ml-service/data
```

Expected columns: `name, ingredients, diet, prep_time, cook_time, flavor_profile, course, state, region`
(only `name` and `ingredients` are required; the rest are shown on the dish cards).

`sample_indian_food.csv` is a small **hand-written sample in the same format** so you can run the whole
project before downloading anything. It is NOT the Kaggle data - don't judge model quality on it.

## Using a bigger dataset
Any CSV with a dish-name column and an ingredients column works:

```
python train.py --csv data/other.csv --name-col TranslatedRecipeName --ing-col Cleaned-Ingredients
```
Ingredient text with quantities ("2 tbsp oil") is cleaned lightly by `ingredient_meta.normalize`;
extend `ALIASES` there if you see near-duplicates in `artifacts/ingredients.json`.
