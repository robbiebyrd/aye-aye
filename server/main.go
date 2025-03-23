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
	"strconv"
	"strings"
)

type CountdownGameDataKeys map[string]any

type LettersInput struct {
	Letters string `json:"letters,omitempty"`
}

func (p LettersInput) String() string {
	return fmt.Sprintf("%s", p.Letters)
}

var games = make(map[string]models.CountdownGameData)

func removeMatchingStrings(slice []string, match string) []string {
	var result []string
	for _, str := range slice {
		if str != match {
			result = append(result, str)
		}
	}
	return result
}

func main() {

	wordsService := services.NewWordsService("./data/words.txt")
	//lettersService := services.NewLettersService()
	gameRepo := repo.NewGameRepo()
	//playerRepo := repo.NewPlayerRepo()

	// scene services
	letterboardScene := scenes.NewLetterBoardScene()

	m := melody.New()

	http.HandleFunc("/game", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	fs := http.FileServer(http.Dir("./web"))
	http.Handle("/", fs)

	http.HandleFunc("/ws/{gameId}/{playerId}", func(w http.ResponseWriter, r *http.Request) {
		keys := make(CountdownGameDataKeys)
		keys["gameId"] = r.PathValue("gameId")
		keys["playerId"] = r.PathValue("playerId")
		m.HandleRequestWithKeys(w, r, keys)
		return
	})

	http.HandleFunc("/api/{gameId}/reset", func(w http.ResponseWriter, r *http.Request) {
		gameId := r.PathValue("gameId")
		game := gameRepo.ResetGame(gameId)
		data, _ := json.Marshal(game)
		m.Broadcast(data)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
	})

	http.HandleFunc("/api/{gameId}/solveLetters", func(w http.ResponseWriter, r *http.Request) {
		gameId := r.PathValue("gameId")
		game := games[gameId]
		game.SceneData.FoundWords = wordsService.GetMatchingWordsOfLengths(strings.Join(game.SceneData.Letters, ""), 2, 9)
		var firstLine []string = strings.Split(fmt.Sprintf("%-9s", game.SceneData.FoundWords[0]), "")
		var secondLine []string = strings.Split(fmt.Sprintf("%-9s", game.SceneData.FoundWords[1]), "")
		var board [][]string = [][]string{firstLine, secondLine}
		game.SceneData.Board = board
		data, _ := json.Marshal(game)
		m.Broadcast(data)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
	})

	m.HandleConnect(func(s *melody.Session) {
		keyGameId, _ := s.Get("gameId")
		keyPlayerId, _ := s.Get("playerId")
		gameId := keyGameId.(string)
		playerId := keyPlayerId.(string)

		var game *models.CountdownGameData
		fmt.Println("Checking if game exists " + gameId)

		gameExists := gameRepo.CheckGame(gameId)
		fmt.Println(gameExists)

		if gameExists {
			fmt.Println("Get Game " + gameId)
			game = gameRepo.GetGame(gameId)
		} else {
			fmt.Println("New Game")
			game = gameRepo.NewGame(gameId)
		}

		fmt.Println("Got Game " + gameId)

		playerExists := gameRepo.CheckGamePlayer(gameId, playerId)

		fmt.Println("Player " + playerId + " Exists " + strconv.FormatBool(playerExists))

		if !playerExists {
			host := false
			if !gameRepo.CheckGameForHost(gameId) {
				host = true
			}

			game.Players = append(game.Players, models.CountdownGameDataPlayer{
				ID:   playerId,
				Name: &playerId,
				Host: host,
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
		keyGameId, _ := s.Get("gameId")
		keyPlayerId, _ := s.Get("playerId")
		gameId := keyGameId.(string)
		playerId := keyPlayerId.(string)

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
		keyGameId, _ := s.Get("gameId")
		keyPlayerId, _ := s.Get("playerId")
		gameId := keyGameId.(string)
		playerId := keyPlayerId.(string)

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

		//keyGameId, _ := s.Get("gameId")
		//keyPlayerId, _ := s.Get("playerId")
		//gameId := keyGameId.(string)
		//playerId := keyPlayerId.(string)
		//
		//game := games[gameId]
		//
		//submissionIndex := -1
		//submission := models.CountdownGameDataSceneSubmissions{
		//	PlayerId: playerId,
		//	Entry:    "",
		//	Total:    "",
		//}
		//
		//for i, p := range game.SceneData.Submissions {
		//	if p.PlayerId == playerId {
		//		submissionIndex = i
		//		submission = game.SceneData.Submissions[submissionIndex]
		//	}
		//}
		//
		//submission.Entry = letters.Letters
		//game.SceneData.ShowInput = false
		//
		//if game.SceneData.FoundWords == nil && len(game.SceneData.FoundWords) == 0 {
		//	game.SceneData.FoundWords = wordsService.GetMatchingWords(strings.Join(game.SceneData.Letters, ""))
		//}
		//
		//submission.Correct = slices.Contains(game.SceneData.FoundWords, letters.Letters)
		//
		//if submissionIndex == -1 {
		//	game.SceneData.Submissions = append(game.SceneData.Submissions, submission)
		//} else {
		//	game.SceneData.Submissions[submissionIndex] = submission
		//}
		//
		//newBoard := make([][]string, len(game.SceneData.Board))
		//newBoard[0] = game.SceneData.Board[0]
		//newBoard[1] = strings.Split(fmt.Sprintf("%-9s", submission.Entry), "")
		//
		//game.SceneData.Board = newBoard
		//
		//games[gameId] = game
		//data, _ := json.Marshal(game)
		//
		//s.Write(data)
	})

	http.ListenAndServe(":5002", nil)
}
