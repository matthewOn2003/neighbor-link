package usecase

import "backend/internal/dictionary/repository"

type DictionaryUsecase struct {
	repo *repository.SQLiteRepository
}

func NewDictionaryUsecase(repo *repository.SQLiteRepository) *DictionaryUsecase {
	return &DictionaryUsecase{repo: repo}
}

// Dropdown returns one array per requested slug. Each item uses {value, label, variant}.
// The id and <slug>_display aliases remain for compatibility with older consumers.
// Unknown slugs come back as empty arrays.
func (uc *DictionaryUsecase) Dropdown(slugs []string) (map[string][]map[string]any, error) {
	result := make(map[string][]map[string]any, len(slugs))
	for _, slug := range slugs {
		result[slug] = []map[string]any{}
	}
	options, err := uc.repo.ListBySlugs(slugs)
	if err != nil {
		return nil, err
	}
	for _, o := range options {
		result[o.Slug] = append(result[o.Slug], map[string]any{
			"value":             o.Value,
			"label":             o.Label,
			"variant":           o.Variant,
			"id":                o.Value,
			o.Slug + "_display": o.Label,
		})
	}
	return result, nil
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
