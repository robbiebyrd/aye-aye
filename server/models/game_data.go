package models

type CountdownGameData struct {
	GameID          string                    `json:"gameId"`
	ActiveSceneID   string                    `json:"activeSceneId,omitempty"`
	CurrentRound    string                    `json:"currentRound"`
	Rounds          []string                  `json:"rounds"`
	SceneData       CountdownSceneData        `json:"sceneData,omitempty"`
	Players         []CountdownGameDataPlayer `json:"players,omitempty"`
	ControllingTeam *string                   `json:"controllingTeam,omitempty"`
}
