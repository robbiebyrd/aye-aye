package services

import "github.com/olahol/melody"

func GetStandardKeys(s *melody.Session) (string, string, string) {
	keyGameId, _ := s.Get("gameId")
	keyTeamId, _ := s.Get("teamId")
	keyPlayerId, _ := s.Get("playerId")
	gameId := keyGameId.(string)
	teamId := keyTeamId.(string)
	playerId := keyPlayerId.(string)
	return gameId, teamId, playerId
}
