package repository

import (
	"errors"
	"strings"
	"time"

	billrepo "backend/internal/bill/repository"

	"gorm.io/gorm"
)

var (
	ErrProofNotFound   = errors.New("payment proof not found")
	ErrProofNotPending = errors.New("payment proof is not pending")
)

// PaymentProof is a tenant-submitted proof of transfer. Status moves from pending to approved or rejected once.
type PaymentProof struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	BillID       uint       `json:"bill_id"`
	TenantID     uint       `json:"tenant_id"`
	Amount       float64    `json:"amount"`
	PaidAt       string     `json:"paid_at"`
	Reference    string     `json:"reference"`
	FileKey      string     `json:"-"`
	FileURL      string     `json:"file_url"`
	Status       string     `json:"status"`
	RejectReason string     `json:"reject_reason"`
	ReviewedBy   string     `json:"reviewed_by"`
	ReviewedAt   *time.Time `json:"reviewed_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (PaymentProof) TableName() string { return "payment_proofs" }

// ProofFilter holds optional filters for the payment proof list. Zero values mean no filter.
type ProofFilter struct {
	Keyword    string
	Status     string
	PropertyID *uint
	BlockID    *uint
	UnitID     *uint
	PaidFrom   string
	PaidTo     string
	AmountMin  *float64
	AmountMax  *float64
}

// PaymentFilter holds optional filters for the payment record list. Zero values mean no filter.
type PaymentFilter = ProofFilter

type ProofListItem struct {
	ID           uint       `json:"id"`
	BillID       uint       `json:"bill_id"`
	BillPeriod   string     `json:"bill_period"`
	TenantName   string     `json:"tenant_name"`
	PropertyName *string    `json:"property_name"`
	UnitCode     *string    `json:"unit_code"`
	Amount       float64    `json:"amount"`
	PaidAt       string     `json:"paid_at"`
	Reference    string     `json:"reference"`
	FileURL      string     `json:"file_url"`
	Status       string     `json:"status"`
	RejectReason string     `json:"reject_reason"`
	ReviewedBy   string     `json:"reviewed_by"`
	ReviewedAt   *time.Time `json:"reviewed_at"`
	CreatedAt    time.Time  `json:"created_at"`
}

// PaymentListItem is one recorded payment (manual entry or approved proof).
type PaymentListItem struct {
	ID           uint      `json:"id"`
	BillID       uint      `json:"bill_id"`
	BillPeriod   string    `json:"bill_period"`
	TenantName   string    `json:"tenant_name"`
	PropertyName *string   `json:"property_name"`
	UnitCode     *string   `json:"unit_code"`
	Amount       float64   `json:"amount"`
	Method       string    `json:"method"`
	Reference    string    `json:"reference"`
	PaidAt       string    `json:"paid_at"`
	ProofID      *uint     `json:"proof_id"`
	CreatedAt    time.Time `json:"created_at"`
}

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) *SQLiteRepository {
	return &SQLiteRepository{db: db}
}

// applyBillScope applies the keyword, property, block and unit filters shared by proofs and payments.
// refTable names the table whose reference column the keyword matches.
func applyBillScope(q *gorm.DB, f ProofFilter, refTable string) *gorm.DB {
	if f.Keyword != "" {
		like := "%" + strings.ToLower(f.Keyword) + "%"
		q = q.Where("LOWER(tenants.name) LIKE ? OR LOWER(units.code) LIKE ? OR LOWER("+refTable+".reference) LIKE ?", like, like, like)
	}
	if f.PropertyID != nil {
		q = q.Where("contracts.property_id = ?", *f.PropertyID)
	}
	if f.BlockID != nil {
		q = q.Where("units.block_id = ?", *f.BlockID)
	}
	if f.UnitID != nil {
		q = q.Where("contracts.unit_id = ?", *f.UnitID)
	}
	return q
}

func (r *SQLiteRepository) filteredProofs(f ProofFilter) *gorm.DB {
	q := r.db.Table("payment_proofs").
		Joins("JOIN bills ON bills.id = payment_proofs.bill_id").
		Joins("JOIN contracts ON contracts.id = bills.contract_id").
		Joins("JOIN tenants ON tenants.id = bills.tenant_id").
		Joins("LEFT JOIN properties ON properties.id = contracts.property_id").
		Joins("LEFT JOIN units ON units.id = contracts.unit_id")
	q = applyBillScope(q, f, "payment_proofs")
	if f.Status != "" {
		q = q.Where("payment_proofs.status = ?", f.Status)
	}
	if f.PaidFrom != "" {
		q = q.Where("payment_proofs.paid_at >= ?", f.PaidFrom)
	}
	if f.PaidTo != "" {
		q = q.Where("payment_proofs.paid_at <= ?", f.PaidTo)
	}
	if f.AmountMin != nil {
		q = q.Where("payment_proofs.amount >= ?", *f.AmountMin)
	}
	if f.AmountMax != nil {
		q = q.Where("payment_proofs.amount <= ?", *f.AmountMax)
	}
	return q
}

func (r *SQLiteRepository) ListProofs(f ProofFilter, page, perPage int) ([]ProofListItem, int64, error) {
	var total int64
	if err := r.filteredProofs(f).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	rows := make([]ProofListItem, 0)
	err := r.filteredProofs(f).
		Select(`payment_proofs.id, payment_proofs.bill_id, bills.billing_period AS bill_period, tenants.name AS tenant_name,
			properties.name AS property_name, units.code AS unit_code, payment_proofs.amount, payment_proofs.paid_at,
			payment_proofs.reference, payment_proofs.file_url, payment_proofs.status, payment_proofs.reject_reason,
			payment_proofs.reviewed_by, payment_proofs.reviewed_at, payment_proofs.created_at`).
		Order("payment_proofs.id DESC").
		Offset((page - 1) * perPage).Limit(perPage).
		Scan(&rows).Error
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *SQLiteRepository) filteredPayments(f PaymentFilter) *gorm.DB {
	q := r.db.Table("payments").
		Joins("JOIN bills ON bills.id = payments.bill_id").
		Joins("JOIN contracts ON contracts.id = bills.contract_id").
		Joins("JOIN tenants ON tenants.id = bills.tenant_id").
		Joins("LEFT JOIN properties ON properties.id = contracts.property_id").
		Joins("LEFT JOIN units ON units.id = contracts.unit_id")
	q = applyBillScope(q, f, "payments")
	if f.PaidFrom != "" {
		q = q.Where("payments.paid_at >= ?", f.PaidFrom)
	}
	if f.PaidTo != "" {
		q = q.Where("payments.paid_at <= ?", f.PaidTo)
	}
	if f.AmountMin != nil {
		q = q.Where("payments.amount >= ?", *f.AmountMin)
	}
	if f.AmountMax != nil {
		q = q.Where("payments.amount <= ?", *f.AmountMax)
	}
	return q
}

func (r *SQLiteRepository) ListPayments(f PaymentFilter, page, perPage int) ([]PaymentListItem, int64, error) {
	var total int64
	if err := r.filteredPayments(f).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	rows := make([]PaymentListItem, 0)
	err := r.filteredPayments(f).
		Select(`payments.id, payments.bill_id, bills.billing_period AS bill_period, tenants.name AS tenant_name,
			properties.name AS property_name, units.code AS unit_code, payments.amount, payments.method,
			payments.reference, payments.paid_at, payments.proof_id, payments.created_at`).
		Order("payments.paid_at DESC, payments.id DESC").
		Offset((page - 1) * perPage).Limit(perPage).
		Scan(&rows).Error
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *SQLiteRepository) FindProof(id uint) (*PaymentProof, error) {
	var p PaymentProof
	err := r.db.First(&p, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProofNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// Approve marks a pending proof approved and records the payment against its bill, in one transaction.
func (r *SQLiteRepository) Approve(id uint, reviewer string, now time.Time) (*PaymentProof, error) {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var p PaymentProof
		if err := tx.First(&p, id).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrProofNotFound
			}
			return err
		}
		if p.Status != "pending" {
			return ErrProofNotPending
		}
		result := tx.Model(&PaymentProof{}).Where("id = ? AND status = 'pending'", id).Updates(map[string]any{
			"status":      "approved",
			"reviewed_by": reviewer,
			"reviewed_at": now,
			"updated_at":  now,
		})
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return ErrProofNotPending
		}
		return billrepo.ApplyPayment(tx, p.BillID, p.Amount, "bank_transfer", p.Reference, p.PaidAt, &p.ID)
	})
	if err != nil {
		return nil, err
	}
	return r.FindProof(id)
}

// Reject marks a pending proof rejected with a reason. No payment is recorded.
func (r *SQLiteRepository) Reject(id uint, reviewer, reason string, now time.Time) (*PaymentProof, error) {
	result := r.db.Model(&PaymentProof{}).Where("id = ? AND status = 'pending'", id).Updates(map[string]any{
		"status":        "rejected",
		"reject_reason": reason,
		"reviewed_by":   reviewer,
		"reviewed_at":   now,
		"updated_at":    now,
	})
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		if _, err := r.FindProof(id); err != nil {
			return nil, err
		}
		return nil, ErrProofNotPending
	}
	return r.FindProof(id)
}
