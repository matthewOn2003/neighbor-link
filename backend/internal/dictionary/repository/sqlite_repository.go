package repository

import "gorm.io/gorm"

// Option is a single (slug, value) entry in a backend-managed dropdown list.
// Frontend never hardcodes these - it only knows the slug (e.g. "property_status").
type Option struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Slug  string `gorm:"not null;index" json:"slug"`
	Value string `gorm:"not null" json:"value"`
	Label string `gorm:"not null" json:"label"`
	// Variant hints how the frontend should color-code this value (e.g. badge color); "" means neutral.
	Variant   string `json:"variant"`
	SortOrder int    `gorm:"not null;default:0" json:"sort_order"`
}

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) (*SQLiteRepository, error) {
	if err := db.AutoMigrate(&Option{}); err != nil {
		return nil, err
	}
	return &SQLiteRepository{db: db}, nil
}

func (r *SQLiteRepository) ListBySlugs(slugs []string) ([]Option, error) {
	var options []Option
	if len(slugs) == 0 {
		return options, nil
	}
	if err := r.db.Where("slug IN ?", slugs).Order("sort_order asc, id asc").Find(&options).Error; err != nil {
		return nil, err
	}
	return options, nil
}

func (r *SQLiteRepository) Create(o *Option) error {
	return r.db.Create(o).Error
}

func (r *SQLiteRepository) Count() (int64, error) {
	var total int64
	err := r.db.Model(&Option{}).Count(&total).Error
	return total, err
}
