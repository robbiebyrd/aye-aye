package scenes

import (
	"encoding/json"
	"time"

	"github.com/olahol/melody"
	services "github.com/robbiebyrd/gameserve/internal/game"
	"github.com/robbiebyrd/gameserve/internal/models"
	"github.com/robbiebyrd/gameserve/internal/repo"
)

// GameScene represents common logic for game scenes.
type GameScene struct {
	GameRepo *repo.GameRepo
	Timers   map[string]*services.Countdowner
}

// NewGameScene creates a new GameScene.
func NewGameScene(gameRepo *repo.GameRepo) *GameScene {
	return &GameScene{
		GameRepo: gameRepo,
		Timers:   make(map[string]*services.Countdowner),
	}
}

// StartTimer starts a timer for the given game and broadcasts updates.
func (g *GameScene) StartTimer(game *models.GameData, m *melody.Melody, duration int, onDone func(game *models.GameData)) {
	g.Timers[game.GameID] = services.NewCountdowner(services.CountdownerOptions{
		Duration:       time.Duration(duration) * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun: func(started bool) {
			g.SetTimer(game, m, duration+1, false)
		},
		OnPaused: func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			updatedGame := g.GameRepo.GetGame(game.GameID)
			onDone(updatedGame)
			g.SetTimer(updatedGame, m, -1, true)
			delete(g.Timers, game.GameID)
			data, _ := json.Marshal(updatedGame)
			m.Broadcast(data)
		},
		OnTick: func(passed, remained time.Duration) {
			g.IncrementTimer(game, m, -1)
		},
	})
	go g.Timers[game.GameID].Run()
}

// CancelTimer stops and removes the timer for the given game.
func (g *GameScene) CancelTimer(game *models.GameData) *models.GameData {
	if timer, ok := g.Timers[game.GameID]; ok {
		timer.Stop()
		delete(g.Timers, game.GameID)
	}
	sc := game.Scenes[game.CurrentScene]
	sc.Timer = -1
	game.Scenes[game.CurrentScene] = sc
	return game
}

// IncrementTimer increments the timer for the given game and broadcasts updates.
func (g *GameScene) IncrementTimer(game *models.GameData, m *melody.Melody, increment int) {
	scene := game.Scenes[game.CurrentScene]
	scene.Timer += increment
	game.Scenes[game.CurrentScene] = scene
	g.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	m.Broadcast(data)
}

// SetTimer sets the timer for the given game and broadcasts updates.
func (g *GameScene) SetTimer(game *models.GameData, m *melody.Melody, setTime int, setRun bool) {
	scene := game.Scenes[game.CurrentScene]
	scene.Timer = setTime
	scene.TimerRun = setRun
	game.Scenes[game.CurrentScene] = scene
	g.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	m.Broadcast(data)
}

// AddToPlayerScore adds to a player's score in the given game.
func (g *GameScene) AddToPlayerScore(game *models.GameData, playerId string, addToScore int) *models.GameData {
	player, ok := game.Players[playerId]
	if !ok {
		return nil
	}

	score := 0
	if player.Score != nil {
		score = *player.Score
	}
	score += addToScore
	player.Score = &score
	game.Players[playerId] = player
	g.GameRepo.UpdateGame(*game)
	return game
}

// ResetGame resets the game state for the current scene.
func (g *GameScene) ResetGame(game *models.GameData) *models.GameData {
	g.CancelTimer(game)
	return g.GameRepo.ResetGame(game, game.CurrentScene)
}

// HasPlayerSubmitted checks if a player has already submitted a word for the current round.
func (g *GameScene) HasPlayerSubmitted(game *models.GameData, playerId string) bool {
	submission := game.Scenes[game.CurrentScene].Submissions[playerId]
	if submission.Entry != nil {
		return true
	}
	return false
}
