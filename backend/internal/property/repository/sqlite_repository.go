package repository

import (
	"time"

	"gorm.io/gorm"
)

type Property struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Address      string    `gorm:"not null" json:"address"`
	WifiSSID     string    `gorm:"column:wifi_ssid" json:"wifi_ssid"`
	WifiPassword string    `json:"wifi_password"`
	Status       string    `gorm:"not null;default:vacant" json:"status"`
	Notes        string    `json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) (*SQLiteRepository, error) {
	if err := db.AutoMigrate(&Property{}); err != nil {
		return nil, err
	}
	return &SQLiteRepository{db: db}, nil
}

func (r *SQLiteRepository) Create(p *Property) error {
	return r.db.Create(p).Error
}

func (r *SQLiteRepository) FindByID(id uint) (*Property, error) {
	var property Property
	if err := r.db.First(&property, id).Error; err != nil {
		return nil, err
	}
	return &property, nil
}

func (r *SQLiteRepository) Update(p *Property) error {
	return r.db.Save(p).Error
}

func (r *SQLiteRepository) Delete(id uint) error {
	return r.db.Delete(&Property{}, id).Error
}

func (r *SQLiteRepository) List(currentPage, perPage int) ([]Property, int64, error) {
	var properties []Property
	var total int64
	if err := r.db.Model(&Property{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (currentPage - 1) * perPage
	if err := r.db.Order("id asc").Offset(offset).Limit(perPage).Find(&properties).Error; err != nil {
		return nil, 0, err
	}
	return properties, total, nil
}

func (r *SQLiteRepository) Count() (int64, error) {
	var total int64
	err := r.db.Model(&Property{}).Count(&total).Error
	return total, err
}
