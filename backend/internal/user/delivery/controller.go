package delivery

import (
	"backend/internal/pkg/middleware"
	"backend/internal/pkg/response"
	"backend/internal/user/repository"
	"backend/internal/user/usecase"
	"encoding/json"
	"net/http"
)

type UserController struct {
	usecase      *usecase.UserUsecase
	secret       string
	cookieSecure bool
}

func NewUserController(uc *usecase.UserUsecase, tokenSecret string, cookieSecure bool) *UserController {
	return &UserController{
		usecase:      uc,
		secret:       tokenSecret,
		cookieSecure: cookieSecure,
	}
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

func newLoginResponse(user *repository.User) loginResponse {
	return loginResponse{User: &repositoryUser{ID: user.ID, Username: user.Username, Role: user.Role}}
}

func writeUnauthenticated(w http.ResponseWriter) {
	response.WriteError(w, http.StatusUnauthorized, "UNAUTHENTICATED", "authentication required")
}

func setAuthCookie(w http.ResponseWriter, value string, maxAge int, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     middleware.AuthCookieName,
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		MaxAge:   maxAge,
	})
}

func (c *UserController) Health(w http.ResponseWriter, _ *http.Request) {
	response.WriteSuccess(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (c *UserController) Login(w http.ResponseWriter, r *http.Request) {
	var request loginRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.Username == "" || request.Password == "" || request.Role == "" {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "username, password and role are required")
		return
	}

	user, err := c.usecase.Login(request.Username, request.Password, request.Role)
	if err != nil {
		response.WriteError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "invalid username, password or role")
		return
	}

	setAuthCookie(w, CreateToken(user.Username, user.Role, c.secret), 60*60*8, c.cookieSecure)
	response.WriteSuccess(w, http.StatusOK, newLoginResponse(user))
}

func (c *UserController) Session(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(middleware.AuthCookieName)
	if err != nil {
		writeUnauthenticated(w)
		return
	}
	username, _, ok := VerifyToken(cookie.Value, c.secret)
	if !ok {
		writeUnauthenticated(w)
		return
	}
	user, err := c.usecase.FindByUsername(username)
	if err != nil {
		writeUnauthenticated(w)
		return
	}
	response.WriteSuccess(w, http.StatusOK, newLoginResponse(user))
}

// Logout intentionally skips requireAuth so an expired session can still be cleared.
func (c *UserController) Logout(w http.ResponseWriter, _ *http.Request) {
	setAuthCookie(w, "", -1, c.cookieSecure)
	w.WriteHeader(http.StatusNoContent)
}
