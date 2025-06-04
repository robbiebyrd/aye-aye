package main

import (
	"encoding/json"
	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/servers"
	"github.com/robbiebyrd/gameserve/services"
	"github.com/robbiebyrd/gameserve/services/scenes"
)

func main() {

	// Create the Data Repos
	gameRepo := repo.NewGameRepo()

	// Create Services
	sceneService := services.NewSceneService(gameRepo)
	letterboardScene := scenes.NewLetterBoardScene("./data/words.txt", services.LetterPickDeck, gameRepo)
	conundrumScene := scenes.NewConundrumScene("./data/conundrums.txt", gameRepo)

	// Create the Melody framework object
	m := melody.New()

	m.HandleConnect(func(s *melody.Session) {
		services.HandleConnect(s, m, gameRepo)
	})

	m.HandleDisconnect(func(s *melody.Session) {
		services.HandleDisconnect(s, m, gameRepo)
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		// Decode the incoming message into a JSON Object
		sceneID := services.GetSceneIdFromMessage(msg)

		// Clients must present their current Scene ID when sending a message
		if sceneID == nil {
			return
		}

		// Get the gameId from the Session's keys
		gameId, _, playerId := services.GetStandardKeys(s)

		//Retrieve the game data
		game := gameRepo.GetGame(gameId)

		// Depending on the current active scene on the client, we hand the request and the game data
		// off to the appropriate scene handler service.
		switch *sceneID {
		case "sceneChange":
			game = sceneService.NextScene(game)
		case "letterboard":
			game = letterboardScene.HandleMessage(game, msg, playerId, m)
		case "conundrum":
			game = conundrumScene.HandleConundrumMessage(game, msg, playerId, m)
		}

		// The Scene Handlers return the updated game data, and we save it to the repository...
		gameRepo.UpdateGame(*game)

		// ... and then broadcast the game data to all clients.
		data, _ := json.Marshal(game)
		m.Broadcast(data)
	})

	servers.Serve(m)
}
