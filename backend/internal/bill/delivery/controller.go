package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"backend/internal/bill/repository"
	"backend/internal/bill/usecase"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

type BillController struct{ uc *usecase.BillUsecase }

func NewBillController(uc *usecase.BillUsecase) *BillController { return &BillController{uc: uc} }

type listRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
	Status      string `json:"status"`
	Period      string `json:"period"`
}

func (c *BillController) List(w http.ResponseWriter, r *http.Request) {
	var q listRequest
	if json.NewDecoder(r.Body).Decode(&q) != nil {
		// httpx.WriteInvalidInput(w, "invalid request body")
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	status := strings.TrimSpace(q.Status)
	switch status {
	case "", "unpaid", "partial", "paid", "overdue", "void":
	default:
		httpx.WriteInvalidInput(w, "invalid status")
		return
	}
	period := strings.TrimSpace(q.Period)
	if period != "" && len(period) != 7 {
		httpx.WriteInvalidInput(w, "invalid billing period")
		return
	}
	p, n := httpx.NormalizePagination(q.CurrentPage, q.PerPage)
	rows, total, summary, err := c.uc.List(repository.BillFilter{Keyword: strings.TrimSpace(q.Keyword), Status: status, Period: period}, p, n)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list bills")
		return
	}
	// httpx.WriteOK(w, response.NewListData(rows, p, n, total).WithSummary(summary))
	httpx.WriteOK(w, response.NewListData(rows, p, n, total).WithSummary(summary))

}
func (c *BillController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	b, err := c.uc.Detail(id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			// httpx.WriteNotFound(w, "bill not found")
			httpx.WriteNotFound(w, "bill not found")
		} else {
			httpx.WriteInternalError(w, "failed to load bill")
		}
		return
	}
	httpx.WriteOK(w, b)
}

type createRequest struct {
	ContractID    uint    `json:"contract_id"`
	BillingPeriod string  `json:"billing_period"`
	DueDate       string  `json:"due_date"`
	Amount        float64 `json:"amount"`
	LateFee       float64 `json:"late_fee"`
	Notes         string  `json:"notes"`
}

func (c *BillController) Create(w http.ResponseWriter, r *http.Request) {
	var q createRequest
	if json.NewDecoder(r.Body).Decode(&q) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	b := &repository.Bill{ContractID: q.ContractID, BillingPeriod: strings.TrimSpace(q.BillingPeriod), DueDate: strings.TrimSpace(q.DueDate), Amount: q.Amount, LateFee: q.LateFee, Notes: strings.TrimSpace(q.Notes)}
	if err := c.uc.Create(b); err != nil {
		switch {
		case errors.Is(err, repository.ErrContractNotFound):
			httpx.WriteInvalidInput(w, "select an active contract")
		case errors.Is(err, repository.ErrDuplicatePeriod):
			httpx.WriteConflict(w, "a bill already exists for this contract and period")
		case errors.Is(err, repository.ErrInvalidBill):
			httpx.WriteInvalidInput(w, "check contract, period, due date and amounts")
		default:
			httpx.WriteInternalError(w, "failed to create bill")
		}
		return
	}
	// httpx.WriteCreated(w, b)
	httpx.WriteCreated(w, b)
}

type paymentRequest struct {
	Amount    float64 `json:"amount"`
	Method    string  `json:"method"`
	Reference string  `json:"reference"`
	PaidAt    string  `json:"paid_at"`
}

func (c *BillController) Payment(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	var q paymentRequest
	if json.NewDecoder(r.Body).Decode(&q) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	if err := c.uc.RecordPayment(id, q.Amount, strings.TrimSpace(q.Method), strings.TrimSpace(q.Reference), strings.TrimSpace(q.PaidAt)); err != nil {
		switch {
		case errors.Is(err, repository.ErrNotFound):
			httpx.WriteNotFound(w, "bill not found")
		case errors.Is(err, repository.ErrAlreadyVoided):
			httpx.WriteConflict(w, "void bills cannot receive payments")
		case errors.Is(err, repository.ErrInvalidBill):
			httpx.WriteInvalidInput(w, "check payment amount, method and date")
		default:
			httpx.WriteInternalError(w, "failed to record payment")
		}
		return
	}
	httpx.WriteOK(w, map[string]string{"message": "payment recorded"})
}
func (c *BillController) Void(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	if err := c.uc.Void(id); err != nil {
		switch {
		case errors.Is(err, repository.ErrNotFound):
			httpx.WriteNotFound(w, "bill not found")
		case errors.Is(err, repository.ErrAlreadyVoided):
			httpx.WriteConflict(w, "bill is paid, partially paid or already void")
		default:
			httpx.WriteInternalError(w, "failed to void bill")
		}
		return
	}
	httpx.WriteOK(w, map[string]string{"message": "bill voided"})
}

// ActiveContracts returns a paginated {list, pagination} when the request sends current_page;
// otherwise it returns the plain array that bills/new relies on.
func (c *BillController) ActiveContracts(w http.ResponseWriter, r *http.Request) {
	var q listRequest
	paged := json.NewDecoder(r.Body).Decode(&q) == nil && q.CurrentPage > 0
	if !paged {
		rows, _, err := c.uc.ActiveContracts(0, 0)
		if err != nil {
			httpx.WriteInternalError(w, "failed to load active contracts")
			return
		}
		httpx.WriteOK(w, rows)
		return
	}
	p, n := httpx.NormalizePagination(q.CurrentPage, q.PerPage)
	rows, total, err := c.uc.ActiveContracts(p, n)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load active contracts")
		return
	}
	httpx.WriteOK(w, response.NewListData(rows, p, n, total))
}

type updateRequest struct {
	Amount  *float64 `json:"amount"`
	LateFee *float64 `json:"late_fee"`
	DueDate *string  `json:"due_date"`
	Notes   *string  `json:"notes"`
}

func (c *BillController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	var q updateRequest
	if json.NewDecoder(r.Body).Decode(&q) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	if err := c.uc.Update(id, q.Amount, q.LateFee, q.DueDate, q.Notes); err != nil {
		switch {
		case errors.Is(err, repository.ErrNotFound):
			httpx.WriteNotFound(w, "bill not found")
		case errors.Is(err, repository.ErrNotEditable):
			httpx.WriteConflict(w, "only unpaid bills can be edited")
		case errors.Is(err, repository.ErrInvalidBill):
			httpx.WriteInvalidInput(w, "check amount, late fee and due date")
		default:
			httpx.WriteInternalError(w, "failed to update bill")
		}
		return
	}
	b, err := c.uc.Detail(id)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load bill")
		return
	}
	httpx.WriteOK(w, b)
}

type generateRequest struct {
	BillingPeriod string `json:"billing_period"`
}

func (c *BillController) Generate(w http.ResponseWriter, r *http.Request) {
	var q generateRequest
	if json.NewDecoder(r.Body).Decode(&q) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	count, err := c.uc.Generate(strings.TrimSpace(q.BillingPeriod))
	if err != nil {
		if errors.Is(err, repository.ErrInvalidBill) {
			httpx.WriteInvalidInput(w, "invalid billing period")
		} else {
			httpx.WriteInternalError(w, "failed to generate bills")
		}
		return
	}
	httpx.WriteOK(w, map[string]int64{"generated_count": count})
}
