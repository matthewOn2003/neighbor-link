package delivery

import (
	"backend/internal/pkg/storage"
	"backend/internal/property/usecase"
)

type PropertyController struct {
	usecase *usecase.PropertyUsecase
	storage storage.Uploader
}

func NewPropertyController(uc *usecase.PropertyUsecase) *PropertyController {
	return &PropertyController{usecase: uc}
}

// WithStorage attaches object storage for cover image uploads and link generation.
func (c *PropertyController) WithStorage(u storage.Uploader) *PropertyController {
	c.storage = u
	return c
}
