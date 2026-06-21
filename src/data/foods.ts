export interface FoodItem {
  id: string
  name: string
  calories: number   // per 100g
  protein: number    // g per 100g
  carbs: number      // g per 100g
  fat: number        // g per 100g
  servingSize: number // default serving in grams
  category: string
  isCustom?: boolean
}

export const BUILT_IN_FOODS: FoodItem[] = [
  // Proteins
  { id: 'f1', name: 'Chicken Breast (cooked)', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 150, category: 'Protein' },
  { id: 'f2', name: 'Salmon (cooked)', calories: 208, protein: 28, carbs: 0, fat: 10, servingSize: 150, category: 'Protein' },
  { id: 'f3', name: 'Tuna (canned in water)', calories: 116, protein: 26, carbs: 0, fat: 1, servingSize: 100, category: 'Protein' },
  { id: 'f4', name: 'Beef Mince (lean, cooked)', calories: 215, protein: 26, carbs: 0, fat: 12, servingSize: 150, category: 'Protein' },
  { id: 'f5', name: 'Eggs (whole)', calories: 143, protein: 13, carbs: 1, fat: 10, servingSize: 60, category: 'Protein' },
  { id: 'f6', name: 'Egg Whites', calories: 52, protein: 11, carbs: 1, fat: 0.2, servingSize: 100, category: 'Protein' },
  { id: 'f7', name: 'Greek Yoghurt (plain)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: 200, category: 'Protein' },
  { id: 'f8', name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingSize: 150, category: 'Protein' },
  { id: 'f9', name: 'Whey Protein Powder', calories: 375, protein: 80, carbs: 7, fat: 4, servingSize: 30, category: 'Protein' },
  { id: 'f10', name: 'Tofu (firm)', calories: 76, protein: 8, carbs: 2, fat: 4, servingSize: 150, category: 'Protein' },
  { id: 'f11', name: 'Turkey Breast (cooked)', calories: 189, protein: 29, carbs: 0, fat: 7, servingSize: 150, category: 'Protein' },
  { id: 'f12', name: 'Shrimp (cooked)', calories: 99, protein: 21, carbs: 0, fat: 1.1, servingSize: 100, category: 'Protein' },
  // Carbs & Grains
  { id: 'f13', name: 'Oats (dry)', calories: 389, protein: 17, carbs: 66, fat: 7, servingSize: 80, category: 'Carbs' },
  { id: 'f14', name: 'White Rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: 200, category: 'Carbs' },
  { id: 'f15', name: 'Brown Rice (cooked)', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, servingSize: 200, category: 'Carbs' },
  { id: 'f16', name: 'Pasta (cooked)', calories: 131, protein: 5, carbs: 25, fat: 1.1, servingSize: 200, category: 'Carbs' },
  { id: 'f17', name: 'Wholegrain Bread', calories: 247, protein: 13, carbs: 41, fat: 4.2, servingSize: 40, category: 'Carbs' },
  { id: 'f18', name: 'White Bread', calories: 265, protein: 9, carbs: 49, fat: 3.2, servingSize: 40, category: 'Carbs' },
  { id: 'f19', name: 'Sweet Potato (cooked)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingSize: 150, category: 'Carbs' },
  { id: 'f20', name: 'White Potato (boiled)', calories: 78, protein: 2, carbs: 17, fat: 0.1, servingSize: 150, category: 'Carbs' },
  { id: 'f21', name: 'Quinoa (cooked)', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, servingSize: 180, category: 'Carbs' },
  { id: 'f22', name: 'Corn Tortilla', calories: 218, protein: 5.7, carbs: 46, fat: 3, servingSize: 30, category: 'Carbs' },
  // Fruits
  { id: 'f23', name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 120, category: 'Fruit' },
  { id: 'f24', name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 150, category: 'Fruit' },
  { id: 'f25', name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: 150, category: 'Fruit' },
  { id: 'f26', name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, servingSize: 100, category: 'Fruit' },
  { id: 'f27', name: 'Strawberries', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, servingSize: 150, category: 'Fruit' },
  { id: 'f28', name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: 150, category: 'Fruit' },
  // Vegetables
  { id: 'f29', name: 'Broccoli (cooked)', calories: 35, protein: 2.4, carbs: 7, fat: 0.4, servingSize: 150, category: 'Vegetables' },
  { id: 'f30', name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: 60, category: 'Vegetables' },
  { id: 'f31', name: 'Carrot (raw)', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: 100, category: 'Vegetables' },
  { id: 'f32', name: 'Capsicum (raw)', calories: 31, protein: 1, carbs: 6, fat: 0.3, servingSize: 100, category: 'Vegetables' },
  { id: 'f33', name: 'Cucumber (raw)', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: 100, category: 'Vegetables' },
  { id: 'f34', name: 'Tomato (raw)', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: 120, category: 'Vegetables' },
  { id: 'f35', name: 'Asparagus (cooked)', calories: 22, protein: 2.4, carbs: 4.1, fat: 0.2, servingSize: 100, category: 'Vegetables' },
  { id: 'f36', name: 'Zucchini (cooked)', calories: 17, protein: 1.2, carbs: 3.5, fat: 0.3, servingSize: 150, category: 'Vegetables' },
  // Dairy
  { id: 'f37', name: 'Whole Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, servingSize: 250, category: 'Dairy' },
  { id: 'f38', name: 'Skim Milk', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, servingSize: 250, category: 'Dairy' },
  { id: 'f39', name: 'Cheddar Cheese', calories: 402, protein: 25, carbs: 1.3, fat: 33, servingSize: 30, category: 'Dairy' },
  { id: 'f40', name: 'Mozzarella', calories: 280, protein: 28, carbs: 2.2, fat: 17, servingSize: 50, category: 'Dairy' },
  { id: 'f41', name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, servingSize: 10, category: 'Dairy' },
  // Fats & Nuts
  { id: 'f42', name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: 10, category: 'Fats' },
  { id: 'f43', name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: 30, category: 'Fats' },
  { id: 'f44', name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: 32, category: 'Fats' },
  { id: 'f45', name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, servingSize: 150, category: 'Fats' },
  { id: 'f46', name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: 30, category: 'Fats' },
  { id: 'f47', name: 'Cashews', calories: 553, protein: 18, carbs: 30, fat: 44, servingSize: 30, category: 'Fats' },
  { id: 'f48', name: 'Coconut Oil', calories: 862, protein: 0, carbs: 0, fat: 100, servingSize: 10, category: 'Fats' },
  // Legumes
  { id: 'f49', name: 'Chickpeas (cooked)', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, servingSize: 150, category: 'Legumes' },
  { id: 'f50', name: 'Black Beans (cooked)', calories: 132, protein: 8.9, carbs: 24, fat: 0.5, servingSize: 150, category: 'Legumes' },
  { id: 'f51', name: 'Lentils (cooked)', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: 150, category: 'Legumes' },
  { id: 'f52', name: 'Edamame (cooked)', calories: 122, protein: 11, carbs: 9.9, fat: 5.2, servingSize: 100, category: 'Legumes' },
  // Snacks & Other
  { id: 'f53', name: 'Dark Chocolate (70%)', calories: 598, protein: 7.8, carbs: 46, fat: 43, servingSize: 30, category: 'Snacks' },
  { id: 'f54', name: 'Rice Cakes (plain)', calories: 387, protein: 8, carbs: 81, fat: 3, servingSize: 20, category: 'Snacks' },
  { id: 'f55', name: 'Granola Bar', calories: 471, protein: 7, carbs: 64, fat: 20, servingSize: 40, category: 'Snacks' },
  { id: 'f56', name: 'Hummus', calories: 166, protein: 8, carbs: 14, fat: 10, servingSize: 50, category: 'Snacks' },
  { id: 'f57', name: 'Protein Bar (avg)', calories: 350, protein: 20, carbs: 35, fat: 10, servingSize: 60, category: 'Snacks' },
  // Beverages
  { id: 'f58', name: 'Orange Juice', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, servingSize: 250, category: 'Beverages' },
  { id: 'f59', name: 'Coffee (black)', calories: 2, protein: 0.3, carbs: 0, fat: 0, servingSize: 240, category: 'Beverages' },
  { id: 'f60', name: 'Protein Shake (with milk)', calories: 200, protein: 25, carbs: 15, fat: 5, servingSize: 350, category: 'Beverages' },
  // Cereals & Breakfast
  { id: 'f61', name: 'Weet-Bix (2 biscuits)', calories: 340, protein: 11, carbs: 67, fat: 1.5, servingSize: 30, category: 'Cereals' },
  { id: 'f62', name: 'Rolled Oats (dry, 100g)', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, servingSize: 100, category: 'Cereals' },
  { id: 'f63', name: 'Muesli (toasted)', calories: 400, protein: 9, carbs: 62, fat: 12, servingSize: 60, category: 'Cereals' },
  { id: 'f64', name: 'Corn Flakes', calories: 357, protein: 7, carbs: 84, fat: 0.9, servingSize: 30, category: 'Cereals' },
  { id: 'f65', name: 'All-Bran', calories: 290, protein: 13, carbs: 46, fat: 3, servingSize: 45, category: 'Cereals' },
  { id: 'f66', name: 'Special K', calories: 378, protein: 17, carbs: 72, fat: 1.3, servingSize: 30, category: 'Cereals' },
  { id: 'f67', name: 'Granola (100g)', calories: 471, protein: 8, carbs: 64, fat: 20, servingSize: 60, category: 'Cereals' },
  // Additional Dairy
  { id: 'f68', name: 'Almond Milk (unsweetened)', calories: 15, protein: 0.6, carbs: 0.3, fat: 1.2, servingSize: 250, category: 'Dairy' },
  { id: 'f69', name: 'Full Fat Milk (250ml)', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, servingSize: 250, category: 'Dairy' },
  // Additional Proteins
  { id: 'f70', name: 'Chicken Thigh (cooked)', calories: 209, protein: 26, carbs: 0, fat: 11, servingSize: 150, category: 'Protein' },
  { id: 'f71', name: 'Pork Tenderloin (cooked)', calories: 143, protein: 26, carbs: 0, fat: 3.5, servingSize: 150, category: 'Protein' },
  { id: 'f72', name: 'Tempeh', calories: 195, protein: 19, carbs: 9, fat: 11, servingSize: 100, category: 'Protein' },
  { id: 'f73', name: 'Casein Protein (30g)', calories: 110, protein: 24, carbs: 3, fat: 1, servingSize: 30, category: 'Protein' },
  { id: 'f74', name: 'Salmon Fillet (150g)', calories: 208, protein: 28, carbs: 0, fat: 10, servingSize: 150, category: 'Protein' },
  // Additional Carbs
  { id: 'f75', name: 'Couscous (cooked, 100g)', calories: 112, protein: 3.8, carbs: 23, fat: 0.2, servingSize: 100, category: 'Carbs' },
  { id: 'f76', name: 'Potato (boiled, 100g)', calories: 78, protein: 2, carbs: 17, fat: 0.1, servingSize: 100, category: 'Carbs' },
  // Additional Vegetables
  { id: 'f77', name: 'Kale (raw)', calories: 49, protein: 4.3, carbs: 9, fat: 0.9, servingSize: 60, category: 'Vegetables' },
  { id: 'f78', name: 'Mushrooms (raw)', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, servingSize: 100, category: 'Vegetables' },
  { id: 'f79', name: 'Onion (raw)', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, servingSize: 80, category: 'Vegetables' },
  // Additional Fruits
  { id: 'f80', name: 'Grapes (100g)', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, servingSize: 100, category: 'Fruit' },
  { id: 'f81', name: 'Watermelon (100g)', calories: 30, protein: 0.6, carbs: 7.5, fat: 0.2, servingSize: 200, category: 'Fruit' },
  { id: 'f82', name: 'Pineapple (100g)', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, servingSize: 120, category: 'Fruit' },
  // Additional Snacks
  { id: 'f83', name: 'Almond Butter (1 tbsp)', calories: 614, protein: 21, carbs: 19, fat: 56, servingSize: 16, category: 'Snacks' },
  { id: 'f84', name: 'Mixed Nuts (30g)', calories: 607, protein: 15, carbs: 21, fat: 54, servingSize: 30, category: 'Snacks' },
  { id: 'f85', name: 'Honey (1 tbsp)', calories: 304, protein: 0.3, carbs: 82, fat: 0, servingSize: 21, category: 'Snacks' },
  { id: 'f86', name: 'Whey Protein (30g serving)', calories: 120, protein: 25, carbs: 3, fat: 2, servingSize: 30, category: 'Snacks' },
  // Meals / Fast Food
  { id: 'f87', name: 'Chicken & Rice (meal)', calories: 186, protein: 20, carbs: 17, fat: 4, servingSize: 350, category: 'Meals' },
  { id: 'f88', name: 'Steak & Veggies (meal)', calories: 200, protein: 28, carbs: 8, fat: 7, servingSize: 400, category: 'Meals' },
  { id: 'f89', name: 'Spaghetti Bolognese', calories: 180, protein: 12, carbs: 22, fat: 5, servingSize: 350, category: 'Meals' },
  { id: 'f90', name: 'Fish & Chips', calories: 230, protein: 12, carbs: 27, fat: 8, servingSize: 400, category: 'Meals' },
  { id: 'f91', name: 'Caesar Salad (250g)', calories: 150, protein: 8, carbs: 9, fat: 10, servingSize: 250, category: 'Meals' },
  { id: 'f92', name: 'Sushi Roll (6 pieces)', calories: 200, protein: 9, carbs: 35, fat: 2, servingSize: 180, category: 'Meals' },
]
