-- Database Security Setup Script
-- Run as database administrator (postgres user)
-- Purpose: Restrict application user permissions and enable security features

-- ============================================================================
-- 1. CREATE RESTRICTED APPLICATION USER
-- ============================================================================

-- Create application user with strong password
-- IMPORTANT: Change 'CHANGE_ME_STRONG_PASSWORD' to a secure password
CREATE USER lockwise_app WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';

-- ============================================================================
-- 2. GRANT MINIMAL REQUIRED PERMISSIONS
-- ============================================================================

-- Allow connection to database
GRANT CONNECT ON DATABASE lockwise TO lockwise_app;

-- Allow usage of public schema
GRANT USAGE ON SCHEMA public TO lockwise_app;

-- Grant DML permissions (SELECT, INSERT, UPDATE, DELETE) on all existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lockwise_app;

-- Grant sequence permissions (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lockwise_app;

-- ============================================================================
-- 3. REVOKE DANGEROUS PERMISSIONS
-- ============================================================================

-- Prevent schema modifications
REVOKE CREATE ON SCHEMA public FROM lockwise_app;

-- Prevent table drops
REVOKE DROP ON ALL TABLES IN SCHEMA public FROM lockwise_app;

-- Prevent table truncation
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM lockwise_app;

-- Prevent ALTER TABLE
REVOKE ALTER ON ALL TABLES IN SCHEMA public FROM lockwise_app;

-- ============================================================================
-- 4. SET UP PERMISSIONS FOR FUTURE TABLES
-- ============================================================================

-- Grant DML permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lockwise_app;

-- Grant sequence permissions on future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT USAGE, SELECT ON SEQUENCES TO lockwise_app;

-- ============================================================================
-- 5. ENABLE SSL (if not already enabled)
-- ============================================================================

-- Enable SSL at system level
-- Note: Requires server restart
ALTER SYSTEM SET ssl = on;

-- Verify SSL configuration
SHOW ssl;

-- ============================================================================
-- 6. OPTIONAL: ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on multi-tenant tables
-- Uncomment if you want database-level isolation

-- ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE units ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create estate isolation policy
-- Uncomment if RLS is enabled

-- CREATE POLICY estate_isolation ON residents
--   USING (estate_id = current_setting('app.current_estate_id', true)::uuid);

-- CREATE POLICY estate_isolation ON units
--   USING (estate_id = current_setting('app.current_estate_id', true)::uuid);

-- CREATE POLICY estate_isolation ON access_logs
--   USING (estate_id = current_setting('app.current_estate_id', true)::uuid);

-- CREATE POLICY estate_isolation ON payments
--   USING (estate_id = current_setting('app.current_estate_id', true)::uuid);

-- CREATE POLICY estate_isolation ON subscriptions
--   USING (estate_id = current_setting('app.current_estate_id', true)::uuid);

-- ============================================================================
-- 7. OPTIONAL: CREATE AUDIT TRIGGERS
-- ============================================================================

-- Create audit trigger function
-- Uncomment if you want automatic audit logging

-- CREATE OR REPLACE FUNCTION audit_trigger_func()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO audit_logs (
--     user_id,
--     method,
--     path,
--     status_code,
--     request_body,
--     response_body,
--     created_at
--   )
--   VALUES (
--     current_setting('app.current_user_id', true)::uuid,
--     TG_OP,
--     TG_TABLE_NAME,
--     200,
--     row_to_json(OLD)::text,
--     row_to_json(NEW)::text,
--     NOW()
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Attach triggers to sensitive tables
-- Uncomment if audit triggers are needed

-- CREATE TRIGGER audit_payments
--   AFTER INSERT OR UPDATE OR DELETE ON payments
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- CREATE TRIGGER audit_subscriptions
--   AFTER INSERT OR UPDATE OR DELETE ON subscriptions
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- CREATE TRIGGER audit_users
--   AFTER UPDATE OR DELETE ON users
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 8. VERIFY PERMISSIONS
-- ============================================================================

-- Check granted permissions
SELECT 
  grantee, 
  table_schema,
  table_name,
  privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = 'lockwise_app'
ORDER BY table_name, privilege_type;

-- Check user attributes
SELECT 
  usename,
  usecreatedb,
  usesuper,
  userepl
FROM pg_user
WHERE usename = 'lockwise_app';

-- Expected output:
-- usecreatedb: f (false)
-- usesuper: f (false)
-- userepl: f (false)

-- ============================================================================
-- 9. UPDATE APPLICATION CONFIGURATION
-- ============================================================================

-- After running this script, update your .env.production file:
-- 
-- OLD:
-- DATABASE_URL=postgresql://postgres:password@host:5432/lockwise?sslmode=require
-- 
-- NEW:
-- DATABASE_URL=postgresql://lockwise_app:CHANGE_ME_STRONG_PASSWORD@host:5432/lockwise?sslmode=require
-- DB_SSL=true

-- ============================================================================
-- 10. TEST CONNECTION
-- ============================================================================

-- Test connection with new user (run from command line):
-- psql "postgresql://lockwise_app:CHANGE_ME_STRONG_PASSWORD@host:5432/lockwise?sslmode=require"

-- Test permissions:
-- SELECT * FROM residents LIMIT 1;  -- Should work
-- DROP TABLE residents;             -- Should fail
-- CREATE TABLE test (id INT);       -- Should fail
-- TRUNCATE residents;                -- Should fail

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- If you need to undo these changes:
-- DROP USER lockwise_app;
-- ALTER SYSTEM RESET ssl;

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. This script creates a restricted user with minimal permissions
-- 2. The user can only perform DML operations (SELECT, INSERT, UPDATE, DELETE)
-- 3. The user cannot modify schema (CREATE, DROP, ALTER, TRUNCATE)
-- 4. SSL is enabled for encrypted connections
-- 5. RLS and audit triggers are optional (commented out)
-- 6. Application-level isolation is already implemented and working
-- 7. RLS adds defense in depth but may impact performance

-- ============================================================================
-- SECURITY CHECKLIST
-- ============================================================================

-- [ ] Changed default password to strong password
-- [ ] Verified permissions are correct
-- [ ] Updated DATABASE_URL in .env.production
-- [ ] Tested connection with new user
-- [ ] Verified application can read/write data
-- [ ] Verified application cannot drop tables
-- [ ] Documented password in secure location
-- [ ] Set calendar reminder to rotate password in 90 days
