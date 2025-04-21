package main

import (
	"encoding/json"
	"fmt"
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

func serve(m *melody.Melody) {
	http.HandleFunc("/ws/{gameId}/{teamId}/{playerId}", func(w http.ResponseWriter, r *http.Request) {
		keys := make(CountdownGameDataKeys)
		keys["gameId"] = r.PathValue("gameId")
		keys["playerId"] = r.PathValue("playerId")
		keys["teamId"] = r.PathValue("teamId")
		m.HandleRequestWithKeys(w, r, keys)
		return
	})
}

func disconnect(s *melody.Session, m *melody.Melody, gameRepo repo.GameRepo) {
	gameId, _, playerId := getStandardKeys(s)

	game := gameRepo.GetGame(gameId)
	previousData, _ := json.Marshal(game)

	for i, player := range game.Players {
		if player.ID == playerId {
			game.Players[i].Disconnected = true
		}
	}

	gameRepo.UpdateGame(*game)
	newData, _ := json.Marshal(game)
	fmt.Println(services.GetPatch(previousData, newData))
	m.Broadcast(newData)
}

func connect(s *melody.Session, m *melody.Melody, gameRepo repo.GameRepo) {
	var game *models.CountdownGameData

	gameId, teamId, playerId := getStandardKeys(s)

	if gameRepo.CheckGame(gameId) {
		game = gameRepo.GetGame(gameId)
	} else {
		game = gameRepo.NewGame(gameId)
	}

	if !gameRepo.CheckGamePlayer(gameId, playerId) {
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
	fmt.Println(services.GetPatch(nil, data))

	m.Broadcast(data)
}

func main() {
	m := melody.New()
	serve(m)

	gameRepo := repo.NewGameRepo()
	letterboardScene := scenes.NewLetterBoardScene()
	conundrumScene := scenes.NewConundrumScene()

	m.HandleConnect(func(s *melody.Session) {
		connect(s, m, *gameRepo)
	})

	m.HandleDisconnect(func(s *melody.Session) {
		disconnect(s, m, *gameRepo)
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		gameId, _, playerId := getStandardKeys(s)

		var inputMessage map[string]interface{}
		_ = json.Unmarshal(msg, &inputMessage)

		if inputMessage["sceneId"] == nil {
			return
		}

		game := gameRepo.GetGame(gameId)
		dataBefore, _ := json.Marshal(game)

		switch inputMessage["sceneId"].(string) {
		case "sceneChange":
			fmt.Println("sceneChange")
			g := gameRepo.GetGame(gameId)
			g.ActiveSceneID = inputMessage["action"].(string)
			gameRepo.UpdateGame(*g)
		case "letterboard":
			letterboardScene.HandleMessage(msg, gameId, playerId, m, s)
		case "conundrum":
			conundrumScene.HandleConundrumMessage(msg, gameId, playerId, m, s)
		}

		game = gameRepo.GetGame(gameId)
		dataAfter, _ := json.Marshal(game)

		patch := services.GetPatch(dataBefore, dataAfter)
		fmt.Println(patch)

		m.Broadcast(dataAfter)
	})

	http.ListenAndServe(":5002", nil)
}
