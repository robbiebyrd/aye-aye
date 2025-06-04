package servers

import (
	"github.com/joho/godotenv"
	"github.com/olahol/melody"
	"log"
	"net/http"
	"os"
)

type GameDataKeys map[string]any

func Serve(m *melody.Melody) {

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
		keys := make(GameDataKeys)
		keys["gameId"] = r.PathValue("gameId")
		keys["playerId"] = r.PathValue("playerId")
		keys["teamId"] = r.PathValue("teamId")
		m.HandleRequestWithKeys(w, r, keys)
		return
	})

	http.ListenAndServe(listenAddr+":"+listenPort, nil)
}
