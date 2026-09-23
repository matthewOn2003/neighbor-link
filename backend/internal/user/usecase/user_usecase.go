package usecase

import (
	"errors"

	"backend/internal/user/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var ErrInvalidCredentials = errors.New("invalid credentials")

type UserUsecase struct {
	repo *repository.SQLiteRepository
}

func NewUserUsecase(repo *repository.SQLiteRepository) *UserUsecase {
	return &UserUsecase{repo: repo}
}

func (uc *UserUsecase) SeedUser(username, password, role string) error {
	_, err := uc.repo.FindByUsername(username)
	if err == nil {
		return nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = uc.repo.Create(username, string(passwordHash), role)
	return err
}

func (uc *UserUsecase) FindByUsername(username string) (*repository.User, error) {
	return uc.repo.FindByUsername(username)
}

func (uc *UserUsecase) Login(username, password, role string) (*repository.User, error) {
	user, err := uc.repo.FindByUsername(username)
	if err != nil || user.Role != role {
		return nil, ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}
	return user, nil
}
