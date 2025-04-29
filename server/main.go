package main

import (
	"encoding/json"
	"github.com/joho/godotenv"
	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/services"
	"github.com/robbiebyrd/gameserve/services/scenes"
	"log"
	"net/http"
	"os"
)

type CountdownGameDataKeys map[string]any

func serve(m *melody.Melody) {

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %s", err)
	}

	listenAddr := os.Getenv("LISTEN_ADDR")
	listenPort := os.Getenv("LISTEN_PORT")
	if listenPort == "" {
		panic("You need to specify a port")
	}

	http.HandleFunc("/ws/{gameId}/{teamId}/{playerId}", func(w http.ResponseWriter, r *http.Request) {
		keys := make(CountdownGameDataKeys)
		keys["gameId"] = r.PathValue("gameId")
		keys["playerId"] = r.PathValue("playerId")
		keys["teamId"] = r.PathValue("teamId")
		m.HandleRequestWithKeys(w, r, keys)
		return
	})

	http.ListenAndServe(listenAddr+":"+listenPort, nil)
}

func main() {

	gameRepo := repo.NewGameRepo()
	sceneService := services.NewSceneService(gameRepo)
	letterboardScene := scenes.NewLetterBoardScene("./data/words.txt", gameRepo)
	conundrumScene := scenes.NewConundrumScene("./data/conundrums.txt", gameRepo)

	m := melody.New()

	m.HandleConnect(func(s *melody.Session) {
		services.HandleConnect(s, m, gameRepo)
	})

	m.HandleDisconnect(func(s *melody.Session) {
		services.HandleDisconnect(s, m, gameRepo)
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		gameId, _, playerId := services.GetStandardKeys(s)

		var inputMessage map[string]interface{}
		_ = json.Unmarshal(msg, &inputMessage)

		if inputMessage["sceneId"] == nil {
			return
		}

		game := gameRepo.GetGame(gameId)

		switch inputMessage["sceneId"].(string) {
		case "sceneChange":
			sceneService.NextScene(gameId)
		case "letterboard":
			letterboardScene.HandleMessage(msg, gameId, playerId, m, s)
		case "conundrum":
			conundrumScene.HandleConundrumMessage(msg, gameId, playerId, m, s)
		}

		game = gameRepo.GetGame(gameId)
		dataAfter, _ := json.Marshal(game)

		m.Broadcast(dataAfter)
	})

	serve(m)
}
