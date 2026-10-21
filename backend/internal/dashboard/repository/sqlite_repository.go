package repository

import (
	"time"

	"gorm.io/gorm"
)

type SQLiteRepository struct {
	db *gorm.DB
}

func NewSQLiteRepository(db *gorm.DB) *SQLiteRepository {
	return &SQLiteRepository{db: db}
}

type PropertyUnitStat struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	TotalUnits       int64  `json:"total_units"`
	OccupiedUnits    int64  `json:"occupied_units"`
	MaintenanceUnits int64  `json:"maintenance_units"`
}

// PropertyUnitStats returns unit counts per property. Properties without units are included with zeros.
func (r *SQLiteRepository) PropertyUnitStats() ([]PropertyUnitStat, error) {
	rows := make([]PropertyUnitStat, 0)
	err := r.db.Raw(`SELECT properties.id, properties.name,
		COUNT(units.id) AS total_units,
		COALESCE(SUM(CASE WHEN units.status = 'occupied' THEN 1 ELSE 0 END), 0) AS occupied_units,
		COALESCE(SUM(CASE WHEN units.status = 'maintenance' THEN 1 ELSE 0 END), 0) AS maintenance_units
		FROM properties
		LEFT JOIN blocks ON blocks.property_id = properties.id
		LEFT JOIN units ON units.block_id = blocks.id
		GROUP BY properties.id, properties.name
		ORDER BY properties.id`).Scan(&rows).Error
	return rows, err
}

// ActiveContracts counts contracts with status active.
func (r *SQLiteRepository) ActiveContracts() (int64, error) {
	var total int64
	err := r.db.Table("contracts").Where("status = ?", "active").Count(&total).Error
	return total, err
}

type BillRow struct {
	ID                uint    `json:"id"`
	BillingPeriod     string  `json:"billing_period"`
	DueDate           string  `json:"due_date"`
	Amount            float64 `json:"amount"`
	LateFee           float64 `json:"late_fee"`
	AmountPaid        float64 `json:"amount_paid"`
	Status            string  `json:"status"`
	TenantName        string  `json:"tenant_name"`
	PropertyName      string  `json:"property_name"`
	UnitCode          string  `json:"unit_code"`
	PendingProofCount int64   `json:"pending_proof_count"`
}

// BillsForOverview returns non-void bills that are either in the given billing cycle or still open.
func (r *SQLiteRepository) BillsForOverview(cycle string) ([]BillRow, error) {
	rows := make([]BillRow, 0)
	err := r.db.Raw(`SELECT bills.id, bills.billing_period, bills.due_date, bills.amount, bills.late_fee,
		bills.amount_paid, bills.status, tenants.name AS tenant_name,
		COALESCE(properties.name, '') AS property_name, COALESCE(units.code, '') AS unit_code,
		(SELECT COUNT(*) FROM payment_proofs pp WHERE pp.bill_id = bills.id AND pp.status = 'pending') AS pending_proof_count
		FROM bills
		JOIN tenants ON tenants.id = bills.tenant_id
		JOIN contracts ON contracts.id = bills.contract_id
		LEFT JOIN properties ON properties.id = contracts.property_id
		LEFT JOIN units ON units.id = contracts.unit_id
		WHERE bills.status <> 'void' AND (bills.billing_period = ? OR bills.status <> 'paid')
		ORDER BY bills.due_date ASC, bills.id ASC`, cycle).Scan(&rows).Error
	return rows, err
}

type ContractRow struct {
	ID           uint   `json:"id"`
	TenantName   string `json:"tenant_name"`
	PropertyName string `json:"property_name"`
	UnitCode     string `json:"unit_code"`
	EndDate      string `json:"end_date"`
}

// ContractsEndingBetween lists active contracts whose end_date falls in [from, to] (YYYY-MM-DD, inclusive).
func (r *SQLiteRepository) ContractsEndingBetween(from, to string) ([]ContractRow, error) {
	rows := make([]ContractRow, 0)
	err := r.db.Raw(`SELECT contracts.id, tenants.name AS tenant_name,
		COALESCE(properties.name, '') AS property_name, COALESCE(units.code, '') AS unit_code, contracts.end_date
		FROM contracts
		JOIN tenants ON tenants.id = contracts.tenant_id
		LEFT JOIN properties ON properties.id = contracts.property_id
		LEFT JOIN units ON units.id = contracts.unit_id
		WHERE contracts.status = 'active' AND contracts.end_date >= ? AND contracts.end_date <= ?
		ORDER BY contracts.end_date ASC, contracts.id ASC`, from, to).Scan(&rows).Error
	return rows, err
}

type MaintenanceCounts struct {
	Open           int64 `json:"open"`
	Urgent         int64 `json:"urgent"`
	NewThisWeek    int64 `json:"new_this_week"`
	NewFromTenant  int64 `json:"new_from_tenant"`
	NewFromAdmin   int64 `json:"new_from_admin"`
}

// MaintenanceStats counts maintenance requests that are open or in progress, urgent ones among them,
// and requests created on or after weekStart (YYYY-MM-DD), split by whether a tenant raised them.
func (r *SQLiteRepository) MaintenanceStats(weekStart string) (MaintenanceCounts, error) {
	var counts MaintenanceCounts
	err := r.db.Raw(`SELECT
		COALESCE(SUM(CASE WHEN status IN ('open', 'in_progress') THEN 1 ELSE 0 END), 0) AS open,
		COALESCE(SUM(CASE WHEN status IN ('open', 'in_progress') AND priority = 'urgent' THEN 1 ELSE 0 END), 0) AS urgent,
		COALESCE(SUM(CASE WHEN date(created_at) >= ? THEN 1 ELSE 0 END), 0) AS new_this_week,
		COALESCE(SUM(CASE WHEN date(created_at) >= ? AND tenant_id IS NOT NULL THEN 1 ELSE 0 END), 0) AS new_from_tenant,
		COALESCE(SUM(CASE WHEN date(created_at) >= ? AND tenant_id IS NULL THEN 1 ELSE 0 END), 0) AS new_from_admin
		FROM maintenance_requests`, weekStart, weekStart, weekStart).Scan(&counts).Error
	return counts, err
}

// OpenComplaints counts complaints that are still open or in progress.
func (r *SQLiteRepository) OpenComplaints() (int64, error) {
	var total int64
	err := r.db.Table("complaints").Where("status IN ?", []string{"open", "in_progress"}).Count(&total).Error
	return total, err
}

type ProofCounts struct {
	Pending       int64   `json:"pending"`
	PendingAmount float64 `json:"pending_amount"`
}

// PendingProofs counts payment proofs waiting for review and the total amount they claim.
func (r *SQLiteRepository) PendingProofs() (ProofCounts, error) {
	var counts ProofCounts
	err := r.db.Raw(`SELECT COUNT(*) AS pending, COALESCE(SUM(amount), 0) AS pending_amount
		FROM payment_proofs WHERE status = 'pending'`).Scan(&counts).Error
	return counts, err
}

// OpenBills counts bills that are neither paid nor void.
func (r *SQLiteRepository) OpenBills() (int64, error) {
	var total int64
	err := r.db.Table("bills").Where("status NOT IN ?", []string{"paid", "void"}).Count(&total).Error
	return total, err
}

type MonthTotal struct {
	Month string  `json:"month"`
	Total float64 `json:"total"`
}

// CollectedByMonth sums payment records by paid month for paid_at >= since (YYYY-MM-DD).
func (r *SQLiteRepository) CollectedByMonth(since string) ([]MonthTotal, error) {
	rows := make([]MonthTotal, 0)
	err := r.db.Raw(`SELECT substr(paid_at, 1, 7) AS month, COALESCE(SUM(amount), 0) AS total
		FROM payments WHERE paid_at >= ? GROUP BY substr(paid_at, 1, 7)`, since).Scan(&rows).Error
	return rows, err
}

// LateFeesByMonth sums late fees of bills fully paid in each month, for paid_at >= since.
func (r *SQLiteRepository) LateFeesByMonth(since string) ([]MonthTotal, error) {
	rows := make([]MonthTotal, 0)
	err := r.db.Raw(`SELECT substr(paid_at, 1, 7) AS month, COALESCE(SUM(late_fee), 0) AS total
		FROM bills WHERE status = 'paid' AND paid_at IS NOT NULL AND paid_at >= ?
		GROUP BY substr(paid_at, 1, 7)`, since).Scan(&rows).Error
	return rows, err
}

// EventRow is a raw recent event used to build the activity feed. Amount is only set for payments.
type EventRow struct {
	ID           uint      `json:"id"`
	At           time.Time `json:"at"`
	TenantName   string    `json:"tenant_name"`
	PropertyName string    `json:"property_name"`
	Amount       float64   `json:"amount"`
}

func (r *SQLiteRepository) RecentPayments(limit int) ([]EventRow, error) {
	rows := make([]EventRow, 0)
	err := r.db.Raw(`SELECT payments.id, payments.created_at AS at, tenants.name AS tenant_name,
		COALESCE(properties.name, '') AS property_name, payments.amount AS amount
		FROM payments
		JOIN bills ON bills.id = payments.bill_id
		JOIN tenants ON tenants.id = bills.tenant_id
		JOIN contracts ON contracts.id = bills.contract_id
		LEFT JOIN properties ON properties.id = contracts.property_id
		ORDER BY payments.id DESC LIMIT ?`, limit).Scan(&rows).Error
	return rows, err
}

func (r *SQLiteRepository) RecentComplaints(limit int) ([]EventRow, error) {
	rows := make([]EventRow, 0)
	err := r.db.Raw(`SELECT complaints.id, complaints.created_at AS at,
		COALESCE(tenants.name, '') AS tenant_name,
		COALESCE(properties.name, '') AS property_name, 0 AS amount
		FROM complaints
		LEFT JOIN tenants ON tenants.id = complaints.tenant_id
		LEFT JOIN properties ON properties.id = complaints.property_id
		ORDER BY complaints.id DESC LIMIT ?`, limit).Scan(&rows).Error
	return rows, err
}

func (r *SQLiteRepository) RecentContracts(limit int) ([]EventRow, error) {
	rows := make([]EventRow, 0)
	err := r.db.Raw(`SELECT contracts.id, contracts.created_at AS at, tenants.name AS tenant_name,
		COALESCE(properties.name, '') AS property_name, 0 AS amount
		FROM contracts
		JOIN tenants ON tenants.id = contracts.tenant_id
		LEFT JOIN properties ON properties.id = contracts.property_id
		ORDER BY contracts.id DESC LIMIT ?`, limit).Scan(&rows).Error
	return rows, err
}

func (r *SQLiteRepository) RecentMoveOuts(limit int) ([]EventRow, error) {
	rows := make([]EventRow, 0)
	err := r.db.Raw(`SELECT tenants.id, tenants.updated_at AS at, tenants.name AS tenant_name,
		COALESCE(properties.name, '') AS property_name, 0 AS amount
		FROM tenants
		LEFT JOIN properties ON properties.id = tenants.property_id
		WHERE tenants.status = 'former'
		ORDER BY tenants.updated_at DESC LIMIT ?`, limit).Scan(&rows).Error
	return rows, err
}
