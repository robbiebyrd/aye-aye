package scenes

import (
	"encoding/json"
	"fmt"
	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/models"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/services"
	"strconv"
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

func (c *ConundrumScene) cancelConundrumTimer(gameId string) {
	_, ok := c.Timers[gameId]
	if ok {
		c.Timers[gameId].Stop()
	}
	g := c.GameRepo.GetGame(gameId)
	sc := g.Scenes[g.CurrentScene]
	sc.Timer = -1
	g.Scenes[g.CurrentScene] = sc
	c.GameRepo.UpdateGame(*g)
}

func (c *ConundrumScene) startConundrumTimer(game *models.CountdownGameData, session *melody.Session, m *melody.Melody) {
	c.resetConundrum(game)
	sc := game.Scenes[game.CurrentScene]
	sc.Timer = timerLength + 1

	conundrum := c.ConundrumService.GetConundrum()
	sc.Jumbled = &conundrum.Jumbled
	game.Scenes[game.CurrentScene] = sc

	c.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	m.Broadcast(data)

	c.Timers[game.GameID] = services.NewCountdowner(services.CountdownerOptions{
		Duration:       time.Duration(timerLength) * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun: func(started bool) {
			scene := game.Scenes[game.CurrentScene]
			scene.Timer = timerLength + 1
			game.Scenes[game.CurrentScene] = scene
			c.GameRepo.UpdateGame(*game)
			newData, _ := json.Marshal(game)
			m.Broadcast(newData)
		},
		OnPaused: func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			g := c.GameRepo.GetGame(game.GameID)
			sc := g.Scenes[game.CurrentScene]
			sc.Timer -= 1
			sc.Word = &conundrum.Word
			sc.TimerRun = true
			g.Scenes[game.CurrentScene] = sc
			c.GameRepo.UpdateGame(*g)
			newData, _ := json.Marshal(g)
			m.Broadcast(newData)
			delete(c.Timers, game.GameID)
		},
		OnTick: func(passed, remained time.Duration) {
			g := c.GameRepo.GetGame(game.GameID)
			sc := g.Scenes[game.CurrentScene]
			sc.Timer -= 1
			g.Scenes[game.CurrentScene] = sc
			c.GameRepo.UpdateGame(*g)
			newData, _ := json.Marshal(g)
			m.Broadcast(newData)
		},
	})

	go c.Timers[game.GameID].Run()
	return

}

func (c *ConundrumScene) resetConundrum(game *models.CountdownGameData) {
	c.cancelConundrumTimer(game.GameID)
	resetGame := c.GameRepo.ResetGame(game.GameID, game.CurrentScene)
	c.GameRepo.UpdateGame(*resetGame)
}

func (c *ConundrumScene) submitConundrum(game *models.CountdownGameData, submissionText string, playerId string) {
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

	fmt.Println("submissionIndex" + strconv.Itoa(submissionIndex))

	isCorrect := false
	if strings.ToLower(strings.Join(*sc.Word, "")) == strings.ToLower(submissionText) {
		isCorrect = true
	}

	submission.Correct = &isCorrect

	var alreadySolved bool

	for _, sub := range sc.Submissions {
		if *sub.Correct == true {
			alreadySolved = true
			fmt.Println("Already solved by " + strconv.FormatBool(alreadySolved))
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
		fmt.Println(*player.Score)
	}

	if submissionIndex == -1 {
		sc.Submissions = append(sc.Submissions, submission)
	} else {
		sc.Submissions[submissionIndex] = submission
	}

	game.Scenes[game.CurrentScene] = sc
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
