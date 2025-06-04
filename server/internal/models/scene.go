package models

type Scene struct {
	Title        string                `json:"title"`
	Scene        string                `json:"scene"`
	NextScene    string                `json:"nextScene"`
	Timer        int                   `json:"timer"`
	TimerRun     bool                  `json:"timerRun"`
	Letters      *[]string             `json:"letters"`
	Board        *[][]string           `json:"board"`
	FoundWords   *[]string             `json:"foundWords"`
	ShowInput    *bool                 `json:"showInput"`
	Word         *[]string             `json:"word,omitempty"`
	Jumbled      *[]string             `json:"jumbled,omitempty"`
	Clue         *string               `json:"clue"`
	Submissions  map[string]Submission `json:"submissions"`
	Numbers      *[]int                `json:"numbers,omitempty"`
	TargetNumber *int                  `json:"targetNumber,omitempty"`
}

var EmptyLetters = []string{" ", " ", " ", " ", " ", " ", " ", " ", " "}
var EmptyBoard = [][]string{EmptyLetters, EmptyLetters}
