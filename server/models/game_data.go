package models

type CountdownGameData struct {
	GameID        string                    `json:"gameId"`
	ActiveSceneID string                    `json:"activeSceneId,omitempty"`
	SceneData     CountdownSceneData        `json:"sceneData,omitempty"`
	Players       []CountdownGameDataPlayer `json:"players,omitempty"`
}

type CountdownGameDataPlayer struct {
	ID           string  `json:"id"`
	Disconnected bool    `json:"disconnected"`
	Host         bool    `json:"host"`
	Name         *string `json:"name"`
	Team         *string `json:"team"`
	Score        *int    `json:"score"`
	Leader       *bool   `json:"leader"`
}

type CountdownSceneData struct {
	Name         string                              `json:"name"`
	Timer        int                                 `json:"timer,omitempty"`
	Submissions  []CountdownGameDataSceneSubmissions `json:"submissions,omitempty"`
	Letters      []string                            `json:"letters,omitempty"`
	Board        [][]string                          `json:"board,omitempty"`
	FoundWords   []string                            `json:"found_words,omitempty"`
	Numbers      []int                               `json:"numbers,omitempty"`
	TargetNumber int                                 `json:"targetNumber,omitempty"`
	Word         []string                            `json:"word,omitempty"`
	Jumbled      []string                            `json:"jumbled,omitempty"`
	ShowInput    bool                                `json:"showInput,omitempty"`
}

var EmptyLetters = []string{" ", " ", " ", " ", " ", " ", " ", " ", " "}
