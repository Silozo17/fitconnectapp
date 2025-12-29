-- Add source and food_type columns to food_diary for tracking data origin
ALTER TABLE food_diary 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS food_type TEXT DEFAULT 'product',
ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC;

-- Add comments for clarity
COMMENT ON COLUMN food_diary.source IS 'Data source: manual, openfoodfacts, calorieninjas, custom';
COMMENT ON COLUMN food_diary.food_type IS 'Type of food: product (branded), generic, recipe, custom';
COMMENT ON COLUMN food_diary.sodium_mg IS 'Sodium content in milligrams';

-- Add source column to foods_autocomplete for caching CalorieNinjas results
ALTER TABLE foods_autocomplete 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'openfoodfacts';