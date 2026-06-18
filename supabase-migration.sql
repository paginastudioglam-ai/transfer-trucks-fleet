-- Transfer Trucks Fleet Manager - Database Schema
-- Run this in Supabase SQL Editor

-- 1. TRUCKS
CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_number TEXT NOT NULL UNIQUE,
  vin TEXT,
  make TEXT NOT NULL DEFAULT 'HINO',
  model TEXT,
  year INTEGER,
  box_length TEXT DEFAULT '26ft',
  mileage INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
  weekly_rate DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  insurance_expiry DATE,
  registration_expiry DATE,
  last_service_date DATE,
  next_service_due DATE,
  location TEXT DEFAULT 'Charlotte, NC',
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company_name TEXT,
  license_number TEXT,
  license_expiry DATE,
  insurance_provider TEXT,
  dot_number TEXT,
  client_type TEXT DEFAULT 'owner_operator'
    CHECK (client_type IN ('owner_operator', 'fleet', 'contractor')),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'blacklisted')),
  referral_source TEXT DEFAULT 'web',
  total_rentals INTEGER DEFAULT 0,
  on_time_payment_rate DECIMAL(5,2) DEFAULT 100.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RENTALS
CREATE TABLE IF NOT EXISTS rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id),
  truck_id UUID NOT NULL REFERENCES trucks(id),
  start_date DATE NOT NULL,
  expected_end_date DATE,
  actual_end_date DATE,
  weekly_rate DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2) DEFAULT 0,
  payment_day TEXT DEFAULT 'monday'
    CHECK (payment_day IN ('monday','tuesday','wednesday','thursday','friday')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','active','overdue','completed','terminated')),
  mileage_start INTEGER,
  mileage_end INTEGER,
  documents_signed BOOLEAN DEFAULT false,
  insurance_verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','paid','late','defaulted')),
  method TEXT CHECK (method IN ('cash','zelle','ach','card')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. MAINTENANCE
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN ('oil_change','tires','brakes','engine','body','inspection','other')),
  date DATE NOT NULL,
  mileage INTEGER,
  vendor TEXT,
  cost DECIMAL(10,2),
  next_due_date DATE,
  next_due_mileage INTEGER,
  notes TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_trucks_status ON trucks(status);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_client ON rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_rentals_truck ON rentals(truck_id);
CREATE INDEX IF NOT EXISTS idx_payments_rental ON payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due ON payments(due_date, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_truck ON maintenance_records(truck_id);

-- RLS
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON trucks FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access" ON rentals FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access" ON payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access" ON maintenance_records FOR ALL TO authenticated USING (true);

-- Seed data: camiones de la flota (basado en la info de la web)
INSERT INTO trucks (unit_number, make, model, year, mileage, status, weekly_rate, deposit_amount, location, notes) VALUES
  ('TT-001', 'HINO', '268A', 2022, 45000, 'available', 650.00, 500.00, 'Charlotte, NC', '26ft box truck - clean, well-maintained'),
  ('TT-002', 'HINO', '268A', 2022, 52000, 'available', 650.00, 500.00, 'Charlotte, NC', '26ft box truck - liftgate included'),
  ('TT-003', 'HINO', '268A', 2023, 32000, 'available', 675.00, 500.00, 'Charlotte, NC', '26ft box truck - newer model'),
  ('TT-004', 'HINO', '268A', 2021, 68000, 'maintenance', 625.00, 500.00, 'Charlotte, NC', '26ft box truck - in for oil change'),
  ('TT-005', 'HINO', '268A', 2022, 48000, 'available', 650.00, 500.00, 'Charlotte, NC', '26ft box truck - ready to go'),
  ('TT-006', 'HINO', '268A', 2023, 28000, 'rented', 675.00, 500.00, 'Charlotte, NC', '26ft box truck - currently leased');

-- Seed: algunos clientes de ejemplo
INSERT INTO clients (full_name, email, phone, company_name, client_type, referral_source, total_rentals, on_time_payment_rate) VALUES
  ('D. Sanchez', 'dsanchez@email.com', '980-555-0101', 'Sanchez Contracting', 'contractor', 'referral', 3, 100.00),
  ('R. James', 'rjames@email.com', '980-555-0102', NULL, 'owner_operator', 'web', 5, 95.00),
  ('L. Thomas', 'lthomas@email.com', '980-555-0103', 'Thomas Logistics LLC', 'fleet', 'referral', 2, 100.00);
