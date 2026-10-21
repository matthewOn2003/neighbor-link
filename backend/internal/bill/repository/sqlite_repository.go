package repository

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"backend/internal/bill/rules"

	"gorm.io/gorm"
)

var (
	ErrNotFound         = errors.New("bill not found")
	ErrContractNotFound = errors.New("active contract not found")
	ErrDuplicatePeriod  = errors.New("bill already exists for billing period")
	ErrInvalidBill      = errors.New("invalid bill")
	ErrAlreadyVoided    = errors.New("bill is already void")
)

type Bill struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	ContractID       uint      `gorm:"not null;index" json:"contract_id"`
	TenantID         uint      `gorm:"not null;index" json:"tenant_id"`
	BillingPeriod    string    `gorm:"not null" json:"billing_period"`
	DueDate          string    `gorm:"not null" json:"due_date"`
	Amount           float64   `gorm:"not null" json:"amount"`
	LateFee          float64   `gorm:"not null;default:0" json:"late_fee"`
	AmountPaid       float64   `gorm:"not null;default:0" json:"amount_paid"`
	Status           string    `gorm:"not null;default:unpaid;index" json:"status"`
	IssuedAt         *string   `json:"issued_at"`
	PaidAt           *string   `json:"paid_at"`
	PaymentMethod    string    `json:"payment_method"`
	PaymentReference string    `json:"payment_reference"`
	Notes            string    `json:"notes"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type BillFilter struct{ Keyword, Status, Period string }
type BillListItem struct {
	Bill
	TenantName        string  `json:"tenant_name"`
	TenantPhone       string  `json:"tenant_phone"`
	PropertyName      *string `json:"property_name"`
	UnitCode          *string `json:"unit_code"`
	ContractEnd       string  `json:"contract_end"`
	PendingProofCount int64   `json:"-"`
	IsOverdue         bool    `json:"is_overdue"`
	DisplayStatus     string  `json:"display_status"`
}

// Payment is one recorded payment against a bill. Manual entries have ProofID nil.
type Payment struct {
	ID        uint    `gorm:"primaryKey"`
	BillID    uint    `gorm:"not null;index"`
	TenantID  uint    `gorm:"not null"`
	Amount    float64 `gorm:"not null"`
	Method    string
	Reference string
	PaidAt    string `gorm:"not null"`
	ProofID   *uint
	CreatedAt time.Time
}

func (Payment) TableName() string { return "payments" }

// ErrNotEditable is returned when a bill's stored status does not allow editing.
var ErrNotEditable = errors.New("bill is not editable")

// pendingProofSubquery counts payment proofs awaiting review for each bill row.
const pendingProofSubquery = "(SELECT COUNT(*) FROM payment_proofs pp WHERE pp.bill_id = bills.id AND pp.status = 'pending') AS pending_proof_count"

type BillSummary struct {
	TotalBills   int64   `json:"total_bills"`
	TotalAmount  float64 `json:"total_amount"`
	TotalPaid    float64 `json:"total_paid"`
	Outstanding  float64 `json:"outstanding"`
	OverdueCount int64   `json:"overdue_count"`
}
type SQLiteRepository struct{ db *gorm.DB }

func NewSQLiteRepository(db *gorm.DB) *SQLiteRepository { return &SQLiteRepository{db: db} }

func (r *SQLiteRepository) base(f BillFilter) *gorm.DB {
	q := r.db.Table("bills").
		Joins("JOIN tenants ON tenants.id = bills.tenant_id").
		Joins("JOIN contracts ON contracts.id = bills.contract_id").
		Joins("LEFT JOIN properties ON properties.id = contracts.property_id").
		Joins("LEFT JOIN units ON units.id = contracts.unit_id")
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("LOWER(tenants.name) LIKE ? OR LOWER(bills.payment_reference) LIKE ? OR LOWER(bills.notes) LIKE ?", like, like, like)
	}
	if f.Status != "" {
		q = q.Where("bills.status = ?", f.Status)
	}
	if f.Period != "" {
		q = q.Where("bills.billing_period = ?", f.Period)
	}
	return q
}
func (r *SQLiteRepository) List(f BillFilter, page, perPage int) ([]BillListItem, int64, BillSummary, error) {
	q := r.base(f)
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, BillSummary{}, err
	}
	var summary BillSummary
	s := r.base(f).Select("COUNT(*) AS total_bills, COALESCE(SUM(bills.amount + bills.late_fee),0) AS total_amount, COALESCE(SUM(bills.amount_paid),0) AS total_paid, COALESCE(SUM(MAX(bills.amount + bills.late_fee - bills.amount_paid,0)),0) AS outstanding, COALESCE(SUM(CASE WHEN bills.status = 'overdue' THEN 1 ELSE 0 END),0) AS overdue_count")
	if err := s.Scan(&summary).Error; err != nil {
		return nil, 0, BillSummary{}, err
	}
	rows := make([]BillListItem, 0)
	err := q.Select("bills.*, tenants.name AS tenant_name, tenants.phone AS tenant_phone, properties.name AS property_name, units.code AS unit_code, contracts.end_date AS contract_end, " + pendingProofSubquery).
		Order("bills.due_date DESC, bills.id DESC").Offset((page - 1) * perPage).Limit(perPage).Scan(&rows).Error
	if err != nil {
		return nil, 0, BillSummary{}, err
	}
	overdueDay, err := r.OverdueDay()
	if err != nil {
		return nil, 0, BillSummary{}, err
	}
	for i := range rows {
		decorate(&rows[i], overdueDay, time.Now())
	}
	return rows, total, summary, nil
}
func (r *SQLiteRepository) Detail(id uint) (*BillListItem, error) {
	var row BillListItem
	err := r.db.Table("bills").Select("bills.*, tenants.name AS tenant_name, tenants.phone AS tenant_phone, properties.name AS property_name, units.code AS unit_code, contracts.end_date AS contract_end, "+pendingProofSubquery).
		Joins("JOIN tenants ON tenants.id = bills.tenant_id").Joins("JOIN contracts ON contracts.id = bills.contract_id").
		Joins("LEFT JOIN properties ON properties.id = contracts.property_id").Joins("LEFT JOIN units ON units.id = contracts.unit_id").
		Where("bills.id = ?", id).Take(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	overdueDay, err := r.OverdueDay()
	if err != nil {
		return nil, err
	}
	decorate(&row, overdueDay, time.Now())
	return &row, nil
}

// OverdueDay reads the overdue_day setting. A missing row falls back to 8, the product default.
func (r *SQLiteRepository) OverdueDay() (int, error) {
	var value string
	if err := r.db.Raw("SELECT value FROM billing_settings WHERE key = 'overdue_day'").Scan(&value).Error; err != nil {
		return 0, err
	}
	if value == "" {
		return 8, nil
	}
	day, err := strconv.Atoi(value)
	if err != nil {
		return 0, err
	}
	return day, nil
}

// decorate fills the derived is_overdue and display_status fields. It does not change stored status.
func decorate(b *BillListItem, overdueDay int, now time.Time) {
	b.IsOverdue = rules.IsOverdue(b.Status, b.BillingPeriod, overdueDay, now)
	b.DisplayStatus = rules.DisplayStatus(b.Status, b.PendingProofCount, b.IsOverdue)
}
// ActiveContracts returns active contracts. perPage <= 0 returns all rows without paging.
func (r *SQLiteRepository) ActiveContracts(page, perPage int) ([]map[string]any, int64, error) {
	base := func() *gorm.DB {
		return r.db.Table("contracts").
			Joins("JOIN tenants ON tenants.id = contracts.tenant_id").Joins("LEFT JOIN properties ON properties.id = contracts.property_id").Joins("LEFT JOIN units ON units.id = contracts.unit_id").
			Where("contracts.status = ?", "active")
	}
	var total int64
	if err := base().Count(&total).Error; err != nil {
		return nil, 0, err
	}
	rows := make([]map[string]any, 0)
	q := base().Select("contracts.id AS id, contracts.tenant_id AS tenant_id, tenants.name AS tenant_name, properties.name AS property_name, units.code AS unit_code, contracts.monthly_rent AS monthly_rent, contracts.billing_day AS billing_day").
		Order("tenants.name ASC, contracts.id ASC")
	if perPage > 0 {
		q = q.Offset((page - 1) * perPage).Limit(perPage)
	}
	if err := q.Scan(&rows).Error; err != nil {
		return nil, 0, err
	}
	if perPage <= 0 {
		total = int64(len(rows))
	}
	return rows, total, nil
}
func (r *SQLiteRepository) Create(b *Bill) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var c struct {
			ID          uint
			TenantID    uint
			MonthlyRent float64
			BillingDay  int
			Status      string
		}
		err := tx.Table("contracts").Select("id, tenant_id, monthly_rent, billing_day, status").Where("id = ?", b.ContractID).Take(&c).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrContractNotFound
		}
		if err != nil {
			return err
		}
		if c.Status != "active" {
			return ErrContractNotFound
		}
		b.TenantID = c.TenantID
		if b.Amount == 0 {
			b.Amount = c.MonthlyRent
		}
		if b.DueDate == "" {
			b.DueDate = b.BillingPeriod + "-" + twoDigit(c.BillingDay)
		}
		now := time.Now().Format("2006-01-02")
		b.IssuedAt = &now
		b.Status = "unpaid"
		if b.DueDate < time.Now().Format("2006-01-02") {
			b.Status = "overdue"
		}
		if err := tx.Create(b).Error; err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
				return ErrDuplicatePeriod
			}
			return err
		}
		return nil
	})
}
func twoDigit(day int) string {
	if day < 10 {
		return "0" + string(rune('0'+day))
	}
	return itoa(day)
}
func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b [20]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	return string(b[i:])
}
func (r *SQLiteRepository) RecordPayment(id uint, amount float64, method, reference, paidAt string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return ApplyPayment(tx, id, amount, method, reference, paidAt, nil)
	})
}

// ApplyPayment records a payment against a bill inside the caller's transaction and writes a payment row.
// proofID links the payment to an approved payment proof; pass nil for manual entries.
func ApplyPayment(tx *gorm.DB, id uint, amount float64, method, reference, paidAt string, proofID *uint) error {
	var b Bill
	if err := tx.First(&b, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrNotFound
		}
		return err
	}
	if b.Status == "void" {
		return ErrAlreadyVoided
	}
	if amount <= 0 || amount > b.Amount+b.LateFee-b.AmountPaid+0.000001 {
		return ErrInvalidBill
	}
	if paidAt == "" {
		paidAt = time.Now().Format("2006-01-02")
	}
	b.AmountPaid += amount
	if b.AmountPaid+0.000001 >= b.Amount+b.LateFee {
		b.Status = "paid"
		b.PaidAt = &paidAt
	} else if b.AmountPaid > 0 {
		b.Status = "partial"
	}
	b.PaymentMethod = method
	b.PaymentReference = reference
	if err := tx.Model(&Bill{}).Where("id = ?", id).Updates(map[string]any{"amount_paid": b.AmountPaid, "status": b.Status, "paid_at": b.PaidAt, "payment_method": b.PaymentMethod, "payment_reference": b.PaymentReference}).Error; err != nil {
		return err
	}
	return tx.Create(&Payment{BillID: id, TenantID: b.TenantID, Amount: amount, Method: method, Reference: reference, PaidAt: paidAt, ProofID: proofID}).Error
}

// Update changes the editable fields of a bill whose stored status is 'unpaid'.
// Keys in updates are column names. Missing bills return ErrNotFound; other states return ErrNotEditable.
func (r *SQLiteRepository) Update(id uint, updates map[string]any) error {
	updates["updated_at"] = time.Now()
	result := r.db.Model(&Bill{}).Where("id = ? AND status = 'unpaid'", id).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		var b Bill
		if err := r.db.First(&b, id).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrNotFound
			}
			return err
		}
		return ErrNotEditable
	}
	return nil
}
func (r *SQLiteRepository) Void(id uint) error {
	result := r.db.Model(&Bill{}).Where("id = ? AND status <> 'void' AND amount_paid = 0", id).Update("status", "void")
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		var b Bill
		if err := r.db.First(&b, id).Error; err != nil {
			return ErrNotFound
		}
		return ErrAlreadyVoided
	}
	return nil
}

func (r *SQLiteRepository) Generate(period string) (int64, error) {
	firstDay := period + "-01"
	result := r.db.Exec(`INSERT OR IGNORE INTO bills
  (contract_id, tenant_id, billing_period, due_date, amount, late_fee, amount_paid, status, issued_at, notes, created_at, updated_at)
  SELECT c.id, c.tenant_id, ?, date(?, printf('+%d days', c.billing_day - 1)),
   c.monthly_rent, 0, 0,
   CASE WHEN date(?, printf('+%d days', c.billing_day - 1)) < date('now') THEN 'overdue' ELSE 'unpaid' END,
   date('now'), 'Generated monthly bill', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  FROM contracts c WHERE c.status = 'active'`,
		period, firstDay, firstDay)
	return result.RowsAffected, result.Error
}
