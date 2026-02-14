-- Remove unused columns from access_logs table
ALTER TABLE access_logs DROP COLUMN IF EXISTS gate_id;
ALTER TABLE access_logs DROP COLUMN IF EXISTS is_multi_entry;
ALTER TABLE access_logs DROP COLUMN IF EXISTS used_entries;
ALTER TABLE access_logs DROP COLUMN IF EXISTS verification_method;
