package usecase

import (
	"errors"
	"regexp"
	"strings"
	"time"

	"backend/internal/payment/repository"
	"backend/internal/pkg/httpx"
)

var (
	ErrInvalidInput = errors.New("invalid input")
	datePattern     = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
)

type PaymentUsecase struct {
	repo *repository.SQLiteRepository
}

func NewPaymentUsecase(repo *repository.SQLiteRepository) *PaymentUsecase {
	return &PaymentUsecase{repo: repo}
}

// ValidateFilter checks date formats and amount ranges. Dates are inclusive YYYY-MM-DD strings.
func ValidateFilter(f repository.ProofFilter) error {
	for _, d := range []string{f.PaidFrom, f.PaidTo} {
		if d == "" {
			continue
		}
		if !datePattern.MatchString(d) {
			return ErrInvalidInput
		}
		if _, err := time.Parse("2006-01-02", d); err != nil {
			return ErrInvalidInput
		}
	}
	if f.AmountMin != nil && f.AmountMax != nil && *f.AmountMin > *f.AmountMax {
		return ErrInvalidInput
	}
	return nil
}

func (uc *PaymentUsecase) ListProofs(f repository.ProofFilter, page, perPage int) ([]repository.ProofListItem, int64, error) {
	page, perPage = httpx.NormalizePagination(page, perPage)
	return uc.repo.ListProofs(f, page, perPage)
}

func (uc *PaymentUsecase) ListPayments(f repository.PaymentFilter, page, perPage int) ([]repository.PaymentListItem, int64, error) {
	page, perPage = httpx.NormalizePagination(page, perPage)
	return uc.repo.ListPayments(f, page, perPage)
}

func (uc *PaymentUsecase) Approve(id uint, reviewer string) (*repository.PaymentProof, error) {
	return uc.repo.Approve(id, reviewer, time.Now())
}

func (uc *PaymentUsecase) Reject(id uint, reviewer, reason string) (*repository.PaymentProof, error) {
	reason = strings.TrimSpace(reason)
	if reason == "" {
		return nil, ErrInvalidInput
	}
	return uc.repo.Reject(id, reviewer, reason, time.Now())
}
