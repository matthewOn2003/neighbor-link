package repository

import (
	"gorm.io/gorm"
)

type settingRow struct {
	Key   string
	Value string
}

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) *SQLiteRepository {
	return &SQLiteRepository{db: db}
}

// GetBillingSettings returns all billing_settings rows keyed by setting name.
func (r *SQLiteRepository) GetBillingSettings() (map[string]string, error) {
	var rows []settingRow
	if err := r.db.Table("billing_settings").Select("key, value").Scan(&rows).Error; err != nil {
		return nil, err
	}
	values := make(map[string]string)
	for _, row := range rows {
		values[row.Key] = row.Value
	}
	return values, nil
}

// UpsertBillingSettings writes the given keys in one transaction.
func (r *SQLiteRepository) UpsertBillingSettings(values map[string]string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for key, value := range values {
			if err := tx.Exec(`INSERT INTO billing_settings (key, value) VALUES (?, ?)
				ON CONFLICT(key) DO UPDATE SET value = excluded.value`, key, value).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
