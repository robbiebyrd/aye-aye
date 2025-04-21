package models

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
	Clue         string                              `json:"clue,omitempty"`
	ShowInput    bool                                `json:"showInput,omitempty"`
}

var EmptyLetters = []string{" ", " ", " ", " ", " ", " ", " ", " ", " "}
