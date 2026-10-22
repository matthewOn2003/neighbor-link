package usecase

import (
	"log"
	"time"

	"backend/internal/contract/repository"
	"backend/internal/pkg/httpx"
)

type ContractUsecase struct {
	repo *repository.SQLiteRepository
}

func NewContractUsecase(r *repository.SQLiteRepository) *ContractUsecase {
	return &ContractUsecase{repo: r}
}

func (u *ContractUsecase) List(f repository.ContractFilter, p, n int) ([]repository.ContractListItem, int64, error) {
	p, n = httpx.NormalizePagination(p, n)
	return u.repo.List(f, p, n)
}

func (u *ContractUsecase) Detail(id uint) (*repository.ContractListItem, error) {
	return u.repo.Detail(id)
}

func (u *ContractUsecase) Save(c *repository.Contract) error {
	start, err := time.Parse("2006-01-02", c.StartDate)
	if err != nil {
		return repository.ErrInvalidContract
	}
	end, err := time.Parse("2006-01-02", c.EndDate)
	if err != nil || !end.After(start) {
		return repository.ErrInvalidContract
	}
	if c.TenantID == 0 || c.MonthlyRent < 0 || c.SecurityDeposit < 0 || c.BillingDay < 1 || c.BillingDay > 28 {
		return repository.ErrInvalidContract
	}
	switch c.Status {
	case "draft", "active", "expired", "terminated":
	default:
		return repository.ErrInvalidContract
	}
	return u.repo.Save(c)
}

// ExpireDue expires contracts whose end date has passed and returns how many it expired.
func (u *ContractUsecase) ExpireDue(now time.Time) (int64, error) {
	return u.repo.ExpireDue(now.Format("2006-01-02"))
}

// RunExpiryLoop expires due contracts now and then every interval. It runs until the process exits.
// A failed pass is logged and retried on the next tick.
func (u *ContractUsecase) RunExpiryLoop(interval time.Duration) {
	pass := func() {
		n, err := u.ExpireDue(time.Now())
		if err != nil {
			log.Printf("contract expiry failed: %v", err)
			return
		}
		if n > 0 {
			log.Printf("expired %d contract(s)", n)
		}
	}
	pass()
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for range ticker.C {
		pass()
	}
}
