-- 009_tenant_portal_redesign.sql
-- Data behind the redesigned tenant portal: property presentation and ops desk contact,
-- the lease agreement document, scheduled technician visits and property announcements.

-- Property: Wi-Fi speed shown next to the Wi-Fi card, and the ops desk the tenant can message or call.
ALTER TABLE properties ADD COLUMN wifi_speed TEXT NOT NULL DEFAULT '';
ALTER TABLE properties ADD COLUMN ops_desk_name TEXT NOT NULL DEFAULT '';
ALTER TABLE properties ADD COLUMN ops_desk_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE properties ADD COLUMN ops_desk_hours TEXT NOT NULL DEFAULT '';

-- Contract: metadata of the signed tenancy agreement. agreement_key is the object-storage key and stays empty until a PDF is uploaded.
ALTER TABLE contracts ADD COLUMN agreement_name TEXT NOT NULL DEFAULT '';
ALTER TABLE contracts ADD COLUMN agreement_key TEXT NOT NULL DEFAULT '';
ALTER TABLE contracts ADD COLUMN agreement_size INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN signed_at TEXT NOT NULL DEFAULT '';

-- Maintenance: when a technician is scheduled to visit. NULL until one is booked.
ALTER TABLE maintenance_requests ADD COLUMN scheduled_at TEXT;

-- Announcements posted for a property and shown to its residents.
CREATE TABLE IF NOT EXISTS property_announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL REFERENCES properties(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    published_at TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_announcements_property_id ON property_announcements(property_id);
CREATE INDEX IF NOT EXISTS idx_property_announcements_published_at ON property_announcements(published_at);

-- Development data: ops desk, Wi-Fi speed for every property, an agreement for each active lease, and one announcement.
UPDATE properties SET wifi_speed = '1 Gbps Fiber', ops_desk_name = 'Rental Ops Desk', ops_desk_phone = '+60 3-5555 0199', ops_desk_hours = '24/7'
WHERE ops_desk_name = '';

UPDATE contracts SET agreement_name = 'Tenancy Agreement.pdf', agreement_size = 4404019, signed_at = start_date
WHERE agreement_name = '' AND status = 'active';

INSERT INTO property_announcements (property_id, title, body, image_url, published_at)
SELECT id, 'Lobby Refresh', 'Parcel lockers are active 24/7 on the ground floor.', cover_image, date('now', '-2 days')
FROM properties
WHERE id = 1 AND NOT EXISTS (SELECT 1 FROM property_announcements WHERE property_id = 1);
