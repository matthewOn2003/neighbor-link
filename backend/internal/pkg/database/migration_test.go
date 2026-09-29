package database

import (
	"os"
	"path/filepath"
	"testing"
)

func TestRunMigrations(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test.db")
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

	db, err := InitSQLite(dbPath)
	if err != nil {
		t.Fatalf("InitSQLite failed: %v", err)
	}
	sqlDB, err := db.DB()
	if err == nil {
		defer sqlDB.Close()
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
