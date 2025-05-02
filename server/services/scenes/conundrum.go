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
	Timers           map[string]*services.Countdowner
}

func NewConundrumScene(conundrumsPath string, gameRepo *repo.GameRepo) *ConundrumScene {
	return &ConundrumScene{
		GameRepo:         gameRepo,
		ConundrumService: services.NewConundrumsService(conundrumsPath),
		Timers:           make(map[string]*services.Countdowner),
	}
}

func (c *ConundrumScene) cancelConundrumTimer(game *models.CountdownGameData) *models.CountdownGameData {
	_, ok := c.Timers[game.GameID]
	if ok {
		c.Timers[game.GameID].Stop()
	}
	sc := game.Scenes[game.CurrentScene]
	sc.Timer = -1
	game.Scenes[game.CurrentScene] = sc
	return game
}

func (c *ConundrumScene) startConundrumTimer(game *models.CountdownGameData, session *melody.Session, m *melody.Melody) *models.CountdownGameData {
	c.resetConundrum(game)
	sc := game.Scenes[game.CurrentScene]
	sc.Timer = timerLength + 1

	conundrum := c.ConundrumService.GetConundrum()
	sc.Jumbled = &conundrum.Jumbled
	game.Scenes[game.CurrentScene] = sc

	c.Timers[game.GameID] = services.NewCountdowner(services.CountdownerOptions{
		Duration:       time.Duration(timerLength) * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun: func(started bool) {
			dataBefore, _ := json.Marshal(game)
			scene := game.Scenes[game.CurrentScene]
			scene.Timer = timerLength + 1
			game.Scenes[game.CurrentScene] = scene
			c.GameRepo.UpdateGame(*game)
			data, _ := json.Marshal(game)
			fmt.Println(services.GetPatch(dataBefore, data))
			m.Broadcast(data)
		},
		OnPaused: func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			g := c.GameRepo.GetGame(game.GameID)
			dataBefore, _ := json.Marshal(g)
			sc := g.Scenes[game.CurrentScene]
			sc.Timer -= 1
			sc.Word = &conundrum.Word
			sc.TimerRun = true
			g.Scenes[game.CurrentScene] = sc
			c.GameRepo.UpdateGame(*g)
			data, _ := json.Marshal(g)
			fmt.Println(services.GetPatch(dataBefore, data))
			m.Broadcast(data)
			delete(c.Timers, game.GameID)
		},
		OnTick: func(passed, remained time.Duration) {
			g := c.GameRepo.GetGame(game.GameID)
			dataBefore, _ := json.Marshal(g)
			sc := g.Scenes[game.CurrentScene]
			sc.Timer -= 1
			g.Scenes[game.CurrentScene] = sc
			c.GameRepo.UpdateGame(*g)
			data, _ := json.Marshal(g)
			fmt.Println(services.GetPatch(dataBefore, data))
			m.Broadcast(data)
		},
	})

	go c.Timers[game.GameID].Run()
	return game

}

func (c *ConundrumScene) resetConundrum(game *models.CountdownGameData) *models.CountdownGameData {
	c.cancelConundrumTimer(game)
	return c.GameRepo.ResetGame(game.GameID, game.CurrentScene)
}

func (c *ConundrumScene) submitConundrum(game *models.CountdownGameData, submissionText string, playerId string) *models.CountdownGameData {
	submissionIndex := -1

	now := time.Now()

	submission := models.Submission{
		PlayerID:  playerId,
		Entry:     submissionText,
		Timestamp: &now,
		Correct:   nil,
	}
	sc := game.Scenes[game.CurrentScene]

	for i, p := range sc.Submissions {
		if p.PlayerID == playerId {
			submissionIndex = i
			submission = sc.Submissions[submissionIndex]
			break
		}
	}

	isCorrect := false
	if strings.ToLower(strings.Join(*sc.Word, "")) == strings.ToLower(submissionText) {
		isCorrect = true
	}

	submission.Correct = &isCorrect

	var alreadySolved bool

	for _, sub := range sc.Submissions {
		if *sub.Correct == true {
			alreadySolved = true
		}
	}

	if isCorrect && !alreadySolved {
		length := len(submission.Entry)
		if game.Players[playerId].Score == nil {
			zeroScore := 0
			p := game.Players[playerId]
			p.Score = &zeroScore
			game.Players[playerId] = p
		}

		player := game.Players[playerId]
		score := *player.Score + length
		player.Score = &score
		game.Players[playerId] = player
	}

	if submissionIndex == -1 {
		sc.Submissions = append(sc.Submissions, submission)
	} else {
		sc.Submissions[submissionIndex] = submission
	}

	game.Scenes[game.CurrentScene] = sc
	return game
}

func (c *ConundrumScene) HandleConundrumMessage(game *models.CountdownGameData, msg []byte, playerId string, m *melody.Melody, session *melody.Session) *models.CountdownGameData {

	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return game
	}

	switch messageDecoded["action"].(string) {
	case "start":
		game = c.startConundrumTimer(game, session, m)
		break
	case "cancel":
		game = c.cancelConundrumTimer(game)
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
