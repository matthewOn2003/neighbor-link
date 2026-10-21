-- Complaints raised by tenants about neighbours or the property. Separate from maintenance requests.
CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    property_id INTEGER,
    unit_id INTEGER,
    category TEXT NOT NULL DEFAULT 'other',
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',
    assignee TEXT NOT NULL DEFAULT '',
    resolution_notes TEXT NOT NULL DEFAULT '',
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_tenant_id ON complaints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_property_id ON complaints(property_id);

INSERT OR IGNORE INTO options (slug, value, label, variant, sort_order) VALUES
    ('complaint_category', 'noise', 'Noise', 'warning', 1),
    ('complaint_category', 'hygiene', 'Hygiene', 'info', 2),
    ('complaint_category', 'neighbour_dispute', 'Neighbour dispute', 'danger', 3),
    ('complaint_category', 'safety', 'Safety', 'danger', 4),
    ('complaint_category', 'other', 'Other', 'neutral', 5),
    ('complaint_status', 'open', 'Open', 'warning', 1),
    ('complaint_status', 'in_progress', 'In Progress', 'info', 2),
    ('complaint_status', 'resolved', 'Resolved', 'success', 3),
    ('complaint_status', 'closed', 'Closed', 'neutral', 4);
