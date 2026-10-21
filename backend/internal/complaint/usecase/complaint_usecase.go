package usecase

import (
	"errors"
	"strings"
	"time"

	"backend/internal/complaint/repository"
	"backend/internal/pkg/httpx"
)

var (
	ErrInvalidInput  = errors.New("invalid complaint")
	ErrTenantNotLinked = errors.New("tenant not found")
	ErrNotFound      = repository.ErrNotFound
)

const (
	slugCategory = "complaint_category"
	slugStatus   = "complaint_status"
)

type ComplaintUsecase struct {
	repo *repository.SQLiteRepository
}

func NewComplaintUsecase(repo *repository.SQLiteRepository) *ComplaintUsecase {
	return &ComplaintUsecase{repo: repo}
}

func (uc *ComplaintUsecase) validateOption(slug, value string) error {
	ok, err := uc.repo.IsOption(slug, value)
	if err != nil {
		return err
	}
	if !ok {
		return ErrInvalidInput
	}
	return nil
}

func (uc *ComplaintUsecase) List(f repository.Filter, page, perPage int) ([]repository.ListItem, int64, error) {
	page, perPage = httpx.NormalizePagination(page, perPage)
	return uc.repo.List(f, page, perPage)
}

func (uc *ComplaintUsecase) Detail(id uint) (*repository.Detail, error) {
	return uc.repo.FindDetail(id)
}

// DetailForTenant returns the complaint only if it belongs to tenantID. Otherwise it reports ErrNotFound.
func (uc *ComplaintUsecase) DetailForTenant(tenantID, id uint) (*repository.Detail, error) {
	d, err := uc.repo.FindDetail(id)
	if err != nil {
		return nil, err
	}
	if d.TenantID != tenantID {
		return nil, ErrNotFound
	}
	return d, nil
}

// CreateInput is a complaint raised by a tenant. Category defaults to "other".
type CreateInput struct {
	TenantID    uint
	Category    string
	Title       string
	Description string
}

// Create stores a new open complaint. The unit and property come from the tenant's current lease.
func (uc *ComplaintUsecase) Create(in CreateInput) (*repository.Detail, error) {
	title := strings.TrimSpace(in.Title)
	if title == "" {
		return nil, ErrInvalidInput
	}
	category := strings.TrimSpace(in.Category)
	if category == "" {
		category = "other"
	}
	if err := uc.validateOption(slugCategory, category); err != nil {
		return nil, err
	}
	unitID, propertyID, found, err := uc.repo.TenantUnit(in.TenantID)
	if err != nil {
		return nil, err
	}
	if !found {
		return nil, ErrTenantNotLinked
	}
	tenantID := in.TenantID
	c := &repository.Complaint{
		TenantID:    tenantID,
		PropertyID:  propertyID,
		UnitID:      unitID,
		Category:    category,
		Title:       title,
		Description: strings.TrimSpace(in.Description),
		Status:      "open",
	}
	if err := uc.repo.Create(c); err != nil {
		return nil, err
	}
	return uc.repo.FindDetail(c.ID)
}

// UpdateInput holds optional admin changes. A nil field is left unchanged.
type UpdateInput struct {
	Status          *string
	Assignee        *string
	ResolutionNotes *string
}

// Update applies admin changes. resolved_at is set when the complaint first moves to resolved or closed,
// and cleared when it moves back to open or in_progress.
func (uc *ComplaintUsecase) Update(id uint, in UpdateInput) (*repository.Detail, error) {
	existing, err := uc.repo.FindRecord(id)
	if err != nil {
		return nil, err
	}
	updates := map[string]any{}
	if in.Assignee != nil {
		updates["assignee"] = strings.TrimSpace(*in.Assignee)
	}
	if in.ResolutionNotes != nil {
		updates["resolution_notes"] = strings.TrimSpace(*in.ResolutionNotes)
	}
	now := time.Now()
	if in.Status != nil {
		status := strings.TrimSpace(*in.Status)
		if err := uc.validateOption(slugStatus, status); err != nil {
			return nil, err
		}
		updates["status"] = status
		wasClosed := existing.Status == "resolved" || existing.Status == "closed"
		switch status {
		case "resolved", "closed":
			if !wasClosed {
				updates["resolved_at"] = now
			}
		case "open", "in_progress":
			updates["resolved_at"] = nil
		}
	}
	updates["updated_at"] = now
	if err := uc.repo.Update(id, updates); err != nil {
		return nil, err
	}
	return uc.repo.FindDetail(id)
}
