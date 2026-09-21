package database

import (
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

// InitSQLite initializes the SQLite database without deleting existing data.
func InitSQLite(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}
