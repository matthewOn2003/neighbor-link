package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gorm.io/gorm"
)

// RunMigrations runs all .sql files in the specified migrations directory in alphabetical order.
// It tracks applied migrations in a `schema_migrations` table to ensure idempotency.
func RunMigrations(db *gorm.DB, migrationsDir string) error {
	// Create schema_migrations table if not exists
	err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version TEXT PRIMARY KEY,
			applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`).Error
	if err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}

	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations dir %q: %w", migrationsDir, err)
	}

	var sqlFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".sql") {
			sqlFiles = append(sqlFiles, entry.Name())
		}
	}
	sort.Strings(sqlFiles)

	for _, filename := range sqlFiles {
		var count int64
		err := db.Table("schema_migrations").Where("version = ?", filename).Count(&count).Error
		if err != nil {
			return fmt.Errorf("failed to check migration status for %s: %w", filename, err)
		}
		if count > 0 {
			continue // Already applied
		}

		filePath := filepath.Join(migrationsDir, filename)
		content, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}

		log.Printf("Applying migration: %s", filename)
		// Run within a transaction
		txErr := db.Transaction(func(tx *gorm.DB) error {
			queries := splitSQLStatements(string(content))
			for _, query := range queries {
				trimmed := strings.TrimSpace(query)
				if trimmed == "" {
					continue
				}
				if err := tx.Exec(trimmed).Error; err != nil {
					return fmt.Errorf("failed to execute query in %s: %w\nQuery: %s", filename, err, trimmed)
				}
			}
			return tx.Exec("INSERT INTO schema_migrations (version) VALUES (?)", filename).Error
		})

		if txErr != nil {
			return fmt.Errorf("migration %s failed: %w", filename, txErr)
		}
		log.Printf("Successfully applied migration: %s", filename)
	}

	return nil
}

// splitSQLStatements splits an SQL script by semicolons, ignoring comments and semicolons in quotes.
func splitSQLStatements(script string) []string {
	var statements []string
	var current strings.Builder
	inQuote := false
	var quoteChar rune

	lines := strings.Split(script, "\n")
	for _, line := range lines {
		trimmedLine := strings.TrimSpace(line)
		if strings.HasPrefix(trimmedLine, "--") {
			continue // skip line comments
		}

		for _, r := range line {
			if inQuote {
				if r == quoteChar {
					inQuote = false
				}
				current.WriteRune(r)
			} else {
				if r == '\'' || r == '"' {
					inQuote = true
					quoteChar = r
					current.WriteRune(r)
				} else if r == ';' {
					statements = append(statements, current.String())
					current.Reset()
				} else {
					current.WriteRune(r)
				}
			}
		}
		current.WriteString("\n")
	}

	if strings.TrimSpace(current.String()) != "" {
		statements = append(statements, current.String())
	}

	return statements
}

 
// RunSQLFile executes an SQL script without recording it as a schema migration.
// It is intended for repeatable development seed scripts.
func RunSQLFile(db *gorm.DB, filePath string) error {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("failed to read SQL file %q: %w", filePath, err)
	}
	return db.Transaction(func(tx *gorm.DB) error {
		for _, query := range splitSQLStatements(string(content)) {
			if strings.TrimSpace(query) == "" {
				continue
			}
			if err := tx.Exec(query).Error; err != nil {
				return fmt.Errorf("failed to execute SQL in %s: %w", filePath, err)
			}
		}
		return nil
	})
}
