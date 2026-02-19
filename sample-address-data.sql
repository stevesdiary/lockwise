-- Sample streets and units for estate 1b85056f-dff8-4492-af72-d8e32fab1fb9

-- Insert sample streets
INSERT INTO streets (street_id, estate_id, name, created_at, updated_at) VALUES
(gen_random_uuid(), '1b85056f-dff8-4492-af72-d8e32fab1fb9', 'Maple Street', NOW(), NOW()),
(gen_random_uuid(), '1b85056f-dff8-4492-af72-d8e32fab1fb9', 'Oak Avenue', NOW(), NOW()),
(gen_random_uuid(), '1b85056f-dff8-4492-af72-d8e32fab1fb9', 'Pine Close', NOW(), NOW()),
(gen_random_uuid(), '1b85056f-dff8-4492-af72-d8e32fab1fb9', 'Cedar Drive', NOW(), NOW()),
(gen_random_uuid(), '1b85056f-dff8-4492-af72-d8e32fab1fb9', 'Birch Lane', NOW(), NOW());

-- Insert sample units for Maple Street
INSERT INTO units (id, street_id, unit_identifier, block, floor, unit_type, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.street_id,
  'Block A' || i || 'F' || j,
  'A',
  j,
  'apartment',
  'vacant',
  NOW(),
  NOW()
FROM streets s
CROSS JOIN generate_series(1, 10) i
CROSS JOIN generate_series(1, 3) j
WHERE s.name = 'Maple Street' AND s.estate_id = '1b85056f-dff8-4492-af72-d8e32fab1fb9';

-- Insert sample units for Oak Avenue
INSERT INTO units (id, street_id, unit_identifier, block, floor, unit_type, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.street_id,
  'Block B' || i || 'F' || j,
  'B',
  j,
  'apartment',
  'vacant',
  NOW(),
  NOW()
FROM streets s
CROSS JOIN generate_series(1, 8) i
CROSS JOIN generate_series(1, 4) j
WHERE s.name = 'Oak Avenue' AND s.estate_id = '1b85056f-dff8-4492-af72-d8e32fab1fb9';

-- Insert sample units for Pine Close (Houses)
INSERT INTO units (id, street_id, unit_identifier, unit_type, unit_details, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.street_id,
  'House ' || i,
  'house',
  jsonb_build_object('house_number', i::text, 'plot_number', 'Plot-' || i),
  'vacant',
  NOW(),
  NOW()
FROM streets s
CROSS JOIN generate_series(1, 15) i
WHERE s.name = 'Pine Close' AND s.estate_id = '1b85056f-dff8-4492-af72-d8e32fab1fb9';