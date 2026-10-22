package httpx

import (
	"net/http"

	"backend/internal/pkg/response"
)

func WriteInvalidInput(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", msg)
}

func WriteNotFound(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusNotFound, "NOT_FOUND", msg)
}

func WriteConflict(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusConflict, "CONFLICT", msg)
}

func WriteInternalError(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", msg)
}

func WriteUnauthorized(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", msg)
}

func WriteForbidden(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusForbidden, "FORBIDDEN", msg)
}

func WriteServiceUnavailable(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", msg)
}

func WriteRequestEntityTooLarge(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusRequestEntityTooLarge, "REQUEST_ENTITY_TOO_LARGE", msg)
}

func WriteBadGateway(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusBadGateway, "BAD_GATEWAY", msg)
}

func WriteGatewayTimeout(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusGatewayTimeout, "GATEWAY_TIMEOUT", msg)
}

func WriteTooManyRequests(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusTooManyRequests, "TOO_MANY_REQUESTS", msg)
}

func WriteRequestTimeout(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusRequestTimeout, "REQUEST_TIMEOUT", msg)
}

func WriteUnsupportedMediaType(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusUnsupportedMediaType, "UNSUPPORTED_MEDIA_TYPE", msg)
}

func WriteNotImplemented(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusNotImplemented, "NOT_IMPLEMENTED", msg)
}

func WritePaymentRequired(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusPaymentRequired, "PAYMENT_REQUIRED", msg)
}

func WriteExpectationFailed(w http.ResponseWriter, msg string) {
	response.WriteError(w, http.StatusExpectationFailed, "EXPECTATION_FAILED", msg)
}

func WriteCreated(w http.ResponseWriter, data any) {
	response.WriteSuccess(w, http.StatusCreated, data)
}

func WriteOK(w http.ResponseWriter, data any) {
	response.WriteSuccess(w, http.StatusOK, data)
}
