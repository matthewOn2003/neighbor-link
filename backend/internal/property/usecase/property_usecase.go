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

func (uc *PropertyUsecase) List(currentPage, perPage int) ([]repository.Property, int64, error) {
	return uc.repo.List(currentPage, perPage)
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
