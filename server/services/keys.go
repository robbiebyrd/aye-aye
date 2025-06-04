package services

import (
	"encoding/json"
	"github.com/olahol/melody"
)

// GetStandardKeys returns a set of standard session attributes that identify a user in a game.
func GetStandardKeys(s *melody.Session) (string, string, string) {
	keyGameId, _ := s.Get("gameId")
	keyTeamId, _ := s.Get("teamId")
	keyPlayerId, _ := s.Get("playerId")
	gameId := keyGameId.(string)
	teamId := keyTeamId.(string)
	playerId := keyPlayerId.(string)
	return gameId, teamId, playerId
}

// GetSceneIdFromMessage finds the sceneId attribute in an incoming message. A sceneId is required for all incoming messages.
func GetSceneIdFromMessage(msg []byte) *string {
	var inputMessage map[string]string
	if err := json.Unmarshal(msg, &inputMessage); err != nil {
		return nil
	}
	sceneId, ok := inputMessage["sceneId"]
	if !ok {
		return nil
	}
	return &sceneId
}
