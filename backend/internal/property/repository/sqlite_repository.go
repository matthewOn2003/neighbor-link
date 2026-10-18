package repository

import (
	"strings"
	"time"

	"gorm.io/gorm"
)

type Property struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	DeveloperID  *uint     `json:"developer_id"`
	Name         string    `gorm:"not null" json:"name"`
	PropertyType string    `gorm:"not null;default:condo" json:"property_type"`
	Address      string    `gorm:"not null" json:"address"`
	City         string    `json:"city"`
	Region       string    `json:"region"`
	Description  string    `json:"description"`
	CoverImage   *string   `json:"cover_image"`
	WifiSSID     string    `gorm:"column:wifi_ssid" json:"wifi_ssid"`
	WifiPassword string    `json:"wifi_password"`
	Notes        string    `json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// PropertyFilter holds the optional list filters. Zero values mean "no filter".
type PropertyFilter struct {
	Keyword      string
	PropertyType string
	DeveloperID  *uint
	Region       string
}

type PropertyListItem struct {
	Property
	DeveloperName *string `json:"developer_name"`
	BlockCount    int64   `json:"block_count"`
	UnitCount     int64   `json:"unit_count"`
	OccupiedCount int64   `json:"occupied_count"`
}

type BlockItem struct {
	ID            uint   `json:"id"`
	PropertyID    uint   `json:"property_id"`
	Code          string `json:"code"`
	Name          string `json:"name"`
	FloorCount    int    `json:"floor_count"`
	UnitsPerFloor int    `json:"units_per_floor"`
	UnitCount     int64  `json:"unit_count"`
	OccupiedCount int64  `json:"occupied_count"`
}

type BlockFilter struct {
	PropertyID uint
}

type FloorItem struct {
	ID            uint  `json:"id"`
	BlockID       uint  `json:"block_id"`
	Level         int   `json:"level"`
	UnitCount     int64 `json:"unit_count"`
	OccupiedCount int64 `json:"occupied_count"`
}

type FloorFilter struct {
	BlockID uint
}

type BlockDetail struct {
	BlockItem
	PropertyName string `json:"property_name"`
}

type UnitFilter struct {
	PropertyID *uint
	BlockID    *uint
	FloorID    *uint
	Status     string
	Keyword    string
}

type UnitListItem struct {
	ID         uint    `json:"id"`
	BlockID    uint    `json:"block_id"`
	FloorID    uint    `json:"floor_id"`
	BlockCode  string  `json:"block_code"`
	FloorLevel int     `json:"floor_level"`
	Code       string  `json:"code"`
	Bedrooms   int     `json:"bedrooms"`
	SizeSqft   int     `json:"size_sqft"`
	Status     string  `json:"status"`
	TenantName *string `json:"tenant_name"`
}

type FloorDetail struct {
	ID           uint   `json:"id"`
	BlockID      uint   `json:"block_id"`
	Level        int    `json:"level"`
	BlockCode    string `json:"block_code"`
	BlockName    string `json:"block_name"`
	PropertyID   uint   `json:"property_id"`
	PropertyName string `json:"property_name"`
}

type FacetCount struct {
	Value string `json:"value"`
	Count int64  `json:"count"`
}

type DeveloperOption struct {
	ID            uint   `json:"id"`
	Name          string `json:"name"`
	PropertyCount int64  `json:"property_count"`
}

type PropertyFacets struct {
	Types      []FacetCount      `json:"types"`
	Regions    []FacetCount      `json:"regions"`
	Developers []DeveloperOption `json:"developers"`
}

const propertyListSelect = `properties.*, developers.name AS developer_name,
	(SELECT COUNT(*) FROM blocks WHERE blocks.property_id = properties.id) AS block_count,
	(SELECT COUNT(*) FROM units JOIN blocks ON blocks.id = units.block_id WHERE blocks.property_id = properties.id) AS unit_count,
	(SELECT COUNT(*) FROM units JOIN blocks ON blocks.id = units.block_id WHERE blocks.property_id = properties.id AND units.status = 'occupied') AS occupied_count`

const blockItemSelect = `blocks.id, blocks.property_id, blocks.code, blocks.name, blocks.floor_count, blocks.units_per_floor,
	(SELECT COUNT(*) FROM units WHERE units.block_id = blocks.id) AS unit_count,
	(SELECT COUNT(*) FROM units WHERE units.block_id = blocks.id AND units.status = 'occupied') AS occupied_count`

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
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec(`UPDATE tenants SET unit_id = NULL WHERE unit_id IN (
			SELECT units.id FROM units JOIN blocks ON blocks.id = units.block_id WHERE blocks.property_id = ?)`, id).Error; err != nil {
			return err
		}
		if err := tx.Exec(`DELETE FROM units WHERE block_id IN (SELECT id FROM blocks WHERE property_id = ?)`, id).Error; err != nil {
			return err
		}
		if err := tx.Exec(`DELETE FROM floors WHERE block_id IN (SELECT id FROM blocks WHERE property_id = ?)`, id).Error; err != nil {
			return err
		}
		if err := tx.Exec(`DELETE FROM blocks WHERE property_id = ?`, id).Error; err != nil {
			return err
		}
		return tx.Delete(&Property{}, id).Error
	})
}

func (r *SQLiteRepository) filteredProperties(f PropertyFilter) *gorm.DB {
	q := r.db.Table("properties").
		Joins("LEFT JOIN developers ON developers.id = properties.developer_id")
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("LOWER(properties.name) LIKE ? OR LOWER(properties.address) LIKE ? OR LOWER(properties.city) LIKE ? OR LOWER(developers.name) LIKE ?", like, like, like, like)
	}
	if f.PropertyType != "" {
		q = q.Where("properties.property_type = ?", f.PropertyType)
	}
	if f.DeveloperID != nil {
		q = q.Where("properties.developer_id = ?", *f.DeveloperID)
	}
	if f.Region != "" {
		q = q.Where("properties.region = ?", f.Region)
	}
	return q
}

func (r *SQLiteRepository) List(f PropertyFilter, currentPage, perPage int) ([]PropertyListItem, int64, error) {
	var total int64
	if err := r.filteredProperties(f).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	items := make([]PropertyListItem, 0)
	offset := (currentPage - 1) * perPage
	err := r.filteredProperties(f).
		Select(propertyListSelect).
		Order("properties.id asc").
		Offset(offset).Limit(perPage).
		Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *SQLiteRepository) Facets() (*PropertyFacets, error) {
	types := make([]FacetCount, 0)
	if err := r.db.Raw(`SELECT property_type AS value, COUNT(*) AS count FROM properties GROUP BY property_type ORDER BY property_type`).Scan(&types).Error; err != nil {
		return nil, err
	}
	regions := make([]FacetCount, 0)
	if err := r.db.Raw(`SELECT region AS value, COUNT(*) AS count FROM properties WHERE region <> '' GROUP BY region ORDER BY region`).Scan(&regions).Error; err != nil {
		return nil, err
	}
	developers := make([]DeveloperOption, 0)
	if err := r.db.Raw(`SELECT developers.id, developers.name, COUNT(properties.id) AS property_count
		FROM developers LEFT JOIN properties ON properties.developer_id = developers.id
		GROUP BY developers.id, developers.name ORDER BY developers.name`).Scan(&developers).Error; err != nil {
		return nil, err
	}
	return &PropertyFacets{Types: types, Regions: regions, Developers: developers}, nil
}

func (r *SQLiteRepository) FindDetail(id uint) (*PropertyListItem, error) {
	var detail PropertyListItem
	err := r.filteredProperties(PropertyFilter{}).
		Select(propertyListSelect).
		Where("properties.id = ?", id).
		Limit(1).
		Scan(&detail).Error
	if err != nil {
		return nil, err
	}
	if detail.ID == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &detail, nil
}

func (r *SQLiteRepository) ListBlocks(f BlockFilter, currentPage, perPage int) ([]BlockItem, int64, error) {
	var total int64
	if err := r.db.Table("blocks").Where("blocks.property_id = ?", f.PropertyID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	items := make([]BlockItem, 0)
	err := r.db.Raw(`SELECT `+blockItemSelect+` FROM blocks WHERE blocks.property_id = ? ORDER BY blocks.code LIMIT ? OFFSET ?`,
		f.PropertyID, perPage, (currentPage-1)*perPage).Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *SQLiteRepository) FindBlockDetail(id uint) (*BlockDetail, error) {
	var detail BlockDetail
	err := r.db.Raw(`SELECT `+blockItemSelect+`, properties.name AS property_name
		FROM blocks JOIN properties ON properties.id = blocks.property_id WHERE blocks.id = ?`, id).Scan(&detail).Error
	if err != nil {
		return nil, err
	}
	if detail.ID == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &detail, nil
}

func (r *SQLiteRepository) ListFloors(f FloorFilter, currentPage, perPage int) ([]FloorItem, int64, error) {
	var total int64
	if err := r.db.Table("floors").Where("floors.block_id = ?", f.BlockID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	items := make([]FloorItem, 0)
	err := r.db.Raw(`SELECT floors.id, floors.block_id, floors.level,
		(SELECT COUNT(*) FROM units WHERE units.floor_id = floors.id) AS unit_count,
		(SELECT COUNT(*) FROM units WHERE units.floor_id = floors.id AND units.status = 'occupied') AS occupied_count
		FROM floors WHERE floors.block_id = ? ORDER BY floors.level LIMIT ? OFFSET ?`,
		f.BlockID, perPage, (currentPage-1)*perPage).Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *SQLiteRepository) FindFloorDetail(id uint) (*FloorDetail, error) {
	var detail FloorDetail
	err := r.db.Raw(`SELECT floors.id, floors.block_id, floors.level, blocks.code AS block_code, blocks.name AS block_name,
		blocks.property_id, properties.name AS property_name
		FROM floors
		JOIN blocks ON blocks.id = floors.block_id
		JOIN properties ON properties.id = blocks.property_id
		WHERE floors.id = ?`, id).Scan(&detail).Error
	if err != nil {
		return nil, err
	}
	if detail.ID == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &detail, nil
}

func (r *SQLiteRepository) filteredUnits(f UnitFilter) *gorm.DB {
	q := r.db.Table("units").
		Joins("JOIN blocks ON blocks.id = units.block_id").
		Joins("JOIN floors ON floors.id = units.floor_id")
	if f.PropertyID != nil {
		q = q.Where("blocks.property_id = ?", *f.PropertyID)
	}
	if f.BlockID != nil {
		q = q.Where("units.block_id = ?", *f.BlockID)
	}
	if f.FloorID != nil {
		q = q.Where("units.floor_id = ?", *f.FloorID)
	}
	if f.Status != "" {
		q = q.Where("units.status = ?", f.Status)
	}
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("LOWER(units.code) LIKE ?", like)
	}
	return q
}

func (r *SQLiteRepository) ListUnits(f UnitFilter, currentPage, perPage int) ([]UnitListItem, int64, error) {
	var total int64
	if err := r.filteredUnits(f).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	items := make([]UnitListItem, 0)
	err := r.filteredUnits(f).
		Select(`units.id, units.block_id, units.floor_id, blocks.code AS block_code, floors.level AS floor_level,
			units.code, units.bedrooms, units.size_sqft, units.status,
			(SELECT tenants.name FROM tenants WHERE tenants.unit_id = units.id LIMIT 1) AS tenant_name`).
		Order("units.code asc").
		Offset((currentPage - 1) * perPage).Limit(perPage).
		Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}
	return items, total, nil
}


func (r *SQLiteRepository) Count() (int64, error) {
	var total int64
	err := r.db.Model(&Property{}).Count(&total).Error
	return total, err
}
