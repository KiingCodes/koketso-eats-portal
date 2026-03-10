
-- Make kiingncube@gmail.com admin
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = 'abd5e244-4fba-4a49-890d-9df2c35681cf';

-- Add new categories
INSERT INTO public.categories (name, sort_order, description) VALUES
  ('Main Meals', 1, 'Hearty main meals served with sides'),
  ('Chips & Sides', 5, 'Chips, fries and side dishes'),
  ('Breakfast', 6, 'Morning breakfast meals')
ON CONFLICT DO NOTHING;

-- Update existing category sort orders
UPDATE public.categories SET sort_order = 2 WHERE name = 'Burgers';
UPDATE public.categories SET sort_order = 3 WHERE name = 'Stews';
UPDATE public.categories SET sort_order = 4 WHERE name = 'Traditional';
UPDATE public.categories SET sort_order = 7 WHERE name = 'Pastas';
UPDATE public.categories SET sort_order = 8 WHERE name = 'Breads';
UPDATE public.categories SET sort_order = 9 WHERE name = 'Cakes';
UPDATE public.categories SET sort_order = 10 WHERE name = 'Beverages';
UPDATE public.categories SET sort_order = 11 WHERE name = 'Specials';

-- Update existing product prices to match menu card
UPDATE public.products SET price = 110.00, description = 'Served with Pap & Salads' WHERE name = 'Beef Stew & Pap';
UPDATE public.products SET price = 75.00, name = 'Beef Burger', description = 'Classic beef patty burger' WHERE name = 'Classic Beef Burger';
UPDATE public.products SET price = 70.00, description = 'Crispy chicken burger' WHERE name = 'Chicken Burger';
UPDATE public.products SET price = 110.00, name = 'Double Burger', description = 'Double stacked burger' WHERE name = 'Double Stack Burger';
UPDATE public.products SET price = 85.00, description = 'Hearty chicken curry served with rice' WHERE name = 'Chicken Curry & Rice';
UPDATE public.products SET price = 110.00, description = 'Tender slow-cooked lamb stew' WHERE name = 'Lamb Stew';

-- Insert new products: Main Meals
INSERT INTO public.products (name, description, price, in_stock, category_id) VALUES
  ('Fried Chicken Meal', 'Served with Pap & Fresh Salads', 95.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Braai Chicken Meal', 'Grilled chicken served with Pap & Chakalaka', 105.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Beef Skewers', 'Beef Schew served with Pap or Chips', 120.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Fried Rice - Chicken', 'Chicken fried rice', 85.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Fried Rice - Beef', 'Beef fried rice', 90.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Fried Rice - Mixed', 'Mixed fried rice', 95.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Pork Ribs', 'Grilled & Basted pork ribs', 135.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Fried Fish', 'Served with Pap or Chips', 110.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Grilled Fish', 'Served with Pap or Chips', 120.00, true, (SELECT id FROM categories WHERE name = 'Main Meals')),
  ('Kota', 'Street Sandwich Special - Loaded Kota', 70.00, true, (SELECT id FROM categories WHERE name = 'Main Meals'));

-- Insert new products: Burgers
INSERT INTO public.products (name, description, price, in_stock, category_id) VALUES
  ('Cheese Burger', 'Beef patty with melted cheese', 85.00, true, (SELECT id FROM categories WHERE name = 'Burgers'));

-- Insert new products: Chips & Sides
INSERT INTO public.products (name, description, price, in_stock, category_id) VALUES
  ('Regular Chips', 'Classic French fries', 40.00, true, (SELECT id FROM categories WHERE name = 'Chips & Sides')),
  ('Loaded Chips', 'Loaded fries with toppings', 60.00, true, (SELECT id FROM categories WHERE name = 'Chips & Sides'));

-- Insert new products: Breakfast
INSERT INTO public.products (name, description, price, in_stock, category_id) VALUES
  ('Egg & Bacon Sandwich', 'Breakfast sandwich with egg and bacon', 55.00, true, (SELECT id FROM categories WHERE name = 'Breakfast'));

-- Update Breakfast Combo to Breakfast category
UPDATE public.products SET category_id = (SELECT id FROM categories WHERE name = 'Breakfast'), price = 95.00 WHERE name = 'Breakfast Combo';

-- Insert new products: Bakery (Breads category)
INSERT INTO public.products (name, description, price, in_stock, category_id) VALUES
  ('Croissants', 'Freshly baked butter croissants', 25.00, true, (SELECT id FROM categories WHERE name = 'Breads')),
  ('Muffins', 'Assorted freshly baked muffins', 20.00, true, (SELECT id FROM categories WHERE name = 'Breads')),
  ('Doughnuts', 'Glazed and assorted doughnuts', 15.00, true, (SELECT id FROM categories WHERE name = 'Breads'));

-- Insert new products: Beverages
INSERT INTO public.products (name, description, price, in_stock, category_id) VALUES
  ('Coffee', 'Hot or Iced coffee', 25.00, true, (SELECT id FROM categories WHERE name = 'Beverages')),
  ('Tea', 'Hot brewed tea', 15.00, true, (SELECT id FROM categories WHERE name = 'Beverages')),
  ('Cold Drinks', 'Assorted cold beverages', 20.00, true, (SELECT id FROM categories WHERE name = 'Beverages')),
  ('Milkshakes', 'Chocolate, Strawberry, or Vanilla', 35.00, true, (SELECT id FROM categories WHERE name = 'Beverages'));

-- Move existing stew items to Stews, traditional to Main Meals
UPDATE public.products SET category_id = (SELECT id FROM categories WHERE name = 'Main Meals') WHERE name = 'Chicken Curry & Rice';
UPDATE public.products SET category_id = (SELECT id FROM categories WHERE name = 'Main Meals') WHERE name = 'Sunday Roast Platter';
