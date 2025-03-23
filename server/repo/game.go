package repo

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/redis/go-redis/v9"
	"github.com/robbiebyrd/gameserve/models"
	"log"
)

var EmptyLetters = []string{" ", " ", " ", " ", " ", " ", " ", " ", " "}

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
	fmt.Println(exists, err)
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
	game := models.CountdownGameData{
		GameID:        id,
		ActiveSceneID: "letterBoard",
		SceneData: models.CountdownSceneData{
			Name:        "letterBoard",
			Timer:       -1,
			Letters:     []string{},
			Board:       [][]string{EmptyLetters, EmptyLetters},
			Submissions: []models.CountdownGameDataSceneSubmissions{},
			ShowInput:   true,
		},
	}
	s.UpdateGame(game)
	return &game
}

func (s *GameRepo) ResetGame(id string) *models.CountdownGameData {
	game := s.GetGame(id)
	game.SceneData.Timer = -1
	game.SceneData.Letters = EmptyLetters
	game.SceneData.Board = [][]string{EmptyLetters, EmptyLetters}
	game.SceneData.Submissions = []models.CountdownGameDataSceneSubmissions{}
	game.SceneData.ShowInput = true
	game.SceneData.FoundWords = []string{}
	s.UpdateGame(*game)
	return game
}

func (s *GameRepo) CheckGamePlayer(id string, playerId string) bool {
	game := s.GetGame(id)
	for _, player := range game.Players {
		if player.ID == playerId {
			return true
		}
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
