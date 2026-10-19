// Package tenantportal exposes read-only endpoints for the logged-in tenant.
// Every query is scoped to the tenant profile linked to the session's user.
package tenantportal

import (
	"errors"
	"net/http"

	"backend/internal/pkg/middleware"
	"backend/internal/pkg/response"
	userdelivery "backend/internal/user/delivery"

	"gorm.io/gorm"
)

type Controller struct {
	db     *gorm.DB
	secret string
}

func NewController(db *gorm.DB, tokenSecret string) *Controller {
	return &Controller{db: db, secret: tokenSecret}
}

type profile struct {
	TenantID           uint    `json:"tenant_id"`
	Name               string  `json:"name"`
	Email              string  `json:"email"`
	Phone              string  `json:"phone"`
	PropertyName       string  `json:"property_name"`
	MonthlyRent        float64 `json:"monthly_rent"`
	OutstandingBalance float64 `json:"outstanding_balance"`
	BalanceNote        string  `json:"balance_note"`
}

type contract struct {
	StartDate       string  `json:"start_date"`
	EndDate         string  `json:"end_date"`
	MonthlyRent     float64 `json:"monthly_rent"`
	SecurityDeposit float64 `json:"security_deposit"`
	BillingDay      int     `json:"billing_day"`
	Status          string  `json:"status"`
}

type meResponse struct {
	profile
	Contract *contract `json:"contract"`
}

type bill struct {
	ID            uint    `json:"id"`
	BillingPeriod string  `json:"billing_period"`
	DueDate       string  `json:"due_date"`
	Amount        float64 `json:"amount"`
	LateFee       float64 `json:"late_fee"`
	AmountPaid    float64 `json:"amount_paid"`
	Status        string  `json:"status"`
	PaidAt        *string `json:"paid_at"`
}

// currentTenantID resolves the session's username to the tenant row linked to it.
func (c *Controller) currentTenantID(r *http.Request) (uint, error) {
	cookie, err := r.Cookie(middleware.AuthCookieName)
	if err != nil {
		return 0, err
	}
	username, _, ok := userdelivery.VerifyToken(cookie.Value, c.secret)
	if !ok {
		return 0, errors.New("invalid session")
	}

	var id uint
	err = c.db.Raw(`
		SELECT t.id FROM tenants t
		JOIN auth_users u ON u.id = t.user_id
		WHERE u.username = ? AND u.role = 'tenant'
		LIMIT 1`, username).Scan(&id).Error
	if err != nil {
		return 0, err
	}
	if id == 0 {
		return 0, gorm.ErrRecordNotFound
	}
	return id, nil
}

// Me returns the tenant's profile, property and most relevant contract.
func (c *Controller) Me(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		response.WriteError(w, http.StatusNotFound, "TENANT_NOT_LINKED", "no tenant profile is linked to this account")
		return
	}

	var p profile
	err = c.db.Raw(`
		SELECT t.id AS tenant_id,
		       t.name,
		       COALESCE(t.email, '') AS email,
		       t.phone,
		       COALESCE(p.name, '') AS property_name,
		       COALESCE(t.monthly_rent, 0) AS monthly_rent,
		       t.outstanding_balance,
		       COALESCE(t.balance_note, '') AS balance_note
		FROM tenants t
		LEFT JOIN properties p ON p.id = t.property_id
		WHERE t.id = ?`, tenantID).Scan(&p).Error
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load profile")
		return
	}

	var ct contract
	err = c.db.Raw(`
		SELECT start_date, end_date, monthly_rent, security_deposit, billing_day, status
		FROM contracts
		WHERE tenant_id = ?
		ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, id DESC
		LIMIT 1`, tenantID).Scan(&ct).Error
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load contract")
		return
	}

	out := meResponse{profile: p}
	if ct.Status != "" {
		out.Contract = &ct
	}
	response.WriteSuccess(w, http.StatusOK, out)
}

// Bills returns the tenant's bills, newest billing period first.
func (c *Controller) Bills(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		response.WriteError(w, http.StatusNotFound, "TENANT_NOT_LINKED", "no tenant profile is linked to this account")
		return
	}

	rows := []bill{}
	err = c.db.Raw(`
		SELECT id, billing_period, due_date, amount, late_fee, amount_paid, status, paid_at
		FROM bills
		WHERE tenant_id = ?
		ORDER BY billing_period DESC, id DESC`, tenantID).Scan(&rows).Error
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load bills")
		return
	}
	response.WriteSuccess(w, http.StatusOK, rows)
}
