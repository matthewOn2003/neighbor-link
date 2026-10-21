-- 010_tenant_portal_attachments_notes.sql
-- Data behind the remaining tenant portal screens: repair photos, property notes on requests,
-- and the notification bell.

-- Photos a tenant attaches to a repair request. file_key is the object-storage key.
CREATE TABLE IF NOT EXISTS maintenance_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL REFERENCES maintenance_requests(id),
    file_key TEXT NOT NULL,
    file_name TEXT NOT NULL DEFAULT '',
    content_type TEXT NOT NULL DEFAULT '',
    size_bytes INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_attachments_request_id ON maintenance_attachments(request_id);

-- Notes the property team writes on a repair request or complaint. kind is 'maintenance' or 'complaint'.
CREATE TABLE IF NOT EXISTS request_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    request_id INTEGER NOT NULL,
    author_name TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_request_notes_request ON request_notes(kind, request_id);

-- Notifications shown in the tenant's bell. read_at is NULL until the tenant has seen it.
CREATE TABLE IF NOT EXISTS tenant_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    kind TEXT NOT NULL DEFAULT 'general',
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenant_notifications_tenant ON tenant_notifications(tenant_id);

-- Development data: one note on the first complaint and the first repair request, and two notifications per tenant.
INSERT INTO request_notes (kind, request_id, author_name, body, created_at)
SELECT 'complaint', id, 'Rental Ops Desk', 'Logged with the security contractor; a technician will check the latch this week.', datetime('now', '-1 day')
FROM complaints ORDER BY id LIMIT 1;

INSERT INTO request_notes (kind, request_id, author_name, body, created_at)
SELECT 'maintenance', id, 'Rental Ops Desk', 'Technician contacted; visit confirmed for the scheduled slot.', datetime('now', '-1 day')
FROM maintenance_requests ORDER BY id LIMIT 1;

INSERT INTO tenant_notifications (tenant_id, kind, title, body, created_at)
SELECT id, 'billing', 'Invoice issued', 'Your latest monthly invoice is ready to view.', datetime('now', '-1 day')
FROM tenants;

INSERT INTO tenant_notifications (tenant_id, kind, title, body, created_at)
SELECT id, 'announcement', 'Lobby Refresh', 'Parcel lockers are active 24/7 on the ground floor.', datetime('now', '-2 days')
FROM tenants;
