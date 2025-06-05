package services

import (
	"encoding/json"

	"github.com/olahol/melody"
	"github.com/robbiebyrd/aye-aye/internal/models"
	"github.com/robbiebyrd/aye-aye/internal/repo"
)

func HandleDisconnect(s *melody.Session, m *melody.Melody, gameRepo *repo.GameRepo) {
	gameId, _, playerId := GetStandardKeys(s)

	game := gameRepo.GetGame(gameId)

	player := game.Players[playerId]
	player.Disconnected = true
	game.Players[playerId] = player

	gameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	m.Broadcast(data)
}

func HandleConnect(s *melody.Session, m *melody.Melody, gameRepo *repo.GameRepo) {
	var game *models.GameData

	gameId, teamId, playerId := GetStandardKeys(s)

	if gameRepo.CheckGame(gameId) {
		game = gameRepo.GetGame(gameId)
	} else {
		game = gameRepo.NewGame(gameId)
	}

	if !gameRepo.CheckGamePlayer(gameId, playerId) {
		game.Players[playerId] = models.Player{
			Name: playerId,
			Host: !gameRepo.CheckGameForHost(gameId),
			Team: teamId,
		}
	} else {
		player := game.Players[playerId]
		player.Disconnected = false
		game.Players[playerId] = player
	}

	gameRepo.UpdateGame(*game)

	s.Set("gameId", gameId)
	data, _ := json.Marshal(game)

	m.Broadcast(data)
}
