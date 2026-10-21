-- 007_operations.sql
-- Operations modules: billing settings, payment proofs, payment records, maintenance requests,
-- and created_at / updated_at columns for tables that lack them.

-- Billing settings (key/value). due_day: day the bill is due; overdue_day: day from which an unpaid bill counts as overdue.
CREATE TABLE IF NOT EXISTS billing_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

INSERT OR IGNORE INTO billing_settings (key, value) VALUES
    ('due_day', '1'),
    ('overdue_day', '8'),
    ('bank_name', ''),
    ('bank_account_no', ''),
    ('bank_account_holder', '');

-- Tenant-submitted proofs of bank transfer, reviewed by admin before they are recorded as payments.
CREATE TABLE IF NOT EXISTS payment_proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL REFERENCES bills(id),
    tenant_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    paid_at TEXT NOT NULL,
    reference TEXT NOT NULL DEFAULT '',
    file_key TEXT NOT NULL DEFAULT '',
    file_url TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    reject_reason TEXT NOT NULL DEFAULT '',
    reviewed_by TEXT NOT NULL DEFAULT '',
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_bill_id ON payment_proofs(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);

-- Payment records. Every recorded payment (admin entry or approved proof) lands here.
-- proof_id is set when the payment came from an approved payment proof.
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    tenant_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL DEFAULT '',
    reference TEXT NOT NULL DEFAULT '',
    paid_at TEXT NOT NULL,
    proof_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);

-- Backfill payment records for bills that already carry a paid amount before this migration.
INSERT INTO payments (bill_id, tenant_id, amount, method, reference, paid_at, created_at)
SELECT id, tenant_id, amount_paid, COALESCE(payment_method, ''), COALESCE(payment_reference, ''),
       COALESCE(paid_at, issued_at, date('now')), CURRENT_TIMESTAMP
FROM bills
WHERE amount_paid > 0;

-- Maintenance requests. tenant_id is reserved for tenant-portal submissions and stays NULL for admin-created requests.
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    unit_id INTEGER,
    tenant_id INTEGER,
    category TEXT NOT NULL DEFAULT 'other',
    priority TEXT NOT NULL DEFAULT 'normal',
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',
    assignee TEXT NOT NULL DEFAULT '',
    resolution_notes TEXT NOT NULL DEFAULT '',
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_unit_id ON maintenance_requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);

-- Dictionary options for the new modules.
INSERT INTO options (slug, value, label, variant, sort_order) VALUES
    ('maintenance_category', 'plumbing', 'Plumbing', 'info', 1),
    ('maintenance_category', 'electrical', 'Electrical', 'info', 2),
    ('maintenance_category', 'aircond', 'Air-conditioning', 'info', 3),
    ('maintenance_category', 'appliance', 'Appliance', 'info', 4),
    ('maintenance_category', 'structure', 'Structure', 'info', 5),
    ('maintenance_category', 'other', 'Other', 'neutral', 6),
    ('maintenance_priority', 'low', 'Low', 'neutral', 1),
    ('maintenance_priority', 'normal', 'Normal', 'info', 2),
    ('maintenance_priority', 'high', 'High', 'warning', 3),
    ('maintenance_priority', 'urgent', 'Urgent', 'danger', 4),
    ('maintenance_status', 'open', 'Open', 'warning', 1),
    ('maintenance_status', 'in_progress', 'In Progress', 'info', 2),
    ('maintenance_status', 'resolved', 'Resolved', 'success', 3),
    ('maintenance_status', 'closed', 'Closed', 'neutral', 4),
    ('payment_proof_status', 'pending', 'Pending', 'warning', 1),
    ('payment_proof_status', 'approved', 'Approved', 'success', 2),
    ('payment_proof_status', 'rejected', 'Rejected', 'danger', 3);

-- Timestamps for tables that lack them. SQLite cannot ADD COLUMN with a non-constant default,
-- so add with DEFAULT '' and backfill existing rows.
ALTER TABLE blocks ADD COLUMN created_at DATETIME DEFAULT '';
ALTER TABLE blocks ADD COLUMN updated_at DATETIME DEFAULT '';
ALTER TABLE floors ADD COLUMN created_at DATETIME DEFAULT '';
ALTER TABLE floors ADD COLUMN updated_at DATETIME DEFAULT '';
ALTER TABLE units ADD COLUMN created_at DATETIME DEFAULT '';
ALTER TABLE units ADD COLUMN updated_at DATETIME DEFAULT '';

UPDATE blocks SET created_at = CURRENT_TIMESTAMP WHERE created_at = '';
UPDATE blocks SET updated_at = CURRENT_TIMESTAMP WHERE updated_at = '';
UPDATE floors SET created_at = CURRENT_TIMESTAMP WHERE created_at = '';
UPDATE floors SET updated_at = CURRENT_TIMESTAMP WHERE updated_at = '';
UPDATE units SET created_at = CURRENT_TIMESTAMP WHERE created_at = '';
UPDATE units SET updated_at = CURRENT_TIMESTAMP WHERE updated_at = '';
