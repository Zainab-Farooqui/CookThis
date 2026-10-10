"""Common Indian-kitchen ingredient swaps.

Keys and values are *normalised* ingredient names (see ingredient_meta.normalize).
A swap means "if you don't have KEY, you can usually cook the dish with one of VALUES".
Edit this table freely - it is plain data, not learned.
"""

SUBSTITUTES = {
    "cream": ["milk", "yogurt", "butter"],
    "butter": ["ghee", "oil"],
    "ghee": ["butter", "oil"],
    "oil": ["ghee", "butter"],
    "milk": ["milk powder", "cream"],
    "milk powder": ["milk"],
    "yogurt": ["milk", "lemon"],
    "paneer": ["tofu"],
    "sugar": ["jaggery"],
    "jaggery": ["sugar"],
    "lemon": ["tamarind", "yogurt"],
    "tamarind": ["lemon"],
    "maida": ["whole wheat flour"],
    "whole wheat flour": ["maida"],
    "gram flour": ["rice flour"],
    "semolina": ["rice flour"],
    "green chili": ["red chili powder"],
    "red chili powder": ["green chili"],
    "coriander": ["mint"],
    "mint": ["coriander"],
    "kasuri methi": ["spinach"],
    "cashew": ["almond", "peanut"],
    "almond": ["cashew"],
    "peanut": ["cashew"],
    "raisin": ["date"],
    "toor dal": ["masoor dal", "moong dal"],
    "chicken": ["mutton"],
    "mutton": ["chicken"],
    "baking powder": ["yogurt"],
}


def swaps_for(missing, available):
    """For each missing ingredient return the first available substitute (if any).

    >>> swaps_for(["cream", "saffron"], {"milk"})
    [{'missing': 'cream', 'use': 'milk'}]
    """
    out = []
    for m in missing:
        for alt in SUBSTITUTES.get(m, []):
            if alt in available:
                out.append({"missing": m, "use": alt})
                break
    return out