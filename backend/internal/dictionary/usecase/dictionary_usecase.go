package usecase

import "backend/internal/dictionary/repository"

type DictionaryUsecase struct {
	repo *repository.SQLiteRepository
}

func NewDictionaryUsecase(repo *repository.SQLiteRepository) *DictionaryUsecase {
	return &DictionaryUsecase{repo: repo}
}

func (uc *DictionaryUsecase) ListOptions(slug string) ([]repository.Option, error) {
	return uc.repo.ListBySlug(slug)
}

// SeedOptions inserts the given options only if the table is currently empty.
func (uc *DictionaryUsecase) SeedOptions(options []repository.Option) error {
	total, err := uc.repo.Count()
	if err != nil {
		return err
	}
	if total > 0 {
		return nil
	}
	for i := range options {
		if err := uc.repo.Create(&options[i]); err != nil {
			return err
		}
	}
	return nil
}
