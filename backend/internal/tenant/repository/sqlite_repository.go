package repository

import (
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Tenant struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	UserID             uint      `gorm:"not null;index" json:"user_id"`
	Name               string    `gorm:"not null" json:"name"`
	Phone              string    `gorm:"not null" json:"phone"`
	Email              string    `json:"email"`
	PropertyID         *uint     `json:"property_id"`
	Status             string    `gorm:"not null;default:active" json:"status"`
	City               string    `json:"city"`
	UnitID             *uint     `json:"unit_id"`
	ContractEnd        *string   `json:"contract_end"`
	MonthlyRent        *float64  `json:"monthly_rent"`
	OutstandingBalance float64   `gorm:"not null;default:0" json:"outstanding_balance"`
	BalanceNote        string    `json:"balance_note"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// TenantFilter holds the optional list filters. Zero values mean "no filter".
// ContractEndFrom and ContractEndTo are inclusive "YYYY-MM-DD" dates.
type TenantFilter struct {
	Keyword         string
	Status          string
	TenantName      string
	PropertyUnit    string
	Email           string
	Phone           string
	ContractEndFrom string
	ContractEndTo   string
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

func (r *SQLiteRepository) Transaction(fn func(*gorm.DB) error) error {
	return r.db.Transaction(fn)
}

func (r *SQLiteRepository) Create(t *Tenant) error {
	return r.Transaction(func(tx *gorm.DB) error {
		return r.CreateInTx(tx, t)
	})
}

// CreateInTx creates a tenant and updates unit occupancy within the caller's transaction.
func (r *SQLiteRepository) CreateInTx(tx *gorm.DB, t *Tenant) error {
	if t.UnitID != nil {
		if err := occupyUnit(tx, t); err != nil {
			return err
		}
	}
	return tx.Create(t).Error
}

func (r *SQLiteRepository) FindByID(id uint) (*Tenant, error) {
	var tenant Tenant
	if err := r.db.First(&tenant, id).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

// Update saves the tenant and keeps unit occupancy in sync when the assigned unit changes.
func (r *SQLiteRepository) Update(t *Tenant) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var previous Tenant
		if err := tx.First(&previous, t.ID).Error; err != nil {
			return err
		}
		if t.Status == "former" {
			// A former tenant must not hold a unit; end any running contract first.
			var active int64
			if err := tx.Table("contracts").Where("tenant_id = ? AND status = 'active'", t.ID).Count(&active).Error; err != nil {
				return err
			}
			if active > 0 {
				return ErrTenantHasActiveContract
			}
			t.UnitID = nil
			t.PropertyID = nil
		}
		if !sameUnit(previous.UnitID, t.UnitID) {
			if err := vacateUnit(tx, previous.UnitID); err != nil {
				return err
			}
			if t.UnitID != nil {
				if err := occupyUnit(tx, t); err != nil {
					return err
				}
			}
		}
		return tx.Save(t).Error
	})
}

func (r *SQLiteRepository) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var tenant Tenant
		if err := tx.First(&tenant, id).Error; err != nil {
			return err
		}
		if err := vacateUnit(tx, tenant.UnitID); err != nil {
			return err
		}
		return tx.Delete(&Tenant{}, id).Error
	})
}

var (
	ErrUnitNotFound            = errors.New("unit not found")
	ErrUnitNotVacant           = errors.New("unit is not vacant")
	ErrTenantHasActiveContract = errors.New("tenant has an active contract")
)

// occupyUnit checks the tenant's unit is vacant, marks it occupied, and sets the tenant's property from the unit.
func occupyUnit(tx *gorm.DB, t *Tenant) error {
	propertyID, err := lookupVacantUnit(tx, *t.UnitID)
	if err != nil {
		return err
	}
	t.PropertyID = &propertyID
	return tx.Exec(`UPDATE units SET status = 'occupied' WHERE id = ?`, *t.UnitID).Error
}

// ValidateVacantUnit returns an error when the unit does not exist or is already occupied.
func (r *SQLiteRepository) ValidateVacantUnit(unitID uint) error {
	_, err := lookupVacantUnit(r.db, unitID)
	return err
}

func lookupVacantUnit(db *gorm.DB, unitID uint) (uint, error) {
	var unit struct {
		Status     string
		PropertyID uint
	}
	err := db.Raw(`SELECT units.status, blocks.property_id FROM units
		JOIN blocks ON blocks.id = units.block_id WHERE units.id = ?`, unitID).Scan(&unit).Error
	if err != nil {
		return 0, err
	}
	if unit.PropertyID == 0 {
		return 0, ErrUnitNotFound
	}
	if unit.Status != "vacant" {
		return 0, ErrUnitNotVacant
	}
	return unit.PropertyID, nil
}

// vacateUnit marks a previously occupied unit vacant again. A nil unit is a no-op.
func vacateUnit(tx *gorm.DB, unitID *uint) error {
	if unitID == nil {
		return nil
	}
	return tx.Exec(`UPDATE units SET status = 'vacant' WHERE id = ? AND status = 'occupied'`, *unitID).Error
}

func sameUnit(a, b *uint) bool {
	if a == nil || b == nil {
		return a == b
	}
	return *a == *b
}

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
	Unit            *string `json:"unit"`
}

func (r *SQLiteRepository) filtered(f TenantFilter) *gorm.DB {
	q := r.db.Model(&Tenant{}).
		Joins("LEFT JOIN properties ON properties.id = tenants.property_id").
		Joins("LEFT JOIN units ON units.id = tenants.unit_id")
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("(LOWER(tenants.name) LIKE ? OR LOWER(tenants.email) LIKE ? OR tenants.phone LIKE ?)", like, like, like)
	}
	if f.Status != "" {
		q = q.Where("tenants.status = ?", f.Status)
	}
	if f.TenantName != "" {
		q = q.Where("LOWER(tenants.name) LIKE ?", "%"+strings.ToLower(f.TenantName)+"%")
	}
	if f.PropertyUnit != "" {
		like := "%" + strings.ToLower(f.PropertyUnit) + "%"
		q = q.Where("(LOWER(properties.name) LIKE ? OR LOWER(units.code) LIKE ?)", like, like)
	}
	if f.Email != "" {
		q = q.Where("LOWER(tenants.email) LIKE ?", "%"+strings.ToLower(f.Email)+"%")
	}
	if f.Phone != "" {
		q = q.Where("tenants.phone LIKE ?", "%"+f.Phone+"%")
	}
	if f.ContractEndFrom != "" {
		q = q.Where("tenants.contract_end >= ?", f.ContractEndFrom)
	}
	if f.ContractEndTo != "" {
		q = q.Where("tenants.contract_end <= ?", f.ContractEndTo)
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
		Select("tenants.*, properties.name AS property_name, properties.address AS property_address, units.code AS unit").
		Order("tenants.id asc").
		Offset(offset).Limit(perPage).
		Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}
	return items, total, nil
}
