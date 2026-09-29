-- 001_init_schema.sql
-- 创建系统各实体的核心数据表

CREATE TABLE IF NOT EXISTS auth_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users(username);

CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    wifi_ssid TEXT,
    wifi_password TEXT,
    status TEXT NOT NULL DEFAULT 'vacant',
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    property_id INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME,
    updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);

CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    variant TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_options_slug ON options(slug);
