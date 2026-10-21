package usecase

import (
	"errors"
	"strings"
	"time"

	"backend/internal/property/repository"

	"gorm.io/gorm"
)

var (
	ErrUnitNotFound        = errors.New("unit not found")
	ErrUnitInvalid         = errors.New("invalid unit")
	ErrUnitFloorMismatch   = errors.New("floor does not belong to block")
	ErrUnitCodeExists      = errors.New("unit code already exists in block")
	ErrUnitStatusInvalid   = errors.New("invalid unit status")
	ErrUnitHasActiveTenant = errors.New("unit has an active tenant")
)

// UnitCreate is the input for creating a unit.
type UnitCreate struct {
	BlockID  uint
	FloorID  uint
	Code     string
	Bedrooms int
	SizeSqft int
	Status   string
}

// UnitUpdate holds optional changes. A nil field is left unchanged.
type UnitUpdate struct {
	Code     *string
	Bedrooms *int
	SizeSqft *int
	Status   *string
}

type PropertyUsecase struct {
	repo *repository.SQLiteRepository
}

func NewPropertyUsecase(repo *repository.SQLiteRepository) *PropertyUsecase {
	return &PropertyUsecase{repo: repo}
}

func (uc *PropertyUsecase) Create(p *repository.Property) error {
	return uc.repo.Create(p)
}

func (uc *PropertyUsecase) FindByID(id uint) (*repository.Property, error) {
	return uc.repo.FindByID(id)
}

func (uc *PropertyUsecase) Update(p *repository.Property) error {
	return uc.repo.Update(p)
}

func (uc *PropertyUsecase) Delete(id uint) error {
	return uc.repo.Delete(id)
}

func (uc *PropertyUsecase) List(f repository.PropertyFilter, currentPage, perPage int) ([]repository.PropertyListItem, int64, error) {
	return uc.repo.List(f, currentPage, perPage)
}

func (uc *PropertyUsecase) Facets() (*repository.PropertyFacets, error) {
	return uc.repo.Facets()
}

func (uc *PropertyUsecase) FindDetail(id uint) (*repository.PropertyListItem, error) {
	return uc.repo.FindDetail(id)
}

func (uc *PropertyUsecase) ListBlocks(f repository.BlockFilter, currentPage, perPage int) ([]repository.BlockItem, int64, error) {
	return uc.repo.ListBlocks(f, currentPage, perPage)
}

func (uc *PropertyUsecase) FindBlockDetail(id uint) (*repository.BlockDetail, error) {
	return uc.repo.FindBlockDetail(id)
}

func (uc *PropertyUsecase) ListFloors(f repository.FloorFilter, currentPage, perPage int) ([]repository.FloorItem, int64, error) {
	return uc.repo.ListFloors(f, currentPage, perPage)
}

func (uc *PropertyUsecase) FindFloorDetail(id uint) (*repository.FloorDetail, error) {
	return uc.repo.FindFloorDetail(id)
}

func (uc *PropertyUsecase) ListUnits(f repository.UnitFilter, currentPage, perPage int) ([]repository.UnitListItem, int64, error) {
	return uc.repo.ListUnits(f, currentPage, perPage)
}

// SeedProperties inserts the given properties only if the table is currently empty.
func (uc *PropertyUsecase) SeedProperties(properties []repository.Property) error {
	total, err := uc.repo.Count()
	if err != nil {
		return err
	}
	if total > 0 {
		return nil
	}
	for i := range properties {
		if err := uc.repo.Create(&properties[i]); err != nil {
			return err
		}
	}
	return nil
}

// CreateUnit validates the unit against its block and floor, then stores it. An empty status defaults to vacant.
func (uc *PropertyUsecase) CreateUnit(in UnitCreate) (*repository.Unit, error) {
	code := strings.TrimSpace(in.Code)
	if in.BlockID == 0 || in.FloorID == 0 || code == "" || in.Bedrooms < 0 || in.SizeSqft < 0 {
		return nil, ErrUnitInvalid
	}
	status := strings.TrimSpace(in.Status)
	if status == "" {
		status = "vacant"
	}
	ok, err := uc.repo.IsUnitStatus(status)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, ErrUnitStatusInvalid
	}
	inBlock, err := uc.repo.FloorBelongsToBlock(in.FloorID, in.BlockID)
	if err != nil {
		return nil, err
	}
	if !inBlock {
		return nil, ErrUnitFloorMismatch
	}
	taken, err := uc.repo.UnitCodeTaken(in.BlockID, code, 0)
	if err != nil {
		return nil, err
	}
	if taken {
		return nil, ErrUnitCodeExists
	}
	unit := &repository.Unit{
		BlockID:  in.BlockID,
		FloorID:  in.FloorID,
		Code:     code,
		Bedrooms: in.Bedrooms,
		SizeSqft: in.SizeSqft,
		Status:   status,
	}
	if err := uc.repo.CreateUnit(unit); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
			return nil, ErrUnitCodeExists
		}
		return nil, err
	}
	return unit, nil
}

// UpdateUnit applies the provided fields. Setting status to vacant is rejected while an active tenant is assigned.
func (uc *PropertyUsecase) UpdateUnit(id uint, in UnitUpdate) (*repository.Unit, error) {
	existing, err := uc.repo.FindUnit(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUnitNotFound
		}
		return nil, err
	}
	updates := map[string]any{}
	if in.Code != nil {
		code := strings.TrimSpace(*in.Code)
		if code == "" {
			return nil, ErrUnitInvalid
		}
		if code != existing.Code {
			taken, err := uc.repo.UnitCodeTaken(existing.BlockID, code, id)
			if err != nil {
				return nil, err
			}
			if taken {
				return nil, ErrUnitCodeExists
			}
		}
		updates["code"] = code
	}
	if in.Bedrooms != nil {
		if *in.Bedrooms < 0 {
			return nil, ErrUnitInvalid
		}
		updates["bedrooms"] = *in.Bedrooms
	}
	if in.SizeSqft != nil {
		if *in.SizeSqft < 0 {
			return nil, ErrUnitInvalid
		}
		updates["size_sqft"] = *in.SizeSqft
	}
	if in.Status != nil {
		status := strings.TrimSpace(*in.Status)
		ok, err := uc.repo.IsUnitStatus(status)
		if err != nil {
			return nil, err
		}
		if !ok {
			return nil, ErrUnitStatusInvalid
		}
		if status == "vacant" {
			hasTenant, err := uc.repo.HasActiveTenant(id)
			if err != nil {
				return nil, err
			}
			if hasTenant {
				return nil, ErrUnitHasActiveTenant
			}
		}
		updates["status"] = status
	}
	updates["updated_at"] = time.Now()
	if err := uc.repo.UpdateUnit(id, updates); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
			return nil, ErrUnitCodeExists
		}
		return nil, err
	}
	return uc.repo.FindUnit(id)
}
