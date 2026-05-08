-- Migration: seed default admin user
-- Creates the EventGear company + admin user if they don't exist,
-- or resets the admin password if the account already exists.
-- Password: Admin@2026!!  (bcrypt cost=12)

DO $$
DECLARE
  v_company_id TEXT;
BEGIN
  -- 1. Find or create the default company
  SELECT id INTO v_company_id
  FROM "Company"
  WHERE email = 'admin@eventgear.com';

  IF v_company_id IS NULL THEN
    v_company_id := 'cevtgr0000000000000000001';
    INSERT INTO "Company" (id, name, email, "createdAt")
    VALUES (v_company_id, 'EventGear', 'admin@eventgear.com', NOW())
    ON CONFLICT (email) DO NOTHING;

    -- Re-fetch in case of race
    SELECT id INTO v_company_id FROM "Company" WHERE email = 'admin@eventgear.com';
  END IF;

  -- 2. Upsert admin user (reset password if exists)
  INSERT INTO "User" (id, "companyId", name, email, "passwordHash", role, "createdAt", "updatedAt")
  VALUES (
    'cevtgradmin000000000000001',
    v_company_id,
    'Administrador',
    'admin@eventgear.com',
    '$2a$12$h4vPJRwNYNHhc1OycSCjdulz15bfaPkNeFOSBRpnWMXk3WFzW9V6y',
    'ADMIN',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = '$2a$12$h4vPJRwNYNHhc1OycSCjdulz15bfaPkNeFOSBRpnWMXk3WFzW9V6y',
    "updatedAt" = NOW();
END $$;
