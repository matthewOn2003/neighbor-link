-- 006_staff_profile_fields.sql
-- 扩充员工组织架构（部门、职位、员工）的业务字段，供列表筛选与展示使用

-- 部门：负责人、办公地点、联系电话
ALTER TABLE staff_departments ADD COLUMN manager_name TEXT NOT NULL DEFAULT '';
ALTER TABLE staff_departments ADD COLUMN location TEXT NOT NULL DEFAULT '';
ALTER TABLE staff_departments ADD COLUMN phone TEXT NOT NULL DEFAULT '';

-- 职位：职级、用工类型
ALTER TABLE staff_positions ADD COLUMN level TEXT NOT NULL DEFAULT 'staff';
ALTER TABLE staff_positions ADD COLUMN employment_type TEXT NOT NULL DEFAULT 'full_time';

-- 员工：工号、入职日期（YYYY-MM-DD）
ALTER TABLE staff_accounts ADD COLUMN employee_no TEXT NOT NULL DEFAULT '';
ALTER TABLE staff_accounts ADD COLUMN hire_date TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_staff_positions_department_id ON staff_positions(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_positions_level ON staff_positions(level);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_position_id ON staff_accounts(position_id);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_hire_date ON staff_accounts(hire_date);

-- 职级与用工类型的字典选项
INSERT INTO options (slug, value, label, variant, sort_order) VALUES
('position_level', 'junior', 'Junior', 'info', 1),
('position_level', 'staff', 'Staff', 'info', 2),
('position_level', 'senior', 'Senior', 'info', 3),
('position_level', 'manager', 'Manager', 'warning', 4),
('position_level', 'director', 'Director', 'success', 5),
('employment_type', 'full_time', 'Full-time', 'success', 1),
('employment_type', 'part_time', 'Part-time', 'info', 2),
('employment_type', 'contract', 'Contract', 'warning', 3),
('employment_type', 'intern', 'Intern', 'neutral', 4);
