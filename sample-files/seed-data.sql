-- Sample data for easier onboarding and testing
-- Run this after migrations to populate initial data

-- Insert sample admin user
INSERT INTO users (id, first_name, last_name, email, phone, password, role, is_verified, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Admin', 'User', 'admin@lockwise.com', '+2348012345678', '$2b$12$LQv3c1yqBwlVHpPjrPyFUOeCjNx/RjdMaZXvstqmb.vQSO8qHDtCu', 'admin', true, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Manager', 'User', 'manager@lockwise.com', '+2348023456789', '$2b$12$LQv3c1yqBwlVHpPjrPyFUOeCjNx/RjdMaZXvstqmb.vQSO8qHDtCu', 'manager', true, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Resident', 'User', 'resident@lockwise.com', '+2348034567890', '$2b$12$LQv3c1yqBwlVHpPjrPyFUOeCjNx/RjdMaZXvstqmb.vQSO8qHDtCu', 'resident', true, NOW());

-- Insert sample estate
INSERT INTO estates (id, name, address, city, state, postal_code, country, manager_email, manager_phone, total_units, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Demo Estate', '123 Demo Street', 'Lagos', 'Lagos State', '100001', 'Nigeria', 'manager@lockwise.com', '+2348023456789', 100, NOW());

-- Update users with estate_id
UPDATE users SET estate_id = '660e8400-e29b-41d4-a716-446655440000' WHERE email IN ('manager@lockwise.com', 'resident@lockwise.com');

-- Insert sample access codes
INSERT INTO access_codes (id, user_id, guest_name, guest_phone, code, expires_at, access_type, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'John Visitor', '+2348045678901', 'DEMO001', NOW() + INTERVAL '1 day', 'visitor', NOW()),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Jane Contractor', '+2348056789012', 'DEMO002', NOW() + INTERVAL '3 days', 'contractor', NOW());

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Welcome to Lockwise', 'Your admin account has been created successfully', 'system', false, NOW()),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Manager Access Granted', 'You have been assigned as estate manager', 'system', false, NOW()),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Resident Account Active', 'Welcome to Demo Estate community', 'system', false, NOW());

-- Insert sample API key for testing
INSERT INTO api_keys (id, name, key_hash, permissions, created_by, is_active, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440000', 'Demo API Key', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', ARRAY['read', 'write'], '550e8400-e29b-41d4-a716-446655440000', true, NOW());

-- Note: Default password for all demo users is 'password123'
-- API Key for testing: 'demo-api-key-for-testing-only'