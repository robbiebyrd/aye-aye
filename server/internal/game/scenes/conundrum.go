package scenes

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"github.com/olahol/melody"
	"github.com/robbiebyrd/aye-aye/internal/models"
	"github.com/robbiebyrd/aye-aye/internal/repo"
)

type ConundrumScene struct {
	ConundrumService *repo.ConundrumsRepo
	GameScene        *GameScene
}

func NewConundrumScene(conundrumsPath string, gameRepo *repo.GameRepo) *ConundrumScene {
	return &ConundrumScene{
		ConundrumService: repo.NewConundrumsRepo(conundrumsPath),
		GameScene:        NewGameScene(gameRepo),
	}
}

func (c *ConundrumScene) startConundrumTimer(game *models.GameData, m *melody.Melody) *models.GameData {
	c.resetConundrum(game)

	// timerLength is the default duration of the game timer in seconds.
	envVars := repo.LoadEnvVars()
	timerLength, _ := strconv.Atoi(envVars.TimerLength)

	sc := game.Scenes[game.CurrentScene]
	conundrum := c.ConundrumService.GetConundrum()
	sc.Jumbled = &conundrum.Jumbled
	game.Scenes[game.CurrentScene] = sc
	c.GameScene.GameRepo.UpdateGame(*game)

	c.GameScene.StartTimer(game, m, timerLength, func(updatedGame *models.GameData) {
		sc := updatedGame.Scenes[updatedGame.CurrentScene]
		sc.Word = &conundrum.Word
		updatedGame.Scenes[updatedGame.CurrentScene] = sc
		c.GameScene.GameRepo.UpdateGame(*updatedGame)
	})

	return game

}

func (c *ConundrumScene) resetConundrum(game *models.GameData) *models.GameData {
	game = c.GameScene.CancelTimer(game)
	return c.GameScene.GameRepo.ResetGame(game, game.CurrentScene)
}

func (c *ConundrumScene) submitConundrum(game *models.GameData, submissionText string, playerId string) *models.GameData {
	sc := game.Scenes[game.CurrentScene]
	submission, ok := sc.Submissions[playerId]

	if ok == false {
		now := time.Now()
		submission = models.Submission{
			PlayerID:  playerId,
			Entry:     &submissionText,
			Timestamp: &now,
			Correct:   nil,
		}
	}

	isCorrect := false
	if strings.ToLower(strings.Join(*sc.Word, "")) == strings.ToLower(submissionText) {
		isCorrect = true
		game = c.GameScene.AddToPlayerScore(game, playerId, len(*submission.Entry))
	}

	submission.Correct = &isCorrect
	sc.Submissions[playerId] = submission
	game.Scenes[game.CurrentScene] = sc

	return game
}

func (c *ConundrumScene) HandleConundrumMessage(game *models.GameData, msg []byte, playerId string, m *melody.Melody) *models.GameData {

	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return game
	}

	switch messageDecoded["action"].(string) {
	case "start":
		game = c.startConundrumTimer(game, m)
		break
	case "cancel":
		game = c.GameScene.CancelTimer(game)
	case "reset":
		game = c.resetConundrum(game)
		break
	case "submit":
		if messageDecoded["submission"] == nil {
			return game
		}
		game = c.submitConundrum(game, messageDecoded["submission"].(string), playerId)
		break
	default:
		break
	}

	return game
}
