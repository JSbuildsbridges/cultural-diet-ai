// Low-residue (low-fiber) diet rules for colonoscopy/endoscopy prep
// Typically followed 3-5 days before the procedure

export const dietRules = {
  allowed: [
    "White rice and refined grains",
    "White bread, plain crackers",
    "Tender, well-cooked meat, poultry, fish",
    "Eggs (any style)",
    "Tofu and soft soy products",
    "Smooth nut butters (no chunks)",
    "Well-cooked vegetables without skin or seeds (e.g., carrots, green beans)",
    "Canned or cooked fruits without skin (e.g., applesauce, peeled peaches)",
    "Dairy: milk, yogurt (plain, no fruit pieces), cheese",
    "Butter, oils, mayonnaise",
    "Clear broths and strained soups",
    "Refined pasta (white flour)",
    "Potatoes without skin",
    "Fruit juice without pulp",
  ],
  avoid: [
    "Whole grains (brown rice, whole wheat, oats, quinoa)",
    "Raw vegetables",
    "Vegetable skins and seeds",
    "Beans, lentils, legumes",
    "Nuts and seeds (whole)",
    "Raw fruits, dried fruits",
    "Fruit with skin or seeds",
    "Popcorn, corn",
    "High-fiber cereals",
    "Tough or fibrous meats",
    "Fried or fatty foods (can cause discomfort)",
    "Spicy foods (may irritate)",
    "Coconut",
    "Pickles, olives",
  ],
  tips: [
    "Cook vegetables until very soft",
    "Remove all skins and seeds from fruits and vegetables",
    "Choose refined/white versions of grains",
    "Stay hydrated with clear fluids",
    "Avoid red or purple colored foods/drinks close to procedure",
  ],
};

export const dietContext = `
LOW-RESIDUE DIET RULES (for colonoscopy/endoscopy prep):

ALLOWED FOODS:
${dietRules.allowed.map(item => `- ${item}`).join('\n')}

FOODS TO AVOID:
${dietRules.avoid.map(item => `- ${item}`).join('\n')}

IMPORTANT TIPS:
${dietRules.tips.map(item => `- ${item}`).join('\n')}
`;
