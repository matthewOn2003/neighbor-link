package repository

import (
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

var ErrNotFound = errors.New("maintenance request not found")

// Request is a maintenance ticket. tenant_id stays NULL for admin-created requests.
type Request struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	PropertyID      *uint      `json:"property_id"`
	UnitID          *uint      `json:"unit_id"`
	TenantID        *uint      `json:"tenant_id"`
	Category        string     `gorm:"not null" json:"category"`
	Priority        string     `gorm:"not null" json:"priority"`
	Title           string     `gorm:"not null" json:"title"`
	Description     string     `json:"description"`
	Status          string     `gorm:"not null" json:"status"`
	Assignee        string     `json:"assignee"`
	ResolutionNotes string     `json:"resolution_notes"`
	ResolvedAt      *time.Time `json:"resolved_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (Request) TableName() string { return "maintenance_requests" }

type ListItem struct {
	ID           uint       `json:"id"`
	Title        string     `json:"title"`
	Category     string     `json:"category"`
	Priority     string     `json:"priority"`
	Status       string     `json:"status"`
	Source       string     `json:"source"`
	Assignee     string     `json:"assignee"`
	Description  string     `json:"description"`
	PropertyName *string    `json:"property_name"`
	UnitCode     *string    `json:"unit_code"`
	TenantName   *string    `json:"tenant_name"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	ResolvedAt   *time.Time `json:"resolved_at"`
	ScheduledAt  *string    `json:"scheduled_at"`
	NoteCount    int64      `json:"note_count"`
}

// Attachment is a photo attached to a repair request. FileKey is the object-storage key.
type Attachment struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	RequestID   uint      `gorm:"not null" json:"request_id"`
	FileKey     string    `gorm:"not null" json:"-"`
	FileName    string    `json:"file_name"`
	ContentType string    `json:"content_type"`
	SizeBytes   int64     `json:"size_bytes"`
	CreatedAt   time.Time `json:"created_at"`
}

func (Attachment) TableName() string { return "maintenance_attachments" }

type Detail struct {
	ListItem
	PropertyID      *uint  `json:"property_id"`
	UnitID          *uint  `json:"unit_id"`
	TenantID        *uint  `json:"tenant_id"`
	ResolutionNotes string `json:"resolution_notes"`
}

// Filter holds optional list filters. Zero values mean no filter.
type Filter struct {
	Keyword     string
	Status      string
	Priority    string
	Category    string
	Source      string
	TenantID    *uint
	PropertyID  *uint
	UnitID      *uint
	CreatedFrom string
	CreatedTo   string
}

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) *SQLiteRepository {
	return &SQLiteRepository{db: db}
}

func (r *SQLiteRepository) filtered(f Filter) *gorm.DB {
	q := r.db.Table("maintenance_requests").
		Joins("LEFT JOIN properties ON properties.id = maintenance_requests.property_id").
		Joins("LEFT JOIN units ON units.id = maintenance_requests.unit_id").
		Joins("LEFT JOIN tenants ON tenants.id = maintenance_requests.tenant_id")
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("LOWER(maintenance_requests.title) LIKE ? OR LOWER(maintenance_requests.description) LIKE ? OR LOWER(units.code) LIKE ? OR LOWER(properties.name) LIKE ?", like, like, like, like)
	}
	if f.Status != "" {
		q = q.Where("maintenance_requests.status = ?", f.Status)
	}
	if f.Priority != "" {
		q = q.Where("maintenance_requests.priority = ?", f.Priority)
	}
	if f.Category != "" {
		q = q.Where("maintenance_requests.category = ?", f.Category)
	}
	if f.Source == "admin" {
		q = q.Where("maintenance_requests.tenant_id IS NULL")
	} else if f.Source == "tenant" {
		q = q.Where("maintenance_requests.tenant_id IS NOT NULL")
	}
	if f.TenantID != nil {
		q = q.Where("maintenance_requests.tenant_id = ?", *f.TenantID)
	}
	if f.PropertyID != nil {
		q = q.Where("maintenance_requests.property_id = ?", *f.PropertyID)
	}
	if f.UnitID != nil {
		q = q.Where("maintenance_requests.unit_id = ?", *f.UnitID)
	}
	// created_at is stored in local time, so the first 10 characters are the local date.
	if f.CreatedFrom != "" {
		q = q.Where("substr(maintenance_requests.created_at, 1, 10) >= ?", f.CreatedFrom)
	}
	if f.CreatedTo != "" {
		q = q.Where("substr(maintenance_requests.created_at, 1, 10) <= ?", f.CreatedTo)
	}
	return q
}

const listSelect = `maintenance_requests.id, maintenance_requests.title, maintenance_requests.category,
	maintenance_requests.priority, maintenance_requests.status, maintenance_requests.assignee,
	maintenance_requests.description,
	CASE WHEN maintenance_requests.tenant_id IS NULL THEN 'admin' ELSE 'tenant' END AS source,
	properties.name AS property_name, units.code AS unit_code, tenants.name AS tenant_name,
	maintenance_requests.created_at, maintenance_requests.updated_at, maintenance_requests.resolved_at,
	maintenance_requests.scheduled_at,
	(SELECT COUNT(*) FROM request_notes WHERE request_notes.kind = 'maintenance' AND request_notes.request_id = maintenance_requests.id) AS note_count`

func (r *SQLiteRepository) List(f Filter, page, perPage int) ([]ListItem, int64, error) {
	var total int64
	if err := r.filtered(f).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	rows := make([]ListItem, 0)
	err := r.filtered(f).Select(listSelect).
		Order("maintenance_requests.id DESC").
		Offset((page - 1) * perPage).Limit(perPage).
		Scan(&rows).Error
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

// ListActiveForTenant returns the tenant's open and in-progress requests, newest first, up to limit rows.
func (r *SQLiteRepository) ListActiveForTenant(tenantID uint, limit int) ([]ListItem, int64, error) {
	base := r.filtered(Filter{TenantID: &tenantID}).
		Where("maintenance_requests.status IN ?", []string{"open", "in_progress"})
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	rows := make([]ListItem, 0)
	err := r.filtered(Filter{TenantID: &tenantID}).
		Where("maintenance_requests.status IN ?", []string{"open", "in_progress"}).
		Select(listSelect).
		Order("maintenance_requests.id DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *SQLiteRepository) FindDetail(id uint) (*Detail, error) {
	var d Detail
	err := r.db.Table("maintenance_requests").
		Joins("LEFT JOIN properties ON properties.id = maintenance_requests.property_id").
		Joins("LEFT JOIN units ON units.id = maintenance_requests.unit_id").
		Joins("LEFT JOIN tenants ON tenants.id = maintenance_requests.tenant_id").
		Select(listSelect+`, maintenance_requests.property_id, maintenance_requests.unit_id, maintenance_requests.tenant_id,
			maintenance_requests.resolution_notes`).
		Where("maintenance_requests.id = ?", id).
		Scan(&d).Error
	if err != nil {
		return nil, err
	}
	if d.ID == 0 {
		return nil, ErrNotFound
	}
	return &d, nil
}

// UnitPropertyID returns the property that owns a unit, derived through its block.
func (r *SQLiteRepository) UnitPropertyID(unitID uint) (uint, bool, error) {
	var row struct{ PropertyID uint }
	err := r.db.Raw(`SELECT blocks.property_id AS property_id FROM units
		JOIN blocks ON blocks.id = units.block_id WHERE units.id = ?`, unitID).Scan(&row).Error
	if err != nil {
		return 0, false, err
	}
	if row.PropertyID == 0 {
		return 0, false, nil
	}
	return row.PropertyID, true, nil
}

// IsOption reports whether value is an option under the given dictionary slug.
func (r *SQLiteRepository) IsOption(slug, value string) (bool, error) {
	var n int64
	err := r.db.Table("options").Where("slug = ? AND value = ?", slug, value).Count(&n).Error
	return n > 0, err
}

func (r *SQLiteRepository) Create(m *Request) error {
	return r.db.Create(m).Error
}

func (r *SQLiteRepository) FindRequest(id uint) (*Request, error) {
	var m Request
	err := r.db.First(&m, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *SQLiteRepository) Update(id uint, updates map[string]any) error {
	return r.db.Model(&Request{}).Where("id = ?", id).Updates(updates).Error
}

// AddAttachment records a photo uploaded for a repair request.
func (r *SQLiteRepository) AddAttachment(a *Attachment) error {
	return r.db.Create(a).Error
}

// ListAttachments returns the photos of one repair request, oldest first.
func (r *SQLiteRepository) ListAttachments(requestID uint) ([]Attachment, error) {
	rows := make([]Attachment, 0)
	err := r.db.Where("request_id = ?", requestID).Order("id ASC").Find(&rows).Error
	return rows, err
}
