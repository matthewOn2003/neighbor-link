package usecase

import (
	"errors"
	"regexp"
	"strings"
	"time"

	"backend/internal/maintenance/repository"
	"backend/internal/pkg/httpx"
)

var (
	ErrInvalidInput = errors.New("invalid maintenance request")
	ErrUnitNotFound = errors.New("unit not found")
	ErrNotFound     = repository.ErrNotFound
	datePattern     = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
)

const (
	slugCategory = "maintenance_category"
	slugPriority = "maintenance_priority"
	slugStatus   = "maintenance_status"
)

type MaintenanceUsecase struct {
	repo *repository.SQLiteRepository
}

func NewMaintenanceUsecase(repo *repository.SQLiteRepository) *MaintenanceUsecase {
	return &MaintenanceUsecase{repo: repo}
}

// ValidateFilter checks the created date range. Dates are inclusive YYYY-MM-DD.
func ValidateFilter(f repository.Filter) error {
	for _, d := range []string{f.CreatedFrom, f.CreatedTo} {
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
	return nil
}

func (uc *MaintenanceUsecase) List(f repository.Filter, page, perPage int) ([]repository.ListItem, int64, error) {
	page, perPage = httpx.NormalizePagination(page, perPage)
	return uc.repo.List(f, page, perPage)
}

func (uc *MaintenanceUsecase) Detail(id uint) (*repository.Detail, error) {
	return uc.repo.FindDetail(id)
}

// CreateInput is the input for a new maintenance request. The property is derived from the unit.
// TenantID is set for requests raised from the tenant portal and stays nil for admin-created ones.
type CreateInput struct {
	Title       string
	Description string
	Category    string
	Priority    string
	UnitID      uint
	TenantID    *uint
	Assignee    string
}

func (uc *MaintenanceUsecase) validateOption(slug, value string) error {
	ok, err := uc.repo.IsOption(slug, value)
	if err != nil {
		return err
	}
	if !ok {
		return ErrInvalidInput
	}
	return nil
}

func (uc *MaintenanceUsecase) Create(in CreateInput) (*repository.Detail, error) {
	title := strings.TrimSpace(in.Title)
	if title == "" || in.UnitID == 0 {
		return nil, ErrInvalidInput
	}
	category := strings.TrimSpace(in.Category)
	if category == "" {
		category = "other"
	}
	priority := strings.TrimSpace(in.Priority)
	if priority == "" {
		priority = "normal"
	}
	if err := uc.validateOption(slugCategory, category); err != nil {
		return nil, err
	}
	if err := uc.validateOption(slugPriority, priority); err != nil {
		return nil, err
	}
	propertyID, found, err := uc.repo.UnitPropertyID(in.UnitID)
	if err != nil {
		return nil, err
	}
	if !found {
		return nil, ErrUnitNotFound
	}
	unitID := in.UnitID
	request := &repository.Request{
		PropertyID:  &propertyID,
		UnitID:      &unitID,
		TenantID:    in.TenantID,
		Category:    category,
		Priority:    priority,
		Title:       title,
		Description: strings.TrimSpace(in.Description),
		Status:      "open",
		Assignee:    strings.TrimSpace(in.Assignee),
	}
	if err := uc.repo.Create(request); err != nil {
		return nil, err
	}
	return uc.repo.FindDetail(request.ID)
}

// UpdateInput holds optional changes. A nil field is left unchanged.
type UpdateInput struct {
	Title           *string
	Description     *string
	Category        *string
	Priority        *string
	Assignee        *string
	Status          *string
	ResolutionNotes *string
}

// Update applies the provided fields. resolved_at is set when the request moves to resolved or closed,
// and cleared when it moves back to open or in_progress.
func (uc *MaintenanceUsecase) Update(id uint, in UpdateInput) (*repository.Detail, error) {
	existing, err := uc.repo.FindRequest(id)
	if err != nil {
		return nil, err
	}
	updates := map[string]any{}
	if in.Title != nil {
		title := strings.TrimSpace(*in.Title)
		if title == "" {
			return nil, ErrInvalidInput
		}
		updates["title"] = title
	}
	if in.Description != nil {
		updates["description"] = strings.TrimSpace(*in.Description)
	}
	if in.Category != nil {
		category := strings.TrimSpace(*in.Category)
		if err := uc.validateOption(slugCategory, category); err != nil {
			return nil, err
		}
		updates["category"] = category
	}
	if in.Priority != nil {
		priority := strings.TrimSpace(*in.Priority)
		if err := uc.validateOption(slugPriority, priority); err != nil {
			return nil, err
		}
		updates["priority"] = priority
	}
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
