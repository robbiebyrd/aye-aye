package repo

import (
	"context"
	"encoding/json"
	"github.com/redis/go-redis/v9"
	"github.com/robbiebyrd/gameserve/models"
	"log"
)

type GameRepo struct {
	Client *redis.Client
	Ctx    context.Context
}

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

func (s *GameRepo) GetGame(id string) *models.CountdownGameData {
	gameExists := s.CheckGame(id)
	if !gameExists {
		return s.NewGame(id)
	}

	var game models.CountdownGameData

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

func (s *GameRepo) UpdateGame(game models.CountdownGameData) {
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

func (s *GameRepo) NewGame(id string) *models.CountdownGameData {
	controllingTeam := "team1"
	showInput := false
	game := models.CountdownGameData{
		GameID:          id,
		CurrentScene:    "lobby",
		ControllingTeam: &controllingTeam,
		Players:         make(map[string]models.Player),
		Scenes: map[string]models.Scene{
			"lobby": {
				Title:     "Lobby",
				Scene:     "lobby",
				NextScene: "round1",
				Timer:     -1,
			},
			"round1": {
				Title:       "Round 1",
				Scene:       "letterboard",
				NextScene:   "round2",
				Timer:       -1,
				Letters:     &models.EmptyLetters,
				Board:       &models.EmptyBoard,
				FoundWords:  &[]string{},
				ShowInput:   &showInput,
				Submissions: []models.Submission{},
			},
			"round2": {
				Title:       "Round 2",
				Scene:       "letterboard",
				NextScene:   "round3",
				Timer:       -1,
				Letters:     &models.EmptyLetters,
				Board:       &models.EmptyBoard,
				FoundWords:  &[]string{},
				ShowInput:   &showInput,
				Submissions: []models.Submission{},
			},
			"round3": {
				Title:     "Round 3",
				Scene:     "conundrum",
				NextScene: "lobby",
				Timer:     -1,
				Word:      &[]string{},
				Jumbled:   &[]string{},
			},
		},
	}
	s.UpdateGame(game)
	return &game
}

func (s *GameRepo) ResetGame(id string, sceneId string) *models.CountdownGameData {
	showInput := false
	g := s.GetGame(id)
	sc := g.Scenes[sceneId]
	sc.Timer = -1
	sc.TimerRun = false
	sc.Submissions = make([]models.Submission, 0)
	sc.Letters = &models.EmptyLetters
	sc.Board = &models.EmptyBoard
	sc.FoundWords = &[]string{}
	sc.Word = &models.EmptyLetters
	sc.Jumbled = &models.EmptyLetters
	sc.ShowInput = &showInput
	g.Scenes[sceneId] = sc
	return g
}

func (s *GameRepo) CheckGamePlayer(id string, playerId string) bool {
	game := s.GetGame(id)
	_, playerExists := game.Players[playerId]
	if playerExists {
		return true
	}
	return false
}

func (s *GameRepo) CheckGameForHost(id string) bool {
	game := s.GetGame(id)
	for _, player := range game.Players {
		if player.Host == true {
			return true
		}
	}
	return false
}
