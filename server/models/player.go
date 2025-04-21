package models

type CountdownGameDataPlayer struct {
	ID           string  `json:"id"`
	Disconnected bool    `json:"disconnected"`
	Host         bool    `json:"host"`
	Name         *string `json:"name"`
	Team         *string `json:"team"`
	Score        *int    `json:"score"`
}
