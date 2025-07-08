package repo

import (
	"context"
	"encoding/json"
	"log"

	"github.com/redis/go-redis/v9"

	"github.com/robbiebyrd/aye-aye/internal/models"
)

type GameRepo struct {
	Client *redis.Client
	Ctx    context.Context
}

// NewGameRepo creates a new repository for accessing game data
func NewGameRepo() *GameRepo {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	err := rdb.Ping(context.Background()).Err()
	if err != nil {
		panic(err)
	}

	ctx := context.Background()

	return &GameRepo{
		Client: rdb,
		Ctx:    ctx,
	}
}

// GetGame retrieves game data for a specific game ID
func (s *GameRepo) GetGame(id string) *models.GameData {
	gameExists := s.CheckGame(id)
	if !gameExists {
		return s.NewGame(id)
	}

	var game models.GameData

	val, err := s.Client.Get(s.Ctx, id).Result()
	if err != nil {
		panic(err)
	}

	err = json.Unmarshal([]byte(val), &game)
	if err != nil {
		log.Fatal(err)
	}

	return &game
}

// CheckGame checks to see if a game with the given ID already exists
func (s *GameRepo) CheckGame(id string) bool {
	exists, err := s.Client.Exists(s.Ctx, id).Result()
	if err != nil {
		panic(err)
	}
	if exists > 0 {
		return true
	}
	return false
}

// UpdateGame saves game data to the repository
func (s *GameRepo) UpdateGame(game models.GameData) {
	jsonData, err := json.MarshalIndent(game, "", "  ")
	if err != nil {
		panic(err)
	}

	err = s.Client.Set(s.Ctx, game.GameID, jsonData, 0).Err()
	if err != nil {
		panic(err)
	}

	return
}

// NewGame creates a new game, given an ID
func (s *GameRepo) NewGame(id string) *models.GameData {
	team1 := "Red Team"
	team2 := "Blue Team"
	showInput := false

	game := models.GameData{
		GameID:          id,
		CurrentScene:    "lobby",
		ControllingTeam: &team1,
		Players:         make(map[string]models.Player),
		Scenes: map[string]models.Scene{
			"lobby": {
				Title:      "Lobby",
				Scene:      "lobby",
				NextScene:  "1",
				Timer:      -1,
				NextTeam:   &team1,
				Background: "/img/greenbg/4.png",
			},
			"1": {
				Title:       "Round 1",
				Scene:       "letterboard",
				NextScene:   "2",
				Timer:       -1,
				Letters:     &models.EmptyLetters,
				Board:       &models.EmptyBoard,
				FoundWords:  &[]string{},
				ShowInput:   &showInput,
				Submissions: map[string]models.Submission{},
				NextTeam:    &team1,
				Background:  "/img/greenbg/1.png",
			},
			"2": {
				Title:        "Round 1",
				Scene:        "mathsboard",
				NextScene:    "3",
				Timer:        -1,
				Numbers:      &[]int{0, 0, 0, 0, 0, 0},
				TargetNumber: nil,
				NextTeam:     &team2,
				Background:   "/img/greenbg/2.png",
			},
			"3": {
				Title:       "Round 2",
				Scene:       "letterboard",
				NextScene:   "4",
				Timer:       -1,
				Letters:     &models.EmptyLetters,
				Board:       &models.EmptyBoard,
				FoundWords:  &[]string{},
				ShowInput:   &showInput,
				Submissions: map[string]models.Submission{},
				NextTeam:    &team2,
				Background:  "/img/greenbg/1.png",
			},
			"4": {
				Title:        "Round 2",
				Scene:        "mathsboard",
				NextScene:    "5",
				Timer:        -1,
				Numbers:      &[]int{0, 0, 0, 0, 0, 0},
				TargetNumber: nil,
				NextTeam:     &team1,
				Background:   "/img/greenbg/2.png",
			},
			"5": {
				Title:       "Round 3",
				Scene:       "letterboard",
				NextScene:   "6",
				Timer:       -1,
				Letters:     &models.EmptyLetters,
				Board:       &models.EmptyBoard,
				FoundWords:  &[]string{},
				ShowInput:   &showInput,
				Submissions: map[string]models.Submission{},
				NextTeam:    &team1,
				Background:  "/img/greenbg/1.png",
			},
			"6": {
				Title:        "Round 3",
				Scene:        "mathsboard",
				NextScene:    "7",
				Timer:        -1,
				Numbers:      &[]int{0, 0, 0, 0, 0, 0},
				TargetNumber: nil,
				NextTeam:     &team2,
				Background:   "/img/greenbg/2.png",
			},
			"7": {
				Title:       "Round 4",
				Scene:       "letterboard",
				NextScene:   "8",
				Timer:       -1,
				Letters:     &models.EmptyLetters,
				Board:       &models.EmptyBoard,
				FoundWords:  &[]string{},
				ShowInput:   &showInput,
				Submissions: map[string]models.Submission{},
				NextTeam:    &team2,
				Background:  "/img/greenbg/1.png",
			},
			"8": {
				Title:        "Round 4",
				Scene:        "mathsboard",
				NextScene:    "9",
				Timer:        -1,
				Numbers:      &[]int{0, 0, 0, 0, 0, 0},
				TargetNumber: nil,
				NextTeam:     &team1,
				Background:   "/img/greenbg/2.png",
			},
			"9": {
				Title:       "Round 5",
				Scene:       "conundrum",
				NextScene:   "end",
				Timer:       -1,
				Word:        &[]string{},
				Jumbled:     &[]string{},
				ShowInput:   &showInput,
				Submissions: map[string]models.Submission{},
				NextTeam:    &team2,
				Background:  "/img/greenbg/3.png",
			},
			"end": {
				Title:       "End",
				Scene:       "end",
				NextScene:   "lobby",
				Timer:       -1,
				Word:        &[]string{},
				Jumbled:     &[]string{},
				ShowInput:   &showInput,
				Submissions: map[string]models.Submission{},
				NextTeam:    &team1,
				Background:  "/img/greenbg/4.png",
			},
		},
	}
	s.UpdateGame(game)
	return &game
}

// ResetGame resets a scene in a game to its defaults
func (s *GameRepo) ResetGame(game *models.GameData, sceneId string) *models.GameData {
	showInput := false
	sc := game.Scenes[sceneId]
	sc.Timer = -1
	sc.TimerRun = false
	sc.Submissions = map[string]models.Submission{}
	sc.Letters = &models.EmptyLetters
	sc.Board = &models.EmptyBoard
	sc.FoundWords = &[]string{}
	sc.Word = &models.EmptyLetters
	sc.Jumbled = &models.EmptyLetters
	sc.ShowInput = &showInput
	sc.Numbers = &[]int{}
	sc.TargetNumber = nil
	game.Scenes[sceneId] = sc
	return game
}

// CheckGamePlayer determines if a given PlayerID is in a game
func (s *GameRepo) CheckGamePlayer(id string, playerId string) bool {
	game := s.GetGame(id)
	_, playerExists := game.Players[playerId]
	if playerExists {
		return true
	}
	return false
}

// CheckGameForHost checks to see if the game has a host already
func (s *GameRepo) CheckGameForHost(id string) bool {
	game := s.GetGame(id)
	for _, player := range game.Players {
		if player.Host == true {
			return true
		}
	}
	return false
}
