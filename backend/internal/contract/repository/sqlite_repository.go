package repository

import (
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

var (
	ErrNotFound             = errors.New("contract not found")
	ErrTenantNotFound       = errors.New("tenant not found")
	ErrActiveContractExists = errors.New("tenant already has an active contract")
	ErrInvalidContract      = errors.New("invalid contract")
)

type Contract struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	TenantID        uint      `gorm:"not null;index" json:"tenant_id"`
	PropertyID      *uint     `json:"property_id"`
	UnitID          *uint     `json:"unit_id"`
	StartDate       string    `gorm:"not null" json:"start_date"`
	EndDate         string    `gorm:"not null" json:"end_date"`
	MonthlyRent     float64   `gorm:"not null" json:"monthly_rent"`
	SecurityDeposit float64   `gorm:"not null;default:0" json:"security_deposit"`
	BillingDay      int       `gorm:"not null;default:1" json:"billing_day"`
	Status          string    `gorm:"not null;default:draft;index" json:"status"`
	Notes           string    `json:"notes"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type ContractFilter struct {
	Keyword string
	Status  string
}

type ContractListItem struct {
	Contract
	TenantName   string  `json:"tenant_name"`
	TenantPhone  string  `json:"tenant_phone"`
	PropertyName *string `json:"property_name"`
	UnitCode     *string `json:"unit_code"`
}

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) *SQLiteRepository {
	return &SQLiteRepository{db: db}
}

func (r *SQLiteRepository) List(f ContractFilter, page, perPage int) ([]ContractListItem, int64, error) {
	q := r.db.Table("contracts").
		Joins("JOIN tenants ON tenants.id = contracts.tenant_id").
		Joins("LEFT JOIN properties ON properties.id = contracts.property_id").
		Joins("LEFT JOIN units ON units.id = contracts.unit_id")
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("LOWER(tenants.name) LIKE ? OR LOWER(contracts.notes) LIKE ?", like, like)
	}
	if f.Status != "" {
		q = q.Where("contracts.status = ?", f.Status)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	rows := make([]ContractListItem, 0)
	err := q.Select("contracts.*, tenants.name AS tenant_name, tenants.phone AS tenant_phone, properties.name AS property_name, units.code AS unit_code").
		Order("contracts.id DESC").
		Offset((page - 1) * perPage).
		Limit(perPage).
		Scan(&rows).Error
	return rows, total, err
}

func (r *SQLiteRepository) Detail(id uint) (*ContractListItem, error) {
	var row ContractListItem
	err := r.db.Table("contracts").
		Select("contracts.*, tenants.name AS tenant_name, tenants.phone AS tenant_phone, properties.name AS property_name, units.code AS unit_code").
		Joins("JOIN tenants ON tenants.id = contracts.tenant_id").
		Joins("LEFT JOIN properties ON properties.id = contracts.property_id").
		Joins("LEFT JOIN units ON units.id = contracts.unit_id").
		Where("contracts.id = ?", id).
		Take(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &row, nil
}

// Save creates or updates a contract and keeps the tenant and unit in step with it.
// When a running (active) contract stops running, the tenant is released; see releaseTenant.
func (r *SQLiteRepository) Save(c *Contract) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var tenant struct {
			ID         uint
			PropertyID *uint
			UnitID     *uint
			Status     string
		}
		err := tx.Table("tenants").Select("id, property_id, unit_id, status").Where("id = ?", c.TenantID).Take(&tenant).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrTenantNotFound
		}
		if err != nil {
			return err
		}
		if tenant.Status == "former" && c.Status == "active" {
			return ErrInvalidContract
		}
		c.PropertyID, c.UnitID = tenant.PropertyID, tenant.UnitID

		if c.Status == "active" {
			var n int64
			q := tx.Model(&Contract{}).Where("tenant_id = ? AND status = 'active'", c.TenantID)
			if c.ID != 0 {
				q = q.Where("id <> ?", c.ID)
			}
			if err := q.Count(&n).Error; err != nil {
				return err
			}
			if n > 0 {
				return ErrActiveContractExists
			}
		}

		// The stored state tells us whether this save ends or moves a contract that was running.
		previousStatus := ""
		previousTenantID := uint(0)
		if c.ID != 0 {
			var previous Contract
			err := tx.Select("id", "tenant_id", "status").Where("id = ?", c.ID).Take(&previous).Error
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			previousStatus = previous.Status
			previousTenantID = previous.TenantID
		}

		if c.ID == 0 {
			if err := tx.Create(c).Error; err != nil {
				return err
			}
		} else {
			res := tx.Model(&Contract{}).Where("id = ?", c.ID).Updates(map[string]any{
				"tenant_id":        c.TenantID,
				"property_id":      c.PropertyID,
				"unit_id":          c.UnitID,
				"start_date":       c.StartDate,
				"end_date":         c.EndDate,
				"monthly_rent":     c.MonthlyRent,
				"security_deposit": c.SecurityDeposit,
				"billing_day":      c.BillingDay,
				"status":           c.Status,
				"notes":            c.Notes,
			})
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return ErrNotFound
			}
		}

		// The previous tenant loses this contract when it stopped running or was moved to someone else.
		if previousStatus == "active" && (c.Status != "active" || previousTenantID != c.TenantID) {
			if err := releaseTenant(tx, previousTenantID); err != nil {
				return err
			}
		}
		if c.Status == "active" {
			return tx.Table("tenants").Where("id = ?", c.TenantID).Updates(map[string]any{
				"monthly_rent": c.MonthlyRent,
				"contract_end": c.EndDate,
				"status":       "active",
			}).Error
		}
		return nil
	})
}

// ExpireDue marks active contracts whose end date is before today as expired and releases their tenants.
// It returns how many contracts it expired.
func (r *SQLiteRepository) ExpireDue(today string) (int64, error) {
	var ids []uint
	if err := r.db.Model(&Contract{}).Where("status = 'active' AND end_date < ?", today).Pluck("id", &ids).Error; err != nil {
		return 0, err
	}
	var expired int64
	for _, id := range ids {
		done, err := r.expireOne(id)
		if err != nil {
			return expired, err
		}
		if done {
			expired++
		}
	}
	return expired, nil
}

// expireOne expires one contract if it is still active. It reports false when the contract changed since it was listed.
func (r *SQLiteRepository) expireOne(id uint) (bool, error) {
	done := false
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var c Contract
		if err := tx.Select("id", "tenant_id", "status").Where("id = ?", id).Take(&c).Error; err != nil {
			return err
		}
		if c.Status != "active" {
			return nil
		}
		if err := tx.Model(&Contract{}).Where("id = ?", id).Update("status", "expired").Error; err != nil {
			return err
		}
		done = true
		return releaseTenant(tx, c.TenantID)
	})
	return done, err
}

// releaseTenant ends a tenant's residency once none of their contracts is active. The unit they held becomes
// vacant and the tenant is marked former with no unit or property. It does nothing while an active contract remains.
// Runs inside the caller's transaction.
func releaseTenant(tx *gorm.DB, tenantID uint) error {
	var active int64
	if err := tx.Model(&Contract{}).Where("tenant_id = ? AND status = 'active'", tenantID).Count(&active).Error; err != nil {
		return err
	}
	if active > 0 {
		return nil
	}
	var holder struct {
		UnitID *uint
	}
	if err := tx.Table("tenants").Select("unit_id").Where("id = ?", tenantID).Take(&holder).Error; err != nil {
		return err
	}
	if holder.UnitID != nil {
		if err := tx.Exec(`UPDATE units SET status = 'vacant' WHERE id = ? AND status = 'occupied'`, *holder.UnitID).Error; err != nil {
			return err
		}
	}
	return tx.Table("tenants").Where("id = ?", tenantID).Updates(map[string]any{
		"status":      "former",
		"unit_id":     nil,
		"property_id": nil,
	}).Error
}
