-- 002_seed_data.sql
-- 预置字典选项数据
INSERT OR IGNORE INTO options (id, slug, value, label, variant, sort_order) VALUES
(1, 'unit_status', 'vacant', 'Vacant', 'neutral', 1),
(2, 'unit_status', 'occupied', 'Occupied', 'success', 2),
(3, 'unit_status', 'maintenance', 'Maintenance', 'warning', 3),
(4, 'tenant_status', 'active', 'Active', 'success', 1),
(5, 'tenant_status', 'pending_renewal', 'Pending Renewal', 'warning', 2),
(6, 'tenant_status', 'former', 'Former', 'neutral', 3),
(7, 'property_type', 'condo', 'Condo', 'info', 1),
(8, 'property_type', 'apartment', 'Apartment', 'info', 2),
(9, 'property_type', 'terrace', 'Terrace', 'info', 3),
(10, 'property_type', 'semi_d', 'Semi-D', 'info', 4),
(11, 'property_region', 'klang_valley', 'Klang Valley', 'info', 1),
(12, 'property_region', 'johor', 'Johor', 'info', 2),
(13, 'property_region', 'penang', 'Penang', 'info', 3),
(14, 'property_region', 'perak', 'Perak', 'info', 4),
(15, 'property_region', 'melaka', 'Melaka', 'info', 5),
(16, 'property_region', 'negeri_sembilan', 'Negeri Sembilan', 'info', 6),
(17, 'property_region', 'sabah', 'Sabah', 'info', 7),
(18, 'property_region', 'sarawak', 'Sarawak', 'info', 8);

-- 预置开发商数据
INSERT OR IGNORE INTO developers (id, name, contact_email, created_at, updated_at) VALUES
(1, 'Sunrise Holdings', 'contact@sunrise-holdings.example', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Greenfield Developments', 'hello@greenfield.example', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Pacific Urban', 'info@pacificurban.example', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Harbor Living', 'sales@harborliving.example', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Nova Land', 'enquiry@novaland.example', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 预置房产数据
INSERT OR IGNORE INTO properties (id, developer_id, name, property_type, address, city, region, description, cover_image, wifi_ssid, wifi_password, notes, created_at, updated_at) VALUES
(1, 1, 'Maple Court #1', 'terrace', '12 Maple Court', 'Subang Jaya, SEL', 'klang_valley', 'Corner terrace homes beside the park.', 'https://images.pexels.com/photos/39485848/pexels-photo-39485848.jpeg?auto=compress&cs=tinysrgb&w=800', 'MapleWifi1', 'maple-pass-1', 'Recently renovated', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Maple Court #2', 'semi_d', '14 Maple Court', 'Ampang, KL', 'klang_valley', 'Semi-detached family homes with private gardens.', 'https://images.pexels.com/photos/15951714/pexels-photo-15951714.jpeg?auto=compress&cs=tinysrgb&w=800', 'MapleWifi2', 'maple-pass-2', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'Oak Street #1', 'terrace', '8 Oak Street', 'Cheras, KL', 'klang_valley', 'Three-storey terrace row near the transit line.', 'https://images.pexels.com/photos/33244441/pexels-photo-33244441.jpeg?auto=compress&cs=tinysrgb&w=800', 'OakWifi1', 'oak-pass-1', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'Oak Street #2', 'terrace', '10 Oak Street', 'Damansara, SEL', 'klang_valley', 'Compact terrace units with rooftop access.', 'https://images.pexels.com/photos/39319453/pexels-photo-39319453.jpeg?auto=compress&cs=tinysrgb&w=800', 'OakWifi2', 'oak-pass-2', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 'Birch Lane #1', 'semi_d', '3 Birch Lane', 'Sungai Buloh, SEL', 'klang_valley', 'Quiet semi-detached block with ground floor units.', 'https://images.pexels.com/photos/39796876/pexels-photo-39796876.jpeg?auto=compress&cs=tinysrgb&w=800', 'BirchWifi1', 'birch-pass-1', 'Ground floor unit', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 3, 'Aurora Heights', 'condo', 'Kuala Lumpur, MY', 'Kuala Lumpur, MY', 'klang_valley', 'Mid-rise condominium with a rooftop pool.', 'https://images.pexels.com/photos/6147621/pexels-photo-6147621.jpeg?auto=compress&cs=tinysrgb&w=800', NULL, NULL, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 3, 'Pavillion Suites', 'apartment', 'Bukit Bintang, KL', 'Bukit Bintang, KL', 'klang_valley', 'Serviced suites in the heart of the city.', 'https://images.pexels.com/photos/18153132/pexels-photo-18153132.jpeg?auto=compress&cs=tinysrgb&w=800', NULL, NULL, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 4, 'Green Valley', 'condo', 'Petaling Jaya, SEL', 'Petaling Jaya, SEL', 'klang_valley', 'Garden condominium with three low-rise blocks.', 'https://images.pexels.com/photos/9308434/pexels-photo-9308434.jpeg?auto=compress&cs=tinysrgb&w=800', NULL, NULL, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 4, 'Skyline Res', 'apartment', '18 Jalan Tebrau', 'Johor Bahru, JHR', 'johor', 'High-rise residences with city views.', 'https://images.pexels.com/photos/15951714/pexels-photo-15951714.jpeg?auto=compress&cs=tinysrgb&w=800', NULL, NULL, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 5, 'Central Loft', 'apartment', '45 Lebuh Chulia', 'George Town, PNG', 'penang', 'Loft-style apartments above the retail podium.', 'https://images.pexels.com/photos/39319453/pexels-photo-39319453.jpeg?auto=compress&cs=tinysrgb&w=800', NULL, NULL, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 预置 block（楼栋）数据，(floor_count, units_per_floor) 决定楼层与单位的生成数量
INSERT OR IGNORE INTO blocks (id, property_id, code, name, floor_count, units_per_floor) VALUES
(1, 1, 'A', 'Block A', 4, 2),
(2, 1, 'B', 'Block B', 4, 2),
(3, 2, 'A', 'Block A', 5, 2),
(4, 2, 'B', 'Block B', 5, 2),
(5, 3, 'A', 'Block A', 3, 2),
(6, 3, 'B', 'Block B', 3, 2),
(7, 3, 'C', 'Block C', 3, 2),
(8, 4, 'A', 'Block A', 2, 3),
(9, 4, 'B', 'Block B', 2, 3),
(10, 5, 'A', 'Block A', 4, 2),
(11, 5, 'B', 'Block B', 4, 2),
(12, 6, 'A', 'Block A', 6, 2),
(13, 6, 'B', 'Block B', 4, 2),
(14, 7, 'A', 'Block A', 8, 3),
(15, 8, 'A', 'Block A', 3, 2),
(16, 8, 'B', 'Block B', 3, 2),
(17, 8, 'C', 'Block C', 3, 2),
(18, 9, 'A', 'Block A', 10, 4),
(19, 10, 'A', 'Block A', 8, 2);

-- 按 block 的楼层数生成 floors（level 从 1 开始）
WITH RECURSIVE lvl(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM lvl WHERE n < 10
)
INSERT INTO floors (block_id, level)
SELECT b.id, lvl.n FROM blocks b JOIN lvl ON lvl.n <= b.floor_count;

-- 按每层单位数生成 units，编号格式为 block-楼层-序号，例如 A-03-02
WITH RECURSIVE k(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM k WHERE n < 10
)
INSERT INTO units (block_id, floor_id, code, bedrooms, size_sqft, status)
SELECT
    b.id,
    f.id,
    b.code || '-' || printf('%02d', f.level) || '-' || printf('%02d', k.n),
    1 + (f.id + k.n) % 3,
    350 + (1 + (f.id + k.n) % 3) * 200,
    'vacant'
FROM floors f
JOIN blocks b ON b.id = f.block_id
JOIN k ON k.n <= b.units_per_floor;

-- 部分单位标记为维护中
UPDATE units SET status = 'maintenance' WHERE id % 7 = 0;

-- 预置租客账号数据 (预生成 bcrypt hash，明文分别为 Tenant#Alice1, Tenant#Bob1, ...)
-- Tenant#Alice1  -> $2a$10$wEeVnC33YV7WbL2K235kX.l0bL/y8eZc9K5V4m3oG2jL.Fh7oMWeW
-- 所有 mock 租客账号 role 均为 'tenant'
INSERT OR IGNORE INTO auth_users (id, username, password_hash, role) VALUES
(3, 'tenant_john_tan', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(4, 'tenant_elena_rostova', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(5, 'tenant_marcus_lee', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(6, 'tenant_sophie_martin', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(7, 'tenant_david_wong', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(8, 'tenant_sarah_ahmad', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(9, 'tenant_grace', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(10, 'tenant_henry', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(11, 'tenant_ivan', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(12, 'tenant_judy', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(13, 'tenant_kevin', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(14, 'tenant_laura', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(15, 'tenant_mike', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(16, 'tenant_nina', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(17, 'tenant_oscar', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(18, 'tenant_paula', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(19, 'tenant_quinn', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(20, 'tenant_rachel', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(21, 'tenant_sam', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(22, 'tenant_tina', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(23, 'tenant_umar', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(24, 'tenant_vera', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(25, 'tenant_will', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(26, 'tenant_xin', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(27, 'tenant_yara', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(28, 'tenant_zack', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(29, 'tenant_amy', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(30, 'tenant_ben', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(31, 'tenant_chloe', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(32, 'tenant_daniel', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(33, 'tenant_emma', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(34, 'tenant_felix', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(35, 'tenant_gina', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(36, 'tenant_hugo', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(37, 'tenant_iris', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(38, 'tenant_jack', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(39, 'tenant_kara', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(40, 'tenant_leo', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(41, 'tenant_mia', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(42, 'tenant_noah', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(43, 'tenant_olivia', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(44, 'tenant_peter', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(45, 'tenant_ruby', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(46, 'tenant_sophie', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(47, 'tenant_tom', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(48, 'tenant_uma', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(49, 'tenant_victor', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant'),
(50, 'tenant_wendy', '$2a$10$tZ261xSj942hF1K2/Q0d4el3OQ.t2h6x/sVw3Xz19W1y1s1.r2G5W', 'tenant');

-- 预置租客档案数据（unit_id 在下方统一分配）
INSERT OR IGNORE INTO tenants (id, user_id, name, phone, email, property_id, status, city, contract_end, monthly_rent, outstanding_balance, balance_note, created_at, updated_at) VALUES
(1, 3, 'John Tan', '+60 12-345 6789', 'johntan@email.com', 6, 'active', 'Kuala Lumpur, MY', '2026-12-31', 1800, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, 'Elena Rostova', '+60 17-889 0123', 'elena.r@global.io', 7, 'active', 'Bukit Bintang, KL', '2026-08-15', 2400, 150, 'Repair fee', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 5, 'Marcus Lee', '+60 11-234 5678', 'marcus.lee@gmail.com', 8, 'active', 'Petaling Jaya, SEL', '2026-11-30', 1200, 1200, 'Overdue 5d', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 6, 'Sophie Martin', '+60 13-901 2345', 'sophie.m@outlook.com', 9, 'active', 'Bangsar, KL', '2027-01-15', 2800, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 7, 'David Wong', '+60 16-778 9900', 'david.wong@tech.com', 10, 'pending_renewal', 'Mont Kiara, KL', '2026-10-31', 1600, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 8, 'Sarah Ahmad', '+60 19-332 1144', 'sarah.a@mycorp.com', NULL, 'former', 'Cyberjaya, SEL', '2026-09-30', NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 9, 'Grace Liu', '555-0107', 'grace@example.com', 4, 'pending_renewal', 'Petaling Jaya, SEL', '2026-10-15', 1500, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 10, 'Henry Zhao', '555-0108', 'henry@example.com', NULL, 'former', 'Cyberjaya, SEL', '2026-06-30', NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 11, 'Ivan Petrov', '555-0109', 'ivan@example.com', 1, 'active', 'Subang Jaya, SEL', '2027-02-28', 1700, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 12, 'Judy Ng', '555-0110', 'judy@example.com', 2, 'active', 'Ampang, KL', '2026-12-31', 1600, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 13, 'Kevin Ma', '555-0111', 'kevin@example.com', 3, 'active', 'Cheras, KL', '2027-03-31', 1900, 320, 'Overdue 10d', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 14, 'Laura Tan', '555-0112', 'laura@example.com', 4, 'active', 'Damansara, SEL', '2026-11-15', 2100, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 15, 'Mike Ross', '555-0113', 'mike@example.com', NULL, 'former', 'Klang, SEL', '2026-05-31', NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 16, 'Nina Patel', '555-0114', 'nina@example.com', NULL, 'active', 'Shah Alam, SEL', NULL, NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 17, 'Oscar Wang', '555-0115', 'oscar@example.com', 1, 'active', 'Subang Jaya, SEL', '2027-04-30', 1750, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 18, 'Paula Reyes', '555-0116', 'paula@example.com', 2, 'active', 'Ampang, KL', '2027-05-31', 1650, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 19, 'Quinn Adams', '555-0117', 'quinn@example.com', 3, 'active', 'Cheras, KL', '2027-06-30', 1850, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 20, 'Rachel Green', '555-0118', 'rachel@example.com', 4, 'pending_renewal', 'Damansara, SEL', '2026-10-01', 2000, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 21, 'Sam Lin', '555-0119', 'sam@example.com', 5, 'active', 'Sungai Buloh, SEL', '2027-07-31', 1550, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 22, 'Tina Gao', '555-0120', 'tina@example.com', NULL, 'active', 'Puchong, SEL', NULL, NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 23, 'Umar Khan', '555-0121', 'umar@example.com', 1, 'active', 'Subang Jaya, SEL', '2027-08-31', 1800, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 24, 'Vera Novak', '555-0122', 'vera@example.com', 2, 'active', 'Ampang, KL', '2027-09-30', 1700, 450, 'Repair fee', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, 25, 'Will Chen', '555-0123', 'will@example.com', NULL, 'former', 'Setapak, KL', '2026-03-31', NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 26, 'Xin Zhou', '555-0124', 'xin@example.com', 4, 'active', 'Damansara, SEL', '2027-10-31', 2050, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 27, 'Yara Haddad', '555-0125', 'yara@example.com', 5, 'active', 'Sungai Buloh, SEL', '2027-11-30', 1600, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(26, 28, 'Zack Morgan', '555-0126', 'zack@example.com', NULL, 'active', 'Puchong, SEL', NULL, NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(27, 29, 'Amy Foster', '555-0127', 'amy@example.com', 1, 'active', 'Subang Jaya, SEL', '2027-12-31', 1750, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(28, 30, 'Ben Carter', '555-0128', 'ben@example.com', 2, 'pending_renewal', 'Ampang, KL', '2026-10-20', 1650, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(29, 31, 'Chloe Dubois', '555-0129', 'chloe@example.com', 3, 'active', 'Cheras, KL', '2028-01-31', 1900, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(30, 32, 'Daniel Ho', '555-0130', 'daniel@example.com', 4, 'active', 'Damansara, SEL', '2028-02-28', 2000, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(31, 33, 'Emma Wilson', '555-0131', 'emma@example.com', 5, 'active', 'Sungai Buloh, SEL', '2028-03-31', 1500, 200, 'Overdue 3d', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(32, 34, 'Felix Braun', '555-0132', 'felix@example.com', NULL, 'active', 'Puchong, SEL', NULL, NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(33, 35, 'Gina Russo', '555-0133', 'gina@example.com', NULL, 'former', 'Setapak, KL', '2026-02-28', NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(34, 36, 'Hugo Martin', '555-0134', 'hugo@example.com', 2, 'active', 'Ampang, KL', '2028-04-30', 1700, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(35, 37, 'Iris Yamamoto', '555-0135', 'iris@example.com', 3, 'active', 'Cheras, KL', '2028-05-31', 1850, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(36, 38, 'Jack Hu', '555-0136', 'jack@example.com', 4, 'active', 'Damansara, SEL', '2028-06-30', 2100, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(37, 39, 'Kara Singh', '555-0137', 'kara@example.com', 5, 'active', 'Sungai Buloh, SEL', '2028-07-31', 1550, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(38, 40, 'Leo Fernandes', '555-0138', 'leo@example.com', NULL, 'former', 'Klang, SEL', '2026-04-30', NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(39, 41, 'Mia Sato', '555-0139', 'mia@example.com', 1, 'active', 'Subang Jaya, SEL', '2028-08-31', 1800, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(40, 42, 'Noah Kim', '555-0140', 'noah@example.com', 2, 'active', 'Ampang, KL', '2028-09-30', 1700, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(41, 43, 'Olivia Brown', '555-0141', 'olivia@example.com', 3, 'active', 'Cheras, KL', '2028-10-31', 1900, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(42, 44, 'Peter Shaw', '555-0142', 'peter@example.com', 4, 'active', 'Damansara, SEL', '2028-11-30', 2050, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(43, 45, 'Ruby Lam', '555-0143', 'ruby@example.com', 5, 'pending_renewal', 'Sungai Buloh, SEL', '2026-11-10', 1550, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(44, 46, 'Sophie Klein', '555-0144', 'sophie@example.com', NULL, 'active', 'Puchong, SEL', NULL, NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(45, 47, 'Tom Walsh', '555-0145', 'tom@example.com', 1, 'active', 'Subang Jaya, SEL', '2028-12-31', 1750, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(46, 48, 'Uma Rao', '555-0146', 'uma@example.com', 2, 'active', 'Ampang, KL', '2029-01-31', 1650, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(47, 49, 'Victor Lee', '555-0147', 'victor@example.com', 3, 'active', 'Cheras, KL', '2029-02-28', 1950, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(48, 50, 'Wendy Xu', '555-0148', 'wendy@example.com', NULL, 'former', 'Setapak, KL', '2026-07-31', NULL, 0, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 为有所属房产的租客分配空置单位（同一房产内不重复，跳过维护中的单位）
WITH ranked_units AS (
    SELECT u.id, b.property_id,
        ROW_NUMBER() OVER (PARTITION BY b.property_id ORDER BY (u.id * 37) % 1000, u.id) - 1 AS rn
    FROM units u
    JOIN blocks b ON b.id = u.block_id
    WHERE u.status = 'vacant'
),
ranked_tenants AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY id) - 1 AS rn
    FROM tenants
    WHERE property_id IS NOT NULL
)
UPDATE tenants SET unit_id = (
    SELECT ru.id
    FROM ranked_units ru
    JOIN ranked_tenants rt ON rt.id = tenants.id
    WHERE ru.property_id = tenants.property_id AND ru.rn = rt.rn
)
WHERE property_id IS NOT NULL;

-- 已分配租客的单位标记为已入住
UPDATE units SET status = 'occupied'
WHERE id IN (SELECT unit_id FROM tenants WHERE unit_id IS NOT NULL);
