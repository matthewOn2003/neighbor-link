package delivery

import (
	"backend/internal/pkg/response"
	"backend/internal/user/repository"
	"backend/internal/user/usecase"
	"encoding/json"
	"net/http"
)

const authCookieName = "auth_token"

type UserHandler struct {
	usecase      *usecase.UserUsecase
	secret       string
	origins      []string
	cookieSecure bool
}

func NewUserHandler(uc *usecase.UserUsecase, tokenSecret string, allowedOrigins []string, cookieSecure bool) http.Handler {
	h := &UserHandler{usecase: uc, secret: tokenSecret, origins: allowedOrigins, cookieSecure: cookieSecure}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("POST /api/v1/auth/login", h.login)
	mux.HandleFunc("GET /api/v1/auth/session", h.requireAuth(h.session))
	mux.HandleFunc("POST /api/v1/auth/logout", h.logout)
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
	response.WriteSuccess(w, http.StatusOK, map[string]string{"status": "ok"})
}

func newLoginResponse(user *repository.User) loginResponse {
	return loginResponse{User: &repositoryUser{ID: user.ID, Username: user.Username, Role: user.Role}}
}

func writeUnauthenticated(w http.ResponseWriter) {
	response.WriteError(w, http.StatusUnauthorized, "UNAUTHENTICATED", "authentication required")
}

func setAuthCookie(w http.ResponseWriter, value string, maxAge int, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		MaxAge:   maxAge,
	})
}

func (h *UserHandler) login(w http.ResponseWriter, r *http.Request) {
	var request loginRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.Username == "" || request.Password == "" || request.Role == "" {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "username, password and role are required")
		return
	}

	user, err := h.usecase.Login(request.Username, request.Password, request.Role)
	if err != nil {
		response.WriteError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "invalid username, password or role")
		return
	}

	setAuthCookie(w, createToken(user.Username, user.Role, h.secret), 60*60*8, h.cookieSecure)
	response.WriteSuccess(w, http.StatusOK, newLoginResponse(user))
}

func (h *UserHandler) session(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(authCookieName)
	if err != nil {
		writeUnauthenticated(w)
		return
	}
	username, _, ok := verifyToken(cookie.Value, h.secret)
	if !ok {
		writeUnauthenticated(w)
		return
	}
	user, err := h.usecase.FindByUsername(username)
	if err != nil {
		writeUnauthenticated(w)
		return
	}
	response.WriteSuccess(w, http.StatusOK, newLoginResponse(user))
}

// logout intentionally skips requireAuth so an expired session can still be cleared.
func (h *UserHandler) logout(w http.ResponseWriter, _ *http.Request) {
	setAuthCookie(w, "", -1, h.cookieSecure)
	w.WriteHeader(http.StatusNoContent)
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

