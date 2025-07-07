package servers

import (
	"fmt"
	"github.com/robbiebyrd/aye-aye/internal/repo"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/olahol/melody"
)

type GameDataKeys map[string]any

func WSServe(m *melody.Melody, listenAddr string, listenPort string) {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Welcome to the root handler!")
	})
	http.HandleFunc("/gc", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		gr := repo.NewGameRepo()
		words := repo.NewWordsRepo("./data/words.txt")
		for {
			randomWords := words.GetWordsOfLengths(3, 5)
			rand.Shuffle(len(randomWords), func(i, j int) {
				randomWords[i], randomWords[j] = randomWords[j], randomWords[i]
			})

			gameCode := strings.Join(randomWords[0:3], "-")
			check := gr.CheckGame(gameCode)
			if !check {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(200)
				w.Write([]byte(`{"gameCode": "` + gameCode + `"}`))
				break
			}
		}
	})
	http.HandleFunc("/ws/{gameId}/{teamId}/{playerId}", func(w http.ResponseWriter, r *http.Request) {
		keys := make(GameDataKeys)
		keys["gameId"] = r.PathValue("gameId")
		keys["playerId"] = r.PathValue("playerId")
		keys["teamId"] = r.PathValue("teamId")
		m.HandleRequestWithKeys(w, r, keys)
		return
	})

	http.ListenAndServe(listenAddr+":"+listenPort, nil)
}

func generateRandomString(length int) string {
	charset := "abcdefghijklmnopqrstuvwxyz"
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}
