-- 001_init_schema.sql
-- 创建系统各实体的核心数据表

CREATE TABLE IF NOT EXISTS auth_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users(username);

CREATE TABLE IF NOT EXISTS developers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_email TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    developer_id INTEGER,
    name TEXT NOT NULL,
    property_type TEXT NOT NULL DEFAULT 'condo',
    address TEXT NOT NULL,
    city TEXT,
    region TEXT NOT NULL DEFAULT '',
    description TEXT,
    cover_image TEXT,
    wifi_ssid TEXT,
    wifi_password TEXT,
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_properties_developer_id ON properties(developer_id);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);

-- 一个项目包含多个 block（楼栋），每栋有若干楼层，每层有若干单位
CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    name TEXT,
    floor_count INTEGER NOT NULL DEFAULT 1,
    units_per_floor INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocks_property_code ON blocks(property_id, code);

CREATE TABLE IF NOT EXISTS floors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_id INTEGER NOT NULL,
    level INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_floors_block_level ON floors(block_id, level);

-- 单位编号格式为 block-楼层-序号，例如 A-12-03
CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_id INTEGER NOT NULL,
    floor_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    size_sqft INTEGER,
    status TEXT NOT NULL DEFAULT 'vacant'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_units_block_code ON units(block_id, code);
CREATE INDEX IF NOT EXISTS idx_units_floor_id ON units(floor_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);

CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    property_id INTEGER,
    unit_id INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    city TEXT,
    contract_end TEXT,
    monthly_rent REAL,
    outstanding_balance REAL NOT NULL DEFAULT 0,
    balance_note TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_unit_id ON tenants(unit_id);

CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    variant TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_options_slug ON options(slug);
