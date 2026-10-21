package usecase

import (
	"errors"
	"strconv"
	"strings"

	"backend/internal/settings/repository"
)

var ErrInvalidSettings = errors.New("invalid billing settings")

// BillingSettings is the billing configuration shown to and edited by admins.
type BillingSettings struct {
	DueDay            int    `json:"due_day"`
	OverdueDay        int    `json:"overdue_day"`
	BankName          string `json:"bank_name"`
	BankAccountNo     string `json:"bank_account_no"`
	BankAccountHolder string `json:"bank_account_holder"`
}

type SettingsUsecase struct {
	repo *repository.SQLiteRepository
}

func NewSettingsUsecase(repo *repository.SQLiteRepository) *SettingsUsecase {
	return &SettingsUsecase{repo: repo}
}

// GetBilling returns billing settings. Missing or non-numeric day values fall back to the product defaults (1 and 8).
func (uc *SettingsUsecase) GetBilling() (*BillingSettings, error) {
	values, err := uc.repo.GetBillingSettings()
	if err != nil {
		return nil, err
	}
	return &BillingSettings{
		DueDay:            intOr(values["due_day"], 1),
		OverdueDay:        intOr(values["overdue_day"], 8),
		BankName:          values["bank_name"],
		BankAccountNo:     values["bank_account_no"],
		BankAccountHolder: values["bank_account_holder"],
	}, nil
}

// UpdateBilling validates and stores billing settings. Day values must be 1..28 and overdue_day must be after due_day.
func (uc *SettingsUsecase) UpdateBilling(in BillingSettings) (*BillingSettings, error) {
	if in.DueDay < 1 || in.DueDay > 28 || in.OverdueDay < 1 || in.OverdueDay > 28 {
		return nil, ErrInvalidSettings
	}
	if in.OverdueDay <= in.DueDay {
		return nil, ErrInvalidSettings
	}
	values := map[string]string{
		"due_day":             strconv.Itoa(in.DueDay),
		"overdue_day":         strconv.Itoa(in.OverdueDay),
		"bank_name":           strings.TrimSpace(in.BankName),
		"bank_account_no":     strings.TrimSpace(in.BankAccountNo),
		"bank_account_holder": strings.TrimSpace(in.BankAccountHolder),
	}
	if err := uc.repo.UpsertBillingSettings(values); err != nil {
		return nil, err
	}
	return uc.GetBilling()
}

func intOr(raw string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(raw))
	if err != nil {
		return fallback
	}
	return value
}
