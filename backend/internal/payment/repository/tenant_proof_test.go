package repository

import (
	"path/filepath"
	"testing"

	"backend/internal/pkg/database"

	"gorm.io/gorm"
)

func setupProofDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := database.InitSQLite(filepath.Join(t.TempDir(), "proof.db"))
	if err != nil {
		t.Fatalf("InitSQLite failed: %v", err)
	}
	if sqlDB, err := db.DB(); err == nil {
		t.Cleanup(func() { sqlDB.Close() })
	}
	if err := db.Exec(`CREATE TABLE bills (
		id INTEGER PRIMARY KEY,
		tenant_id INTEGER NOT NULL,
		status TEXT NOT NULL,
		amount REAL NOT NULL,
		late_fee REAL NOT NULL DEFAULT 0,
		amount_paid REAL NOT NULL DEFAULT 0
	)`).Error; err != nil {
		t.Fatalf("create bills: %v", err)
	}
	if err := db.AutoMigrate(&PaymentProof{}); err != nil {
		t.Fatalf("migrate payment_proofs: %v", err)
	}
	seed := `INSERT INTO bills (id, tenant_id, status, amount, late_fee, amount_paid) VALUES
		(1, 10, 'unpaid', 1000, 50, http.StatusOK),
		(2, 10, 'paid', 800, 0, 800),
		(3, 11, 'unpaid', 900, 0, 0)`
	if err := db.Exec(seed).Error; err != nil {
		t.Fatalf("seed bills: %v", err)
	}
	return db
}

func TestValidateTenantProof(t *testing.T) {
	repo := NewSQLiteRepository(setupProofDB(t))

	tests := []struct {
		name     string
		tenantID uint
		billID   uint
		amount   float64
		want     error
	}{
		{"bill owned by another tenant", 10, 3, 100, ErrBillNotFound},
		{"missing bill", 10, 99, 100, ErrBillNotFound},
		{"paid bill", 10, 2, 100, ErrBillNotPayable},
		{"zero amount", 10, 1, 0, ErrInvalidAmount},
		{"amount above outstanding", 10, 1, 850.01, ErrInvalidAmount},
		{"amount equal to outstanding", 10, 1, 850, nil},
		{"partial payment", 10, 1, 100, nil},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := repo.ValidateTenantProof(tt.tenantID, tt.billID, tt.amount)
			if err != tt.want {
				t.Fatalf("ValidateTenantProof() = %v, want %v", err, tt.want)
			}
		})
	}
}

func TestCreateTenantProofAllowsOnePendingPerBill(t *testing.T) {
	repo := NewSQLiteRepository(setupProofDB(t))

	first := &PaymentProof{BillID: 1, TenantID: 10, Amount: 100, PaidAt: "2026-01-05", Status: "pending", FileKey: "payment-proofs/10/a.jpg"}
	if err := repo.CreateTenantProof(first); err != nil {
		t.Fatalf("first CreateTenantProof() failed: %v", err)
	}

	second := &PaymentProof{BillID: 1, TenantID: 10, Amount: 100, PaidAt: "2026-01-06", Status: "pending", FileKey: "payment-proofs/10/b.jpg"}
	if err := repo.CreateTenantProof(second); err != ErrProofAlreadyOpen {
		t.Fatalf("second CreateTenantProof() = %v, want %v", err, ErrProofAlreadyOpen)
	}

	if _, err := repo.FindTenantProof(11, first.ID); err != ErrProofNotFound {
		t.Fatalf("FindTenantProof for another tenant = %v, want %v", err, ErrProofNotFound)
	}
}
