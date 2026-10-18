package usecase

import (
	"backend/internal/property/repository"
)

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
