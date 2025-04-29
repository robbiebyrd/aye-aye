package models

type CountdownGameData struct {
	GameID          string            `json:"gameId"`
	CurrentScene    string            `json:"currentScene"`
	ControllingTeam *string           `json:"controllingTeam,omitempty"`
	Scenes          map[string]Scene  `json:"scenes"`
	Players         map[string]Player `json:"players"`
}
