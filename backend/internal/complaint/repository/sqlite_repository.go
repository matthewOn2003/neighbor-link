package repository

import (
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

var ErrNotFound = errors.New("complaint not found")

// Complaint is a tenant's complaint about a neighbour or the property. It is separate from maintenance requests.
type Complaint struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	TenantID        uint       `json:"tenant_id"`
	PropertyID      *uint      `json:"property_id"`
	UnitID          *uint      `json:"unit_id"`
	Category        string     `gorm:"not null" json:"category"`
	Title           string     `gorm:"not null" json:"title"`
	Description     string     `json:"description"`
	Status          string     `gorm:"not null" json:"status"`
	Assignee        string     `json:"assignee"`
	ResolutionNotes string     `json:"resolution_notes"`
	ResolvedAt      *time.Time `json:"resolved_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (Complaint) TableName() string { return "complaints" }

type ListItem struct {
	ID           uint       `json:"id"`
	TenantID     uint       `json:"tenant_id"`
	Title        string     `json:"title"`
	Category     string     `json:"category"`
	Status       string     `json:"status"`
	Assignee     string     `json:"assignee"`
	Description  string     `json:"description"`
	TenantName   *string    `json:"tenant_name"`
	PropertyName *string    `json:"property_name"`
	UnitCode     *string    `json:"unit_code"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	ResolvedAt   *time.Time `json:"resolved_at"`
	NoteCount    int64      `json:"note_count"`
}

type Detail struct {
	ListItem
	PropertyID      *uint  `json:"property_id"`
	UnitID          *uint  `json:"unit_id"`
	ResolutionNotes string `json:"resolution_notes"`
}

// Filter holds optional list filters. Zero values mean no filter.
type Filter struct {
	Keyword  string
	Status   string
	Category string
	TenantID *uint
}

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) *SQLiteRepository {
	return &SQLiteRepository{db: db}
}

func (r *SQLiteRepository) filtered(f Filter) *gorm.DB {
	q := r.db.Table("complaints").
		Joins("LEFT JOIN tenants ON tenants.id = complaints.tenant_id").
		Joins("LEFT JOIN properties ON properties.id = complaints.property_id").
		Joins("LEFT JOIN units ON units.id = complaints.unit_id")
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("LOWER(complaints.title) LIKE ? OR LOWER(complaints.description) LIKE ? OR LOWER(tenants.name) LIKE ?", like, like, like)
	}
	if f.Status != "" {
		q = q.Where("complaints.status = ?", f.Status)
	}
	if f.Category != "" {
		q = q.Where("complaints.category = ?", f.Category)
	}
	if f.TenantID != nil {
		q = q.Where("complaints.tenant_id = ?", *f.TenantID)
	}
	return q
}

const listSelect = `complaints.id, complaints.tenant_id, complaints.title, complaints.category, complaints.status,
	complaints.assignee, complaints.description, tenants.name AS tenant_name, properties.name AS property_name, units.code AS unit_code,
	complaints.created_at, complaints.updated_at, complaints.resolved_at,
	(SELECT COUNT(*) FROM request_notes WHERE request_notes.kind = 'complaint' AND request_notes.request_id = complaints.id) AS note_count`

func (r *SQLiteRepository) List(f Filter, page, perPage int) ([]ListItem, int64, error) {
	var total int64
	if err := r.filtered(f).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	rows := make([]ListItem, 0)
	err := r.filtered(f).Select(listSelect).
		Order("complaints.id DESC").
		Offset((page - 1) * perPage).Limit(perPage).
		Scan(&rows).Error
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *SQLiteRepository) FindDetail(id uint) (*Detail, error) {
	var d Detail
	err := r.db.Table("complaints").
		Joins("LEFT JOIN tenants ON tenants.id = complaints.tenant_id").
		Joins("LEFT JOIN properties ON properties.id = complaints.property_id").
		Joins("LEFT JOIN units ON units.id = complaints.unit_id").
		Select(listSelect+`, complaints.property_id, complaints.unit_id, complaints.resolution_notes`).
		Where("complaints.id = ?", id).
		Take(&d).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *SQLiteRepository) FindRecord(id uint) (*Complaint, error) {
	var c Complaint
	err := r.db.Where("id = ?", id).Take(&c).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// TenantUnit returns the unit and property a tenant is currently linked to. found is false if the tenant does not exist.
func (r *SQLiteRepository) TenantUnit(tenantID uint) (unitID, propertyID *uint, found bool, err error) {
	var row struct {
		UnitID     *uint
		PropertyID *uint
	}
	err = r.db.Table("tenants").Select("unit_id, property_id").Where("id = ?", tenantID).Take(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil, false, nil
	}
	if err != nil {
		return nil, nil, false, err
	}
	return row.UnitID, row.PropertyID, true, nil
}

func (r *SQLiteRepository) IsOption(slug, value string) (bool, error) {
	var n int64
	err := r.db.Table("options").Where("slug = ? AND value = ?", slug, value).Count(&n).Error
	return n > 0, err
}

func (r *SQLiteRepository) Create(c *Complaint) error {
	return r.db.Create(c).Error
}

func (r *SQLiteRepository) Update(id uint, updates map[string]any) error {
	return r.db.Model(&Complaint{}).Where("id = ?", id).Updates(updates).Error
}
