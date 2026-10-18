package repository

import (
	"strings"
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

// TenantFilter holds the optional list filters. Zero values mean "no filter".
type TenantFilter struct {
	Keyword    string
	Status     string
	PropertyID *uint
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

// filtered returns a fresh query chain each call, so Count and Find never share state.
// func (r *SQLiteRepository) filtered(f TenantFilter) *gorm.DB {
// 	q := r.db.Model(&Tenant{})
// 	if f.Keyword != "" {
// 		like := "%" + strings.ToLower(f.Keyword) + "%"
// 		q = q.Where("LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?", like, like, like)
// 	}
// 	if f.Status != "" {
// 		q = q.Where("status = ?", f.Status)
// 	}
// 	if f.PropertyID != nil {
// 		q = q.Where("property_id = ?", *f.PropertyID)
// 	}
// 	return q
// }

// func (r *SQLiteRepository) List(f TenantFilter, currentPage, perPage int) ([]Tenant, int64, error) {
// 	var total int64
// 	if err := r.filtered(f).Count(&total).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	tenants := make([]Tenant, 0) // empty result serializes as [], not null
// 	offset := (currentPage - 1) * perPage
// 	if err := r.filtered(f).Order("id asc").Offset(offset).Limit(perPage).Find(&tenants).Error; err != nil {
// 		return nil, 0, err
// 	}
// 	return tenants, total, nil
// }

func (r *SQLiteRepository) Count() (int64, error) {
	var total int64
	err := r.db.Model(&Tenant{}).Count(&total).Error
	return total, err
}

// 列表项：租客 + 所属物业的名称和地址
type TenantListItem struct {
	Tenant
	PropertyName    *string `json:"property_name"`
	PropertyAddress *string `json:"property_address"`
}

func (r *SQLiteRepository) filtered(f TenantFilter) *gorm.DB {
	q := r.db.Model(&Tenant{})
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("LOWER(tenants.name) LIKE ? OR LOWER(tenants.email) LIKE ? OR tenants.phone LIKE ?", like, like, like)
	}
	if f.Status != "" {
		q = q.Where("tenants.status = ?", f.Status)
	}
	if f.PropertyID != nil {
		q = q.Where("tenants.property_id = ?", *f.PropertyID)
	}
	return q
}

func (r *SQLiteRepository) List(f TenantFilter, currentPage, perPage int) ([]TenantListItem, int64, error) {
	var total int64
	if err := r.filtered(f).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	items := make([]TenantListItem, 0)
	offset := (currentPage - 1) * perPage
	err := r.filtered(f).
		Select("tenants.*, properties.name AS property_name, properties.address AS property_address").
		Joins("LEFT JOIN properties ON properties.id = tenants.property_id").
		Order("tenants.id asc").
		Offset(offset).Limit(perPage).
		Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}
	return items, total, nil
}