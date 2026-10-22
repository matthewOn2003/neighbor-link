package delivery

import (
	"encoding/json"
	"net/http"
)

func decodeBody(r *http.Request, dst any) bool {
	return json.NewDecoder(r.Body).Decode(dst) == nil
}
