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

-- Demo lease records: only populate tenants that do not already have a contract.
INSERT INTO contracts (tenant_id, property_id, unit_id, start_date, end_date, monthly_rent, security_deposit, billing_day, status, notes, created_at, updated_at)
SELECT t.id, t.property_id, t.unit_id,
       date('now','start of month','-6 months'),
       date('now','start of month','+12 months'),
       t.monthly_rent, t.monthly_rent * 2, 1 + (t.id % 28), 'active',
       'Demo lease data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenants t
WHERE t.monthly_rent IS NOT NULL AND t.status <> 'former'
  AND NOT EXISTS (SELECT 1 FROM contracts c WHERE c.tenant_id = t.id)
ORDER BY t.id
LIMIT 18;

-- A few draft leases make the contract status filter useful in a fresh demo database.
INSERT INTO contracts (tenant_id, property_id, unit_id, start_date, end_date, monthly_rent, security_deposit, billing_day, status, notes, created_at, updated_at)
SELECT t.id, t.property_id, t.unit_id,
       date('now','start of month'), date('now','start of month','+12 months'),
       t.monthly_rent, t.monthly_rent * 2, 1 + (t.id % 28), 'draft',
       'Demo draft lease', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenants t
WHERE t.monthly_rent IS NOT NULL AND t.status <> 'former'
  AND NOT EXISTS (SELECT 1 FROM contracts c WHERE c.tenant_id = t.id)
ORDER BY t.id
LIMIT 3;

-- Four months of demo bills per active lease, with a mix of paid, partial and overdue states.
WITH RECURSIVE months(offset) AS (
 SELECT 0 UNION ALL SELECT offset + 1 FROM months WHERE offset < 3
)
INSERT OR IGNORE INTO bills
 (contract_id, tenant_id, billing_period, due_date, amount, late_fee, amount_paid, status, issued_at, paid_at, payment_method, payment_reference, notes, created_at, updated_at)
SELECT c.id, c.tenant_id,
       strftime('%Y-%m', date('now','start of month', printf('-%d months', months.offset))),
       date(date('now','start of month', printf('-%d months', months.offset)), printf('+%d days', c.billing_day - 1)),
       c.monthly_rent, 0,
       CASE
         WHEN months.offset >= 2 THEN c.monthly_rent
         WHEN months.offset = 1 AND c.id % 4 <> 0 THEN c.monthly_rent
         WHEN months.offset = 0 AND c.id % 5 = 0 THEN ROUND(c.monthly_rent / 2.0, 2)
         ELSE 0
       END,
       CASE
         WHEN months.offset >= 2 THEN 'paid'
         WHEN months.offset = 1 AND c.id % 4 <> 0 THEN 'paid'
         WHEN months.offset = 0 AND c.id % 5 = 0 THEN 'partial'
         WHEN date(date('now','start of month', printf('-%d months', months.offset)), printf('+%d days', c.billing_day - 1)) < date('now') THEN 'overdue'
         ELSE 'unpaid'
       END,
       date(date('now','start of month', printf('-%d months', months.offset))),
       CASE WHEN months.offset >= 2 OR (months.offset = 1 AND c.id % 4 <> 0) THEN date(date('now','start of month', printf('-%d months', months.offset)), printf('+%d days', c.billing_day - 1)) ELSE NULL END,
       CASE WHEN months.offset >= 2 OR (months.offset = 1 AND c.id % 4 <> 0) THEN 'bank_transfer' ELSE NULL END,
       CASE WHEN months.offset >= 2 OR (months.offset = 1 AND c.id % 4 <> 0) THEN 'DEMO-' || c.id || '-' || strftime('%Y%m', date('now','start of month', printf('-%d months', months.offset))) ELSE NULL END,
       'Demo bill data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM contracts c CROSS JOIN months
WHERE c.status = 'active';
