package models

type Player struct {
	Disconnected bool   `json:"disconnected"`
	Host         bool   `json:"host"`
	Name         string `json:"name"`
	Team         string `json:"team"`
	Score        *int   `json:"score"`
}
