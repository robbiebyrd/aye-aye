package servers

import (
	"net/http"

	"github.com/olahol/melody"
)

type GameDataKeys map[string]any

func WSServe(m *melody.Melody, listenAddr string, listenPort string) {
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
