package usecase

import (
	"crypto/rand"
	"math/big"

	"backend/internal/tenant/repository"
	userusecase "backend/internal/user/usecase"
)

const generatedPasswordLength = 12
const generatedPasswordCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

type TenantUsecase struct {
	repo   *repository.SQLiteRepository
	userUC *userusecase.UserUsecase
}

func NewTenantUsecase(repo *repository.SQLiteRepository, userUC *userusecase.UserUsecase) *TenantUsecase {
	return &TenantUsecase{repo: repo, userUC: userUC}
}

// generatePassword returns a cryptographically random password of fixed length.
func generatePassword() (string, error) {
	buf := make([]byte, generatedPasswordLength)
	for i := range buf {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(generatedPasswordCharset))))
		if err != nil {
			return "", err
		}
		buf[i] = generatedPasswordCharset[n.Int64()]
	}
	return string(buf), nil
}

// CreateTenant creates the auth_users login account and the tenant record together,
// returning the one-time plaintext password so it can be surfaced to the caller.
func (uc *TenantUsecase) CreateTenant(username, name, phone, email string, propertyID *uint, status string) (*repository.Tenant, string, error) {
	password, err := generatePassword()
	if err != nil {
		return nil, "", err
	}

	user, err := uc.userUC.CreateUser(username, password, "tenant")
	if err != nil {
		return nil, "", err
	}

	if status == "" {
		status = "active"
	}
	tenant := &repository.Tenant{
		UserID:     user.ID,
		Name:       name,
		Phone:      phone,
		Email:      email,
		PropertyID: propertyID,
		Status:     status,
	}
	if err := uc.repo.Create(tenant); err != nil {
		return nil, "", err
	}
	return tenant, password, nil
}

func (uc *TenantUsecase) FindByID(id uint) (*repository.Tenant, error) {
	return uc.repo.FindByID(id)
}

func (uc *TenantUsecase) Update(t *repository.Tenant) error {
	return uc.repo.Update(t)
}

func (uc *TenantUsecase) Delete(id uint) error {
	return uc.repo.Delete(id)
}

func (uc *TenantUsecase) List(f repository.TenantFilter, currentPage, perPage int) ([]repository.TenantListItem, int64, error) {
	return uc.repo.List(f, currentPage, perPage)
}

type SeedTenant struct {
	Username   string
	Password   string
	Name       string
	Phone      string
	Email      string
	PropertyID *uint
	Status     string
}

// SeedTenants inserts the given tenants (with matching auth_users accounts) only if the table is empty.
func (uc *TenantUsecase) SeedTenants(tenants []SeedTenant) error {
	total, err := uc.repo.Count()
	if err != nil {
		return err
	}
	if total > 0 {
		return nil
	}
	for _, seed := range tenants {
		user, err := uc.userUC.CreateUser(seed.Username, seed.Password, "tenant")
		if err != nil {
			return err
		}
		status := seed.Status
		if status == "" {
			status = "active"
		}
		tenant := &repository.Tenant{
			UserID:     user.ID,
			Name:       seed.Name,
			Phone:      seed.Phone,
			Email:      seed.Email,
			PropertyID: seed.PropertyID,
			Status:     status,
		}
		if err := uc.repo.Create(tenant); err != nil {
			return err
		}
	}
	return nil
}