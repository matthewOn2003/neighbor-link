CREATE TABLE IF NOT EXISTS contracts (
 id INTEGER PRIMARY KEY AUTOINCREMENT, tenant_id INTEGER NOT NULL, property_id INTEGER, unit_id INTEGER,
 start_date TEXT NOT NULL, end_date TEXT NOT NULL, monthly_rent REAL NOT NULL,
 security_deposit REAL NOT NULL DEFAULT 0, billing_day INTEGER NOT NULL DEFAULT 1,
 status TEXT NOT NULL DEFAULT 'draft', notes TEXT, created_at DATETIME, updated_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);
