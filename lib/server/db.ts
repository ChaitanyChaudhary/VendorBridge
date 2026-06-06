import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __vendorbridgePool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __vendorbridgeSchemaReady: Promise<void> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Create a local PostgreSQL database and set DATABASE_URL.");
}

export const pool =
  global.__vendorbridgePool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== "production") {
  global.__vendorbridgePool = pool;
}

export async function query<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = []
) {
  return pool.query<Row>(text, values);
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    avatar_grayscale BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    rating NUMERIC(3,2) NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    country TEXT NOT NULL,
    gst_number TEXT NOT NULL DEFAULT '',
    registered_date DATE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rfqs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    deadline DATE NOT NULL,
    status TEXT NOT NULL,
    items JSONB NOT NULL,
    selected_suppliers TEXT[] NOT NULL DEFAULT '{}',
    created_at DATE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quotations (
    id TEXT PRIMARY KEY,
    rfq_id TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    items JSONB NOT NULL,
    delivery_time TEXT NOT NULL,
    payment_terms TEXT NOT NULL,
    additional_remarks TEXT NOT NULL,
    status TEXT NOT NULL,
    submitted_at DATE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    rfq_id TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    rfq_title TEXT NOT NULL,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    stage TEXT NOT NULL,
    comments JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    rfq_id TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    vendor_email TEXT NOT NULL,
    vendor_phone TEXT NOT NULL,
    vendor_address TEXT NOT NULL,
    vendor_country TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    status TEXT NOT NULL,
    date DATE NOT NULL,
    items JSONB NOT NULL,
    invoice_number TEXT NOT NULL DEFAULT '',
    invoice_status TEXT NOT NULL DEFAULT 'Not Generated',
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    details TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS forgot_password_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
  );
`;

export async function ensureSchema() {
  if (!global.__vendorbridgeSchemaReady) {
    global.__vendorbridgeSchemaReady = query(SCHEMA_SQL).then(() => undefined).catch((err) => {
      // Clear the cached promise so the next request retries instead of permanently failing
      global.__vendorbridgeSchemaReady = undefined;
      throw err;
    });
  }

  return global.__vendorbridgeSchemaReady;
}
