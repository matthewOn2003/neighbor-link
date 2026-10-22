package middleware

import (
	"log"
	"net"
	"net/http"
	"strings"
	"time"
)

// auditKeywords are path fragments that mark a mutating POST route.
var auditKeywords = []string{"create", "update", "delete", "approve", "reject", "payment", "void", "generate", "import", "submit"}

// statusRecorder captures the status code written by the wrapped handler.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	if s.status == 0 {
		s.status = code
	}
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusRecorder) Write(b []byte) (int, error) {
	if s.status == 0 {
		s.status = http.StatusOK
	}
	return s.ResponseWriter.Write(b)
}

func isAuditedRequest(method, path string) bool {
	if method != http.MethodPost {
		return false
	}
	for _, keyword := range auditKeywords {
		if strings.Contains(path, keyword) {
			return true
		}
	}
	return false
}

// Audit writes one log line per mutating POST request: start time, actor, method, path, remote IP, status and duration.
// Request and response bodies are never logged because they can contain passwords.
// The actor is the username from the auth_token cookie, or "unknown" when it cannot be read.
// Other requests pass through unchanged.
func Audit(next http.Handler, tokenSecret string, verifyToken func(string, string) (string, string, bool)) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !isAuditedRequest(r.Method, r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}
		start := time.Now()
		recorder := &statusRecorder{ResponseWriter: w}
		next.ServeHTTP(recorder, r)

		status := recorder.status
		if status == 0 {
			status = http.StatusOK
		}
		log.Printf("[LOG] audit time=%s actor=%s method=%s path=%s ip=%s status=%d duration_ms=%d",
			start.Format(time.RFC3339),
			auditActor(r, tokenSecret, verifyToken),
			r.Method,
			r.URL.Path,
			remoteIP(r.RemoteAddr),
			status,
			time.Since(start).Milliseconds(),
		)
	})
}

func auditActor(r *http.Request, tokenSecret string, verifyToken func(string, string) (string, string, bool)) string {
	cookie, err := r.Cookie(AuthCookieName)
	if err != nil {
		return "unknown"
	}
	username, _, ok := verifyToken(cookie.Value, tokenSecret)
	if !ok || username == "" {
		return "unknown"
	}
	return username
}

func remoteIP(remoteAddr string) string {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		return remoteAddr
	}
	return host
}
