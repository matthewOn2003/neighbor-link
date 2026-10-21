package repository

import (
	"errors"

	"gorm.io/gorm"
)

var (
	ErrBillNotFound     = errors.New("bill not found")
	ErrBillNotPayable   = errors.New("bill is already settled or void")
	ErrInvalidAmount    = errors.New("amount must be above zero and no more than the outstanding balance")
	ErrProofAlreadyOpen = errors.New("a payment proof for this bill is already awaiting review")
)

type billPayable struct {
	Status     string
	Amount     float64
	LateFee    float64
	AmountPaid float64
}

// checkPayable verifies that tenantID may submit a proof of amount against billID.
// It runs on any *gorm.DB, so it works both before an upload and inside the insert transaction.
func checkPayable(db *gorm.DB, tenantID, billID uint, amount float64) error {
	var b billPayable
	err := db.Table("bills").Select("status, amount, late_fee, amount_paid").
		Where("id = ? AND tenant_id = ?", billID, tenantID).Take(&b).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrBillNotFound
	}
	if err != nil {
		return err
	}
	if b.Status == "paid" || b.Status == "void" {
		return ErrBillNotPayable
	}
	outstanding := b.Amount + b.LateFee - b.AmountPaid
	if amount <= 0 || amount > outstanding+0.000001 {
		return ErrInvalidAmount
	}
	var pending int64
	if err := db.Model(&PaymentProof{}).Where("bill_id = ? AND status = 'pending'", billID).Count(&pending).Error; err != nil {
		return err
	}
	if pending > 0 {
		return ErrProofAlreadyOpen
	}
	return nil
}

// ValidateTenantProof checks a submission before the file is uploaded.
func (r *SQLiteRepository) ValidateTenantProof(tenantID, billID uint, amount float64) error {
	return checkPayable(r.db, tenantID, billID, amount)
}

// CreateTenantProof re-checks the submission inside a transaction and inserts the pending proof.
func (r *SQLiteRepository) CreateTenantProof(p *PaymentProof) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := checkPayable(tx, p.TenantID, p.BillID, p.Amount); err != nil {
			return err
		}
		return tx.Create(p).Error
	})
}

// ListTenantProofs returns a tenant's own proofs, newest first.
func (r *SQLiteRepository) ListTenantProofs(tenantID uint) ([]PaymentProof, error) {
	rows := make([]PaymentProof, 0)
	err := r.db.Where("tenant_id = ?", tenantID).Order("id DESC").Find(&rows).Error
	return rows, err
}

// FindTenantProof returns one proof only if it belongs to tenantID.
func (r *SQLiteRepository) FindTenantProof(tenantID, id uint) (*PaymentProof, error) {
	var p PaymentProof
	err := r.db.Where("id = ? AND tenant_id = ?", id, tenantID).Take(&p).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProofNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}
