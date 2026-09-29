-- 002_seed_data.sql
-- 预置字典选项数据
INSERT OR IGNORE INTO options (id, slug, value, label, variant, sort_order) VALUES
(1, 'property_status', 'vacant', 'Vacant', 'neutral', 1),
(2, 'property_status', 'occupied', 'Occupied', 'success', 2),
(3, 'property_status', 'maintenance', 'Maintenance', 'warning', 3),
(4, 'tenant_status', 'active', 'Active', 'success', 1),
(5, 'tenant_status', 'inactive', 'Inactive', 'neutral', 2);

-- 预置房产数据
INSERT OR IGNORE INTO properties (id, name, address, wifi_ssid, wifi_password, status, notes, created_at, updated_at) VALUES
(1, 'Maple Court #1', '12 Maple Court', 'MapleWifi1', 'maple-pass-1', 'vacant', 'Recently renovated', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Maple Court #2', '14 Maple Court', 'MapleWifi2', 'maple-pass-2', 'vacant', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Oak Street #1', '8 Oak Street', 'OakWifi1', 'oak-pass-1', 'occupied', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Oak Street #2', '10 Oak Street', 'OakWifi2', 'oak-pass-2', 'occupied', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Birch Lane #1', '3 Birch Lane', 'BirchWifi1', 'birch-pass-1', 'occupied', 'Ground floor unit', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 预置租客账号数据 (预生成 bcrypt hash，明文分别为 Tenant#Alice1, Tenant#Bob1, ...)
-- Tenant#Alice1  -> $2a$10$wEeVnC33YV7WbL2K235kX.l0bL/y8eZc9K5V4m3oG2jL.Fh7oMWeW
-- 所有 mock 租客账号 role 均为 'tenant'
INSERT OR IGNORE INTO auth_users (id, username, password_hash, role) VALUES
(3, 'tenant_alice', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(4, 'tenant_bob', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(5, 'tenant_carol', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(6, 'tenant_dave', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(7, 'tenant_erin', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(8, 'tenant_frank', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(9, 'tenant_grace', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(10, 'tenant_henry', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant');

-- 预置租客档案数据
INSERT OR IGNORE INTO tenants (id, user_id, name, phone, email, property_id, status, created_at, updated_at) VALUES
(1, 3, 'Alice Chen', '555-0101', 'alice@example.com', 3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, 'Bob Lee', '555-0102', 'bob@example.com', 4, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 5, 'Carol Wu', '555-0103', 'carol@example.com', 5, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 6, 'Dave Kim', '555-0104', 'dave@example.com', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 7, 'Erin Park', '555-0105', 'erin@example.com', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 8, 'Frank Xu', '555-0106', 'frank@example.com', 3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 9, 'Grace Liu', '555-0107', 'grace@example.com', 4, 'inactive', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 10, 'Henry Zhao', '555-0108', 'henry@example.com', NULL, 'inactive', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
