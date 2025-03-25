package main

import (
	"encoding/json"
	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/models"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/services"
	"github.com/robbiebyrd/gameserve/services/scenes"
	"net/http"
)

type CountdownGameDataKeys map[string]any

func getStandardKeys(s *melody.Session) (string, string, string) {
	keyGameId, _ := s.Get("gameId")
	keyTeamId, _ := s.Get("teamId")
	keyPlayerId, _ := s.Get("playerId")
	gameId := keyGameId.(string)
	teamId := keyTeamId.(string)
	playerId := keyPlayerId.(string)
	return gameId, teamId, playerId
}

func main() {
	m := melody.New()

	http.HandleFunc("/ws/{gameId}/{teamId}/{playerId}", func(w http.ResponseWriter, r *http.Request) {
		keys := make(CountdownGameDataKeys)
		keys["gameId"] = r.PathValue("gameId")
		keys["playerId"] = r.PathValue("playerId")
		keys["teamId"] = r.PathValue("teamId")
		m.HandleRequestWithKeys(w, r, keys)
		return
	})

	wordsService := services.NewWordsService("./data/words.txt")
	gameRepo := repo.NewGameRepo()
	letterboardScene := scenes.NewLetterBoardScene()

	m.HandleConnect(func(s *melody.Session) {
		gameId, teamId, playerId := getStandardKeys(s)

		var game *models.CountdownGameData

		gameExists := gameRepo.CheckGame(gameId)

		if gameExists {
			game = gameRepo.GetGame(gameId)
		} else {
			game = gameRepo.NewGame(gameId)
		}

		playerExists := gameRepo.CheckGamePlayer(gameId, playerId)

		if !playerExists {
			host := false
			if !gameRepo.CheckGameForHost(gameId) {
				host = true
			}

			game.Players = append(game.Players, models.CountdownGameDataPlayer{
				ID:   playerId,
				Name: &playerId,
				Host: host,
				Team: &teamId,
			})
		} else {
			for i, player := range game.Players {
				if player.ID == playerId {
					game.Players[i].Disconnected = false
				}
			}
		}

		gameRepo.UpdateGame(*game)

		s.Set("gameId", gameId)
		data, _ := json.Marshal(game)

		m.Broadcast(data)
	})

	m.HandleDisconnect(func(s *melody.Session) {
		gameId, _, playerId := getStandardKeys(s)

		game := gameRepo.GetGame(gameId)

		for i, player := range game.Players {
			if player.ID == playerId {
				game.Players[i].Disconnected = true
			}
		}

		gameRepo.UpdateGame(*game)
		data, _ := json.Marshal(game)
		m.Broadcast(data)
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		gameId, _, playerId := getStandardKeys(s)

		var la map[string]interface{}
		_ = json.Unmarshal(msg, &la)

		if la["sceneId"] == nil {
			return
		}

		switch la["sceneId"].(string) {

		case "letterBoard":
			letterboardScene.HandleMessage(msg, gameId, playerId, wordsService, m, s)
		}

		game := gameRepo.GetGame(gameId)
		data, _ := json.Marshal(game)
		m.Broadcast(data)

		return
	})

	http.ListenAndServe(":5002", nil)
}
