package repo

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/redis/go-redis/v9"
	"github.com/robbiebyrd/gameserve/models"
	"log"
)

type PlayerRepo struct {
	Client *redis.Client
	Ctx    context.Context
}

func NewPlayerRepo() *PlayerRepo {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       1,
	})

	err := rdb.Ping(context.Background()).Err()
	if err != nil {
		panic(err)
	}

	ctx := context.Background()

	return &PlayerRepo{
		Client: rdb,
		Ctx:    ctx,
	}
}

func (s *PlayerRepo) GetPlayer(id string) *models.CountdownGameDataPlayer {
	playerExists := s.CheckPlayer(id)
	if !playerExists {
		fmt.Println("CREATING NEW GAME")
		return s.NewPlayer(id)
	}

	fmt.Println("TRYING TO FIND GAME " + id)

	var player models.CountdownGameDataPlayer

	val, err := s.Client.Get(s.Ctx, id).Result()
	if err != nil {
		fmt.Println("ERROR FETCHING GAME DATA")
		panic(err)
	}

	fmt.Println("UNMARSHALLING GAME DATA")

	err = json.Unmarshal([]byte(val), &player)
	if err != nil {
		fmt.Println("COULD NOT UNMARSHAL GAME DATA")
		log.Fatal(err)
	}

	return &player
}

func (s *PlayerRepo) CheckPlayer(id string) bool {
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

func (s *PlayerRepo) UpdatePlayer(player models.CountdownGameDataPlayer) {
	jsonData, err := json.MarshalIndent(player, "", "  ")
	if err != nil {
		panic(err)
	}

	err = s.Client.Set(s.Ctx, player.ID, jsonData, 0).Err()
	if err != nil {
		panic(err)
	}

	return
}

func (s *PlayerRepo) NewPlayer(id string) *models.CountdownGameDataPlayer {
	player := models.CountdownGameDataPlayer{
		ID: id,
	}
	s.UpdatePlayer(player)
	return &player
}
