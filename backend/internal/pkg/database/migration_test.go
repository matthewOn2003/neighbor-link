package database

import (
	"os"
	"path/filepath"
	"testing"
)

// TestRunMigrations needs a disposable PostgreSQL database in TEST_DATABASE_URL.
// It drops test_items and schema_migrations first, so never point it at a real database.
func TestRunMigrations(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping PostgreSQL migration test")
	}
	tempDir := t.TempDir()
	migrationsDir := filepath.Join(tempDir, "migrations")

	if err := os.MkdirAll(migrationsDir, 0755); err != nil {
		t.Fatalf("failed to create migrations dir: %v", err)
	}

	sql1 := `
	CREATE TABLE test_items (
		id INTEGER PRIMARY KEY,
		name TEXT NOT NULL
	);
	INSERT INTO test_items (id, name) VALUES (1, 'Alice');
	`
	if err := os.WriteFile(filepath.Join(migrationsDir, "001_init.sql"), []byte(sql1), 0644); err != nil {
		t.Fatalf("failed to write 001_init.sql: %v", err)
	}

	db, err := InitPostgres(dsn)
	if err != nil {
		t.Fatalf("InitPostgres failed: %v", err)
	}
	sqlDB, err := db.DB()
	if err == nil {
		defer sqlDB.Close()
	}
	if err := db.Exec(`DROP TABLE IF EXISTS test_items, schema_migrations`).Error; err != nil {
		t.Fatalf("reset test tables failed: %v", err)
	}

	// 首次运行迁移
	if err := RunMigrations(db, migrationsDir); err != nil {
		t.Fatalf("RunMigrations failed: %v", err)
	}

	var count int64
	if err := db.Table("test_items").Count(&count).Error; err != nil {
		t.Fatalf("query failed: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected 1 item, got %d", count)
	}

	// 幂等性测试：再次运行不应报错或重复插入
	if err := RunMigrations(db, migrationsDir); err != nil {
		t.Fatalf("subsequent RunMigrations failed: %v", err)
	}

	// 添加第二个迁移文件
	sql2 := `INSERT INTO test_items (id, name) VALUES (2, 'Bob');`
	if err := os.WriteFile(filepath.Join(migrationsDir, "002_add_bob.sql"), []byte(sql2), 0644); err != nil {
		t.Fatalf("failed to write 002_add_bob.sql: %v", err)
	}

	if err := RunMigrations(db, migrationsDir); err != nil {
		t.Fatalf("RunMigrations with second file failed: %v", err)
	}

	if err := db.Table("test_items").Count(&count).Error; err != nil {
		t.Fatalf("query after second migration failed: %v", err)
	}
	if count != 2 {
		t.Fatalf("expected 2 items, got %d", count)
	}
}
