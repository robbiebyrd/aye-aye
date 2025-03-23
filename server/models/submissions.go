package models

type CountdownGameDataSceneSubmissions struct {
	PlayerId string `json:"playerId"`
	Entry    string `json:"entry,omitempty"`
	Total    string `json:"total,omitempty"`
	Correct  bool   `json:"correct,omitempty"`
}
