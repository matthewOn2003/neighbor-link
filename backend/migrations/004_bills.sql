CREATE TABLE IF NOT EXISTS bills (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 contract_id INTEGER NOT NULL,
 tenant_id INTEGER NOT NULL,
 billing_period TEXT NOT NULL,
 due_date TEXT NOT NULL,
 amount REAL NOT NULL,
 late_fee REAL NOT NULL DEFAULT 0,
 amount_paid REAL NOT NULL DEFAULT 0,
 status TEXT NOT NULL DEFAULT 'unpaid',
 issued_at TEXT,
 paid_at TEXT,
 payment_method TEXT,
 payment_reference TEXT,
 notes TEXT,
 created_at DATETIME,
 updated_at DATETIME,
 FOREIGN KEY(contract_id) REFERENCES contracts(id),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id),
 UNIQUE(contract_id, billing_period)
);
CREATE INDEX IF NOT EXISTS idx_bills_tenant_id ON bills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bills_contract_id ON bills(contract_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_billing_period ON bills(billing_period);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
