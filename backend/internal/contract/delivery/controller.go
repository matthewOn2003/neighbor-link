package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"backend/internal/contract/repository"
	"backend/internal/contract/usecase"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

type ContractController struct {
	uc *usecase.ContractUsecase
}

func NewContractController(u *usecase.ContractUsecase) *ContractController {
	return &ContractController{uc: u}
}

type listRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
	Status      string `json:"status"`
}

func (c *ContractController) List(w http.ResponseWriter, r *http.Request) {
	var q listRequest
	if json.NewDecoder(r.Body).Decode(&q) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}

	p, n := httpx.NormalizePagination(q.CurrentPage, q.PerPage)

	status := strings.TrimSpace(q.Status)
	if status != "" && !validStatus(status) {
		httpx.WriteInvalidInput(w, "invalid status")
		return
	}

	rows, total, err := c.uc.List(repository.ContractFilter{
		Keyword: strings.TrimSpace(q.Keyword),
		Status:  status,
	}, p, n)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list contracts")
		return
	}
	httpx.WriteOK(w, response.NewListData(rows, p, n, total))
}

func (c *ContractController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}

	row, err := c.uc.Detail(id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			httpx.WriteNotFound(w, "contract not found")
		} else {
			httpx.WriteInternalError(w, "failed to load contract")
		}
		return
	}
	httpx.WriteOK(w, row)
}

type saveRequest struct {
	TenantID        uint    `json:"tenant_id"`
	StartDate       string  `json:"start_date"`
	EndDate         string  `json:"end_date"`
	MonthlyRent     float64 `json:"monthly_rent"`
	SecurityDeposit float64 `json:"security_deposit"`
	BillingDay      int     `json:"billing_day"`
	Status          string  `json:"status"`
	Notes           string  `json:"notes"`
}

func (c *ContractController) Create(w http.ResponseWriter, r *http.Request) {
	c.save(w, r, 0)
}

func (c *ContractController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	c.save(w, r, id)
}

func (c *ContractController) save(w http.ResponseWriter, r *http.Request, id uint) {
	var q saveRequest
	if json.NewDecoder(r.Body).Decode(&q) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}

	status := strings.TrimSpace(q.Status)
	if status == "" {
		status = "draft"
	}
	billingDay := q.BillingDay
	if billingDay == 0 {
		billingDay = 1
	}

	contract := &repository.Contract{
		ID:              id,
		TenantID:        q.TenantID,
		StartDate:       strings.TrimSpace(q.StartDate),
		EndDate:         strings.TrimSpace(q.EndDate),
		MonthlyRent:     q.MonthlyRent,
		SecurityDeposit: q.SecurityDeposit,
		BillingDay:      billingDay,
		Status:          status,
		Notes:           strings.TrimSpace(q.Notes),
	}

	if err := c.uc.Save(contract); err != nil {
		switch {
		case errors.Is(err, repository.ErrTenantNotFound):
			httpx.WriteInvalidInput(w, "tenant not found")
		case errors.Is(err, repository.ErrActiveContractExists):
			httpx.WriteConflict(w, "tenant already has an active contract")
		case errors.Is(err, repository.ErrInvalidContract):
			httpx.WriteInvalidInput(w, "check tenant, dates, amounts, billing day and status")
		case errors.Is(err, repository.ErrNotFound):
			httpx.WriteNotFound(w, "contract not found")
		default:
			httpx.WriteInternalError(w, "failed to save contract")
		}
		return
	}

	code := http.StatusOK
	if id == 0 {
		code = http.StatusCreated
	}
	response.WriteSuccess(w, code, contract)
}

func validStatus(s string) bool {
	return s == "draft" || s == "active" || s == "expired" || s == "terminated"
}
