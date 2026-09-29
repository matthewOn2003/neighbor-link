package delivery

func CreateToken(username, role, configuredSecret string) string {
	return createToken(username, role, configuredSecret)
}
