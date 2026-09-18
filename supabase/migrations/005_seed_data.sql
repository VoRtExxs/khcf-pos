-- Migration: 005_seed_data
-- Purpose: Pre-populate categories and initial items

DO $$ 
DECLARE 
  cat_clothing uuid := gen_random_uuid();
  cat_ceramics uuid := gen_random_uuid();
  cat_accessories uuid := gen_random_uuid();
  cat_stationery uuid := gen_random_uuid();
  cat_home_decor uuid := gen_random_uuid();
BEGIN
  -- Insert Categories
  insert into public.categories (id, name) values 
    (cat_clothing, 'Clothing'),
    (cat_ceramics, 'Ceramics'),
    (cat_accessories, 'Accessories'),
    (cat_stationery, 'Stationery'),
    (cat_home_decor, 'Home Decor');

  -- Insert Clothing Items
  insert into public.items (name, category_id, price, image_color) values
    ('T-shirt White - Life', cat_clothing, 10, 'bg-cyan-100'),
    ('T-shirt Black - Strength', cat_clothing, 10, 'bg-gray-800'),
    ('Hoodie White - Love', cat_clothing, 20, 'bg-gray-100'),
    ('Hoodie Black - Determination', cat_clothing, 20, 'bg-gray-900'),
    ('Onesie White - Joy', cat_clothing, 12, 'bg-white');

  -- Insert Ceramics
  insert into public.items (name, category_id, price, image_color) values
    ('Ceramic Plant Pot - Pink', cat_ceramics, 10, 'bg-pink-200'),
    ('Ceramic Tray - Hatta', cat_ceramics, 60, 'bg-red-200'),
    ('Mug - Superhero', cat_ceramics, 3, 'bg-blue-200'),
    ('Travel Mug - Coffee', cat_ceramics, 5, 'bg-orange-100');

  -- Insert Accessories
  insert into public.items (name, category_id, price, image_color) values
    ('Plexi Box - Flowers', cat_accessories, 15, 'bg-purple-100'),
    ('Pouch - Happiness', cat_accessories, 10, 'bg-pink-100'),
    ('Heat Pack - Love', cat_accessories, 20, 'bg-red-300'),
    ('Tote Bag - Olive Tree', cat_accessories, 10, 'bg-green-100'),
    ('Silver Bracelet - Hope', cat_accessories, 10, 'bg-gray-200');

  -- Insert Stationery
  insert into public.items (name, category_id, price, image_color) values
    ('Notebook - Courage', cat_stationery, 5, 'bg-pink-400'),
    ('Coloring Book', cat_stationery, 3, 'bg-yellow-100'),
    ('Puzzle', cat_stationery, 7, 'bg-blue-300');

  -- Insert Home Decor
  insert into public.items (name, category_id, price, image_color) values
    ('Wooden Table - Hatta', cat_home_decor, 50, 'bg-red-500'),
    ('Cushion - Eyes', cat_home_decor, 10, 'bg-indigo-100'),
    ('Lampshade - Mosque', cat_home_decor, 30, 'bg-yellow-200');
END $$;
