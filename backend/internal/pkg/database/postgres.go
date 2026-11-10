package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// InitPostgres opens a PostgreSQL connection from a connection URL,
// e.g. postgres://user:password@host/dbname?sslmode=require.
func InitPostgres(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}
