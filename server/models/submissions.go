package models

type CountdownGameDataSceneSubmissions struct {
	PlayerId string `json:"playerId"`
	Entry    string `json:"entry"`
	Total    string `json:"total"`
	Correct  *bool  `json:"correct"`
}
