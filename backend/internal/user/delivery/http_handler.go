package delivery

import (
	"backend/internal/user/usecase"
	"encoding/json"
	"net/http"
)

type UserHandler struct {
	usecase *usecase.UserUsecase
	secret  string
	origins []string
}

func NewUserHandler(uc *usecase.UserUsecase, tokenSecret string, allowedOrigins []string) http.Handler {
	h := &UserHandler{usecase: uc, secret: tokenSecret, origins: allowedOrigins}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("POST /api/v1/auth/login", h.login)
	return withCORS(mux, allowedOrigins)
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type loginResponse struct {
	User *repositoryUser `json:"user"`
}

type repositoryUser struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *UserHandler) login(w http.ResponseWriter, r *http.Request) {
	var request loginRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.Username == "" || request.Password == "" || request.Role == "" {
		writeError(w, http.StatusBadRequest, "username, password and role are required")
		return
	}

	user, err := h.usecase.Login(request.Username, request.Password, request.Role)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid username, password or role")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    createToken(user.Username, user.Role, h.secret),
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
		MaxAge:   60 * 60 * 8,
	})
	writeJSON(w, http.StatusOK, loginResponse{
		User: &repositoryUser{ID: user.ID, Username: user.Username, Role: user.Role},
	})
}

func withCORS(next http.Handler, allowedOrigins []string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if containsOrigin(allowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func containsOrigin(origins []string, target string) bool {
	for _, origin := range origins {
		if origin == target {
			return true
		}
	}
	return false
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
