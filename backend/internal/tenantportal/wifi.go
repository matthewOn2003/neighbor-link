package tenantportal

import (
	"net/http"

	"backend/internal/pkg/response"
)

type wifiResponse struct {
	PropertyName string `json:"property_name"`
	WifiSSID     string `json:"wifi_ssid"`
	WifiPassword string `json:"wifi_password"`
	WifiSpeed    string `json:"wifi_speed"`
}

// WiFi returns the Wi-Fi credentials of the property the tenant lives in.
func (c *Controller) WiFi(w http.ResponseWriter, r *http.Request) {
	tenantID, ok := c.tenantOr404(w, r)
	if !ok {
		return
	}
	var out wifiResponse
	res := c.db.Raw(`
		SELECT COALESCE(p.name, '') AS property_name,
		       COALESCE(p.wifi_ssid, '') AS wifi_ssid,
		       COALESCE(p.wifi_password, '') AS wifi_password,
		       p.wifi_speed AS wifi_speed
		FROM tenants t
		JOIN properties p ON p.id = t.property_id
		WHERE t.id = ?`, tenantID).Scan(&out)
	if res.Error != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load wifi")
		return
	}
	if res.RowsAffected == 0 {
		response.WriteError(w, http.StatusNotFound, "NO_PROPERTY", "no property is linked to this tenant")
		return
	}
	response.WriteSuccess(w, http.StatusOK, out)
}
