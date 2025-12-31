-- Update all coach badges from .png to .webp
UPDATE badges
SET image_url = REPLACE(image_url, '.png', '.webp')
WHERE image_url LIKE '%coach-badges%'
  AND image_url LIKE '%.png';