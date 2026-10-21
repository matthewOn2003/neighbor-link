package delivery

import (
	"encoding/json"
	"errors"
	"net/http"

	"backend/internal/pkg/response"
	"backend/internal/settings/usecase"
)

type SettingsController struct {
	uc *usecase.SettingsUsecase
}

func NewSettingsController(uc *usecase.SettingsUsecase) *SettingsController {
	return &SettingsController{uc: uc}
}

type billingSettingsRequest struct {
	DueDay            int    `json:"due_day"`
	OverdueDay        int    `json:"overdue_day"`
	BankName          string `json:"bank_name"`
	BankAccountNo     string `json:"bank_account_no"`
	BankAccountHolder string `json:"bank_account_holder"`
}

func (c *SettingsController) BillingDetail(w http.ResponseWriter, r *http.Request) {
	settings, err := c.uc.GetBilling()
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load billing settings")
		return
	}
	response.WriteSuccess(w, http.StatusOK, settings)
}

func (c *SettingsController) BillingUpdate(w http.ResponseWriter, r *http.Request) {
	var req billingSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	settings, err := c.uc.UpdateBilling(usecase.BillingSettings{
		DueDay:            req.DueDay,
		OverdueDay:        req.OverdueDay,
		BankName:          req.BankName,
		BankAccountNo:     req.BankAccountNo,
		BankAccountHolder: req.BankAccountHolder,
	})
	if err != nil {
		if errors.Is(err, usecase.ErrInvalidSettings) {
			response.WriteError(w, http.StatusBadRequest, "INVALID_SETTINGS", "due_day and overdue_day must be 1-28 and overdue_day must be after due_day")
			return
		}
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update billing settings")
		return
	}
	response.WriteSuccess(w, http.StatusOK, settings)
}
