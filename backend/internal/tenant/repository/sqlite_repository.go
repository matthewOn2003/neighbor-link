package repository

import (
	"time"

	"gorm.io/gorm"
)

type Tenant struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null;index" json:"user_id"`
	Name       string    `gorm:"not null" json:"name"`
	Phone      string    `gorm:"not null" json:"phone"`
	Email      string    `json:"email"`
	PropertyID *uint     `json:"property_id"`
	Status     string    `gorm:"not null;default:active" json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) (*SQLiteRepository, error) {
	if err := db.AutoMigrate(&Tenant{}); err != nil {
		return nil, err
	}
	return &SQLiteRepository{db: db}, nil
}

func (r *SQLiteRepository) Create(t *Tenant) error {
	return r.db.Create(t).Error
}

func (r *SQLiteRepository) FindByID(id uint) (*Tenant, error) {
	var tenant Tenant
	if err := r.db.First(&tenant, id).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

func (r *SQLiteRepository) Update(t *Tenant) error {
	return r.db.Save(t).Error
}

func (r *SQLiteRepository) Delete(id uint) error {
	return r.db.Delete(&Tenant{}, id).Error
}

func (r *SQLiteRepository) List(currentPage, perPage int) ([]Tenant, int64, error) {
	var tenants []Tenant
	var total int64
	if err := r.db.Model(&Tenant{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (currentPage - 1) * perPage
	if err := r.db.Order("id asc").Offset(offset).Limit(perPage).Find(&tenants).Error; err != nil {
		return nil, 0, err
	}
	return tenants, total, nil
}

func (r *SQLiteRepository) Count() (int64, error) {
	var total int64
	err := r.db.Model(&Tenant{}).Count(&total).Error
	return total, err
}
