"""Ingredient normalisation, categories and icons.

Everything dataset-specific that is *not* learned lives here, so you can tweak it
without touching the model code.
"""
import re

# Ingredients we assume every kitchen has. They are treated as "available" when
# scoring so users don't have to tick salt/water for every search.
PANTRY = {"salt", "water"}

# Small alias table: different spellings -> one canonical name.
ALIASES = {
    "eggs": "egg", "tomatoes": "tomato", "onions": "onion", "potatoes": "potato",
    "carrots": "carrot", "chillies": "chili", "chilies": "chili", "chilli": "chili",
    "chile": "chili", "green chilli": "green chili", "green chilies": "green chili",
    "green chillies": "green chili", "red chilli": "red chili", "red chillies": "red chili",
    "red chilli powder": "red chili powder", "chilli powder": "chili powder",
    "curd": "yogurt", "dahi": "yogurt", "yoghurt": "yogurt", "curds": "yogurt",
    "brinjal": "eggplant", "aubergine": "eggplant", "baingan": "eggplant",
    "lady finger": "okra", "ladyfinger": "okra", "bhindi": "okra",
    "coriander leaves": "coriander", "cilantro": "coriander", "coriander leaf": "coriander",
    "bell pepper": "capsicum", "green capsicum": "capsicum",
    "cashews": "cashew", "cashew nuts": "cashew", "almonds": "almond", "peanuts": "peanut",
    "raisins": "raisin", "pistachios": "pistachio", "peas": "green peas", "mutter": "green peas",
    "cottage cheese": "paneer", "chicken breast": "chicken", "lamb": "mutton", "goat meat": "mutton",
    "prawns": "shrimp", "prawn": "shrimp", "lemon juice": "lemon", "lime": "lemon",
    "refined oil": "oil", "vegetable oil": "oil", "cooking oil": "oil", "sunflower oil": "oil",
    "mustard seeds": "mustard seed", "cumin seeds": "cumin", "jeera": "cumin",
    "cardamom powder": "cardamom", "elaichi": "cardamom", "cloves": "clove",
    "bay leaves": "bay leaf", "curry leaves": "curry leaf", "cinnamon stick": "cinnamon",
    "chickpeas": "chickpea", "kidney beans": "rajma", "beans": "beans",
    "all purpose flour": "maida", "maida flour": "maida", "refined flour": "maida",
    "wheat flour": "whole wheat flour", "atta": "whole wheat flour", "besan": "gram flour",
    "sooji": "semolina", "rava": "semolina", "suji": "semolina", "basmati rice": "rice",
    "rice flour": "rice flour", "poha": "flattened rice", "sugar syrup": "sugar",
    "powdered sugar": "sugar", "jaggery": "jaggery", "gur": "jaggery", "ghee": "ghee",
    "clarified butter": "ghee", "milk powder": "milk powder", "khoya": "khoa", "mawa": "khoa",
    "tomato puree": "tomato", "ginger garlic paste": "ginger garlic paste",
}

_UNITS = r"(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|grams?|gm|g|kg|ml|l|litres?|liters?|inch|pinch|pieces?|cloves?\s+of)"
_QTY = re.compile(rf"^[\d\s/.\u00bd\u00bc\u00be\-]+(?:{_UNITS}\b)?\s*(?:of\s+)?", re.I)


def normalize(raw: str) -> str:
    """'  2 Cups Tomatoes (chopped) ' -> 'tomato'."""
    s = str(raw).lower().strip()
    s = re.sub(r"\(.*?\)", " ", s)          # drop "(chopped)"
    s = _QTY.sub("", s) if s[:1].isdigit() else s   # drop leading quantities
    s = s.split(",")[0]                       # "onion, chopped" -> "onion"
    s = re.sub(r"[^a-z0-9\s\-]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return ALIASES.get(s, s)


def split_ingredients(cell) -> list:
    """Turn a dataset cell ("a, b; c" or a python-list string) into normalised unique names."""
    if cell is None:
        return []
    text = str(cell).strip()
    if text.startswith("[") and text.endswith("]"):
        text = text[1:-1].replace("'", "").replace('"', "")
    parts = re.split(r"[;,|]", text)
    out, seen = [], set()
    for p in parts:
        n = normalize(p)
        if n and len(n) > 1 and n not in seen:
            seen.add(n)
            out.append(n)
    return out


# --- categories (order matters: first match wins) -----------------------------
_CATEGORY_RULES = [
    ("Fruits", ["coconut", "mango", "banana", "apple", "orange", "lemon", "raisin", "date", "fig",
                "pomegranate", "papaya", "pineapple", "grape", "tamarind", "berry", "melon", "amla"]),
    ("Dairy", ["milk", "cheese", "butter", "yogurt", "paneer", "cream", "ghee", "khoa", "curd", "malai"]),
    ("Protein", ["chicken", "mutton", "fish", "shrimp", "egg", "beef", "pork", "crab", "lentil", "dal",
                 "chickpea", "rajma", "beans", "gram", "peanut", "cashew", "almond", "pistachio", "walnut",
                 "nuts", "soy", "tofu", "moong", "urad", "toor", "chana", "masoor"]),
    ("Grains", ["rice", "flour", "maida", "semolina", "wheat", "oats", "bread", "pasta", "noodle", "corn",
                "millet", "bajra", "jowar", "ragi", "poha", "flattened", "vermicelli", "roti", "naan", "atta"]),
    ("Spices", ["powder", "masala", "cumin", "turmeric", "cardamom", "clove", "cinnamon", "pepper", "mustard",
                "fenugreek", "asafoetida", "hing", "saffron", "nutmeg", "mace", "fennel", "ajwain", "bay leaf",
                "curry leaf", "paprika", "garam", "star anise", "seed", "chili", "chilli", "coriander seed"]),
    ("Vegetables", ["tomato", "onion", "potato", "garlic", "carrot", "capsicum", "spinach", "cucumber", "ginger",
                    "peas", "cauliflower", "cabbage", "eggplant", "okra", "pumpkin", "gourd", "beetroot",
                    "radish", "lettuce", "mushroom", "coriander", "mint", "methi", "leaf", "leaves", "spring",
                    "brinjal", "turnip", "yam", "drumstick", "zucchini", "bean sprout", "sprouts", "green"]),
]

_DEFAULT_ICON = {"Vegetables": "🥬", "Protein": "🍗", "Dairy": "🥛", "Grains": "🌾",
                 "Fruits": "🍎", "Spices": "🌶️", "Other": "🥄"}

_ICONS = {
    "tomato": "🍅", "onion": "🧅", "potato": "🥔", "garlic": "🧄", "carrot": "🥕", "capsicum": "🫑",
    "spinach": "🥬", "cucumber": "🥒", "ginger": "🫚", "green peas": "🫛", "cauliflower": "🥦",
    "cabbage": "🥬", "eggplant": "🍆", "okra": "🌿", "mushroom": "🍄", "corn": "🌽", "coriander": "🌿",
    "mint": "🌿", "chili": "🌶️", "green chili": "🌶️", "red chili": "🌶️", "egg": "🥚", "chicken": "🍗",
    "mutton": "🥩", "fish": "🐟", "shrimp": "🦐", "peanut": "🥜", "almond": "🌰", "cashew": "🥜",
    "milk": "🥛", "cheese": "🧀", "butter": "🧈", "yogurt": "🥣", "paneer": "⬜", "ghee": "🧈",
    "cream": "🥛", "rice": "🍚", "bread": "🍞", "pasta": "🍝", "oats": "🫓", "lemon": "🍋",
    "apple": "🍎", "banana": "🍌", "mango": "🥭", "orange": "🍊", "coconut": "🥥", "oil": "🫒",
    "sugar": "🍯", "jaggery": "🍯", "honey": "🍯", "salt": "🧂", "water": "💧", "raisin": "🍇",
    "tamarind": "🫘", "chickpea": "🫘", "rajma": "🫘", "beans": "🫘", "lentil": "🫘",
}


def categorize(name: str) -> str:
    words = name.split()
    if name.endswith("flour") or name in ("maida", "semolina"):
        return "Grains"
    if name == "egg":
        return "Protein"
    for cat, kws in _CATEGORY_RULES:
        for kw in kws:
            # long keywords match as substrings ("cauliflower"), short ones as whole words ("date")
            if (kw in name) if len(kw) > 4 else (kw in words):
                return cat
    return "Other"


def icon_for(name: str, category: str) -> str:
    if name in _ICONS:
        return _ICONS[name]
    for key, ic in _ICONS.items():
        if key in name.split():
            return ic
    return _DEFAULT_ICON.get(category, "🥄")
