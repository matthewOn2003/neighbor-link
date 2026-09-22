package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"

	"backend/internal/pkg/database"
	"backend/internal/user/delivery"
	"backend/internal/user/repository"
	"backend/internal/user/usecase"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("加载 .env 失败: %v", err)
	}

	db, err := database.InitSQLite(requiredEnv("DB_PATH"))
	if err != nil {
		log.Fatalf("数据库初始化失败: %v", err)
	}

	userRepo, err := repository.NewSQLiteRepository(db)
	if err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}
	userUsecase := usecase.NewUserUsecase(userRepo)

	adminPassword := requiredEnv("ADMIN_PASSWORD")
	tenantPassword := requiredEnv("TENANT_PASSWORD")
	if err := userUsecase.SeedUser("admin", adminPassword, "admin"); err != nil {
		log.Fatalf("初始化 admin 账号失败: %v", err)
	}
	if err := userUsecase.SeedUser("tenant", tenantPassword, "tenant"); err != nil {
		log.Fatalf("初始化 tenant 账号失败: %v", err)
	}

	serverAddress := requiredEnv("SERVER_ADDRESS")
	tokenSecret := requiredEnv("AUTH_SECRET")
	allowedOrigins := splitEnv(requiredEnv("CORS_ALLOWED_ORIGINS"))

	log.Printf("API server listening on %s", serverAddress)
	log.Fatal(http.ListenAndServe(serverAddress, delivery.NewUserHandler(userUsecase, tokenSecret, allowedOrigins)))
}

func requiredEnv(name string) string {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		log.Fatalf("required environment variable %s is not set", name)
	}
	return value
}

func splitEnv(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
