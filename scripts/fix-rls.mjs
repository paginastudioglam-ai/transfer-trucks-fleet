import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf8");
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim() : null;
};

const pw = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const ref = new URL(getEnv("NEXT_PUBLIC_SUPABASE_URL")).hostname.split(".")[0];

const sql = `
DROP POLICY IF EXISTS "Authenticated full access" ON trucks;
DROP POLICY IF EXISTS "Authenticated full access" ON clients;
DROP POLICY IF EXISTS "Authenticated full access" ON rentals;
DROP POLICY IF EXISTS "Authenticated full access" ON payments;
DROP POLICY IF EXISTS "Authenticated full access" ON maintenance_records;

CREATE POLICY "Admin full access" ON trucks FOR ALL TO authenticated
  USING (auth.email() = 'ivanimac4826@gmail.com')
  WITH CHECK (auth.email() = 'ivanimac4826@gmail.com');
CREATE POLICY "Admin full access" ON clients FOR ALL TO authenticated
  USING (auth.email() = 'ivanimac4826@gmail.com')
  WITH CHECK (auth.email() = 'ivanimac4826@gmail.com');
CREATE POLICY "Admin full access" ON rentals FOR ALL TO authenticated
  USING (auth.email() = 'ivanimac4826@gmail.com')
  WITH CHECK (auth.email() = 'ivanimac4826@gmail.com');
CREATE POLICY "Admin full access" ON payments FOR ALL TO authenticated
  USING (auth.email() = 'ivanimac4826@gmail.com')
  WITH CHECK (auth.email() = 'ivanimac4826@gmail.com');
CREATE POLICY "Admin full access" ON maintenance_records FOR ALL TO authenticated
  USING (auth.email() = 'ivanimac4826@gmail.com')
  WITH CHECK (auth.email() = 'ivanimac4826@gmail.com');
`;

import pg from "pg";
const pool = new pg.Pool({
  host: "aws-0-us-east-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: `postgres.${ref}`,
  password: pw,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log("✅ RLS políticas actualizadas - solo ivanimac4826@gmail.com");
} catch (e) {
  console.error("RLS error:", e.message);
} finally {
  await pool.end();
}
