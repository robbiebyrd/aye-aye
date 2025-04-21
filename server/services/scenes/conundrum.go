package scenes

import (
	"encoding/json"
	"fmt"
	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/models"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/services"
	"strings"
	"time"
)

type ConundrumScene struct {
	GameRepo         *repo.GameRepo
	ConundrumService *services.ConundrumsService
	TimerChannels    map[string]*services.Countdowner
}

func NewConundrumScene() *ConundrumScene {
	return &ConundrumScene{
		GameRepo:         repo.NewGameRepo(),
		ConundrumService: services.NewConundrumsService("./data/conundrums.txt"),
		TimerChannels:    make(map[string]*services.Countdowner),
	}
}

func (c *ConundrumScene) cancelConundrumTimer(gameId string) {
	c.TimerChannels[gameId].Stop()
	g := c.GameRepo.GetGame(gameId)
	g.SceneData.Timer = -1
	c.GameRepo.UpdateGame(*g)
}

func (c *ConundrumScene) startConundrumTimer(game *models.CountdownGameData, session *melody.Session, m *melody.Melody) {
	c.resetConundrum(game)
	game.SceneData.Timer = timerLength + 1

	conundrum := c.ConundrumService.GetConundrum()
	game.SceneData.Jumbled = conundrum.Jumbled

	c.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	fmt.Println(string(data))
	m.Broadcast(data)

	c.TimerChannels[game.GameID] = services.NewCountdowner(services.CountdownerOptions{
		Duration:       time.Duration(timerLength) * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun:          func(started bool) {},
		OnPaused:       func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			g := c.GameRepo.GetGame(game.GameID)
			g.SceneData.Timer -= 1
			g.SceneData.Word = conundrum.Word
			c.GameRepo.UpdateGame(*g)
			data, _ := json.Marshal(g)
			m.Broadcast(data)
		},
		OnTick: func(passed, remained time.Duration) {
			g := c.GameRepo.GetGame(game.GameID)
			g.SceneData.Timer -= 1
			c.GameRepo.UpdateGame(*g)
			data, _ := json.Marshal(g)
			m.Broadcast(data)
		},
	})

	go c.TimerChannels[game.GameID].Run()
	return

}

func (c *ConundrumScene) resetConundrum(game *models.CountdownGameData) {
	resetGame := c.GameRepo.ResetGame(game.GameID)
	c.GameRepo.UpdateGame(*resetGame)
}

func (c *ConundrumScene) submitConundrum(game *models.CountdownGameData, submissionText string, playerId string) {
	submissionIndex := -1

	submission := models.CountdownGameDataSceneSubmissions{
		PlayerId: playerId,
		Entry:    submissionText,
		Total:    "",
		Correct:  nil,
	}

	for i, p := range game.SceneData.Submissions {
		if p.PlayerId == playerId {
			submissionIndex = i
			submission = game.SceneData.Submissions[submissionIndex]
			break
		}
	}

	isCorrect := false
	if strings.ToLower(strings.Join(game.SceneData.Word, "")) == strings.ToLower(submissionText) {
		isCorrect = true
	}
	submission.Correct = &isCorrect

	if isCorrect {
		for i, p := range game.Players {
			if p.ID == playerId {
				length := len(submission.Entry)
				if p.Score == nil {
					s := 0
					p.Score = &s
				}

				score := *p.Score + length
				p.Score = &score
				game.Players[i] = p
			}
		}
	}

	if submissionIndex == -1 {
		game.SceneData.Submissions = append(game.SceneData.Submissions, submission)
	} else {
		game.SceneData.Submissions[submissionIndex] = submission
	}
	c.GameRepo.UpdateGame(*game)

}

func (c *ConundrumScene) HandleConundrumMessage(msg []byte, gameId string, playerId string, m *melody.Melody, session *melody.Session) {
	game := c.GameRepo.GetGame(gameId)

	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return
	}

	switch messageDecoded["action"].(string) {
	case "start":
		c.startConundrumTimer(game, session, m)
		break
	case "cancel":
		c.cancelConundrumTimer(game.GameID)
	case "reset":
		fmt.Println("RESETTING")
		c.resetConundrum(game)
		break
	case "submit":
		if messageDecoded["submission"] == nil {

			return
		}
		c.submitConundrum(game, messageDecoded["submission"].(string), playerId)
		break
	default:
		break
	}

	return
}
