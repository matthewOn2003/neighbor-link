package tenantportal

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	billrepo "backend/internal/bill/repository"
	"backend/internal/bill/rules"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

type bill struct {
	ID            uint    `json:"id"`
	BillingPeriod string  `json:"billing_period"`
	DueDate       string  `json:"due_date"`
	Amount        float64 `json:"amount"`
	LateFee       float64 `json:"late_fee"`
	AmountPaid    float64 `json:"amount_paid"`
	Status        string  `json:"status"`
	PaidAt        *string `json:"paid_at"`
	PendingProofs int64   `json:"pending_proofs"`
	DisplayStatus string  `json:"display_status"`
	Outstanding   float64 `json:"outstanding"`
}

// billSummary totals every bill of the tenant, regardless of the status filter applied to the list.
type billSummary struct {
	TotalInvoices    int     `json:"total_invoices"`
	OutstandingTotal float64 `json:"outstanding_total"`
	OverdueCount     int     `json:"overdue_count"`
	PendingReview    int     `json:"pending_review_count"`
}

// outstandingOf is what the tenant still owes on a bill. Settled and void bills owe nothing.
func outstandingOf(b bill) float64 {
	if b.Status == "paid" || b.Status == "void" {
		return 0
	}
	owed := b.Amount + b.LateFee - b.AmountPaid
	if owed < 0 {
		return 0
	}
	return owed
}

// loadBills returns the tenant's bills, newest billing period first, with display status and amount owed.
func (c *Controller) loadBills(tenantID uint) ([]bill, error) {
	rows := []bill{}
	err := c.db.Raw(`
		SELECT b.id, b.billing_period, b.due_date, b.amount, b.late_fee, b.amount_paid, b.status, b.paid_at,
		       (SELECT COUNT(*) FROM payment_proofs p WHERE p.bill_id = b.id AND p.status = 'pending') AS pending_proofs
		FROM bills b
		WHERE b.tenant_id = ?
		ORDER BY b.billing_period DESC, b.id DESC`, tenantID).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	overdueDay, err := billrepo.NewSQLiteRepository(c.db).OverdueDay()
	if err != nil {
		return nil, err
	}
	now := time.Now()
	for i := range rows {
		b := &rows[i]
		b.Outstanding = outstandingOf(*b)
		isOverdue := rules.IsOverdue(b.Status, b.BillingPeriod, overdueDay, now)
		b.DisplayStatus = rules.DisplayStatus(b.Status, b.PendingProofs, isOverdue)
	}
	return rows, nil
}

func summarizeBills(rows []bill) billSummary {
	var s billSummary
	s.TotalInvoices = len(rows)
	for _, b := range rows {
		s.OutstandingTotal += b.Outstanding
		switch b.DisplayStatus {
		case rules.DisplayOverdue:
			s.OverdueCount++
		case rules.DisplayPendingReview:
			s.PendingReview++
		}
	}
	return s
}

// Bills returns the tenant's bills with a summary of all of them. The optional status filter applies to the list only.
func (c *Controller) Bills(w http.ResponseWriter, r *http.Request) {
	tenantID, ok := c.tenantOr404(w, r)
	if !ok {
		return
	}
	var req tenantListRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}

	rows, err := c.loadBills(tenantID)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load bills")
		return
	}

	status := strings.TrimSpace(req.Status)
	filtered := make([]bill, 0, len(rows))
	for _, b := range rows {
		if status != "" && b.DisplayStatus != status {
			continue
		}
		filtered = append(filtered, b)
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	list := response.NewListData(paginate(filtered, page, perPage), page, perPage, int64(len(filtered)))
	response.WriteSuccess(w, http.StatusOK, list.WithSummary(summarizeBills(rows)))
}
