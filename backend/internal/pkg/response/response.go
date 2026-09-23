package response

import (
	"encoding/json"
	"net/http"
)

type Response struct {
	Status string     `json:"status"`
	Data   any        `json:"data"`
	Error  *ErrorBody `json:"error"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func WriteSuccess(w http.ResponseWriter, status int, data any) {
	writeJSON(w, status, Response{Status: "success", Data: data, Error: nil})
}

func WriteError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, Response{Status: "error", Data: nil, Error: &ErrorBody{Code: code, Message: message}})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
