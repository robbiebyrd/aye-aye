package scenes

import (
	"encoding/json"
	"fmt"
	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/models"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/services"
	"slices"
	"strings"
	"time"
)

var timerLength = 5

type LetterboardScene struct {
	GameRepo       *repo.GameRepo
	LettersService *services.LettersService
	Timers         map[string]*services.Countdowner
	WordsService   *services.WordsService
}

func NewLetterBoardScene(dictionaryPath string, gameRepo *repo.GameRepo) *LetterboardScene {
	return &LetterboardScene{
		GameRepo:       gameRepo,
		LettersService: services.NewLettersService(),
		Timers:         make(map[string]*services.Countdowner),
		WordsService:   services.NewWordsService(dictionaryPath),
	}
}

func removeMatchingStrings(slice []string, match string) []string {
	var result []string
	for _, str := range slice {
		if str != match {
			result = append(result, str)
		}
	}
	return result
}

func (s *LetterboardScene) cancelTimer(gameId string) {
	if s.Timers[gameId] != nil {
		s.Timers[gameId].Stop()
	}
	g := s.GameRepo.GetGame(gameId)
	sc := g.Scenes[g.CurrentScene]
	sc.Timer = -1
	g.Scenes[g.CurrentScene] = sc
	s.GameRepo.UpdateGame(*g)
}

func (s *LetterboardScene) startTimer(game *models.CountdownGameData, m *melody.Melody) {
	s.Timers[game.GameID] = services.NewCountdowner(services.CountdownerOptions{
		Duration:       time.Duration(timerLength) * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun: func(started bool) {
			scene := game.Scenes[game.CurrentScene]
			scene.Timer = timerLength + 1
			game.Scenes[game.CurrentScene] = scene
			s.GameRepo.UpdateGame(*game)
			newData, _ := json.Marshal(game)
			m.Broadcast(newData)
		},
		OnPaused: func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			g := s.GameRepo.GetGame(game.GameID)
			sc := g.Scenes[game.CurrentScene]
			sc.Timer -= 1
			g.Scenes[game.CurrentScene] = sc
			s.GameRepo.UpdateGame(*g)
			newData, _ := json.Marshal(g)
			m.Broadcast(newData)
			delete(s.Timers, game.GameID)
		},
		OnTick: func(passed, remained time.Duration) {
			g := s.GameRepo.GetGame(game.GameID)
			sc := g.Scenes[game.CurrentScene]
			sc.Timer -= 1
			g.Scenes[game.CurrentScene] = sc
			s.GameRepo.UpdateGame(*g)
			newData, _ := json.Marshal(g)
			m.Broadcast(newData)
		},
	})

	go s.Timers[game.GameID].Run()
	return

}

func (s *LetterboardScene) drawLetter(game *models.CountdownGameData, letterType string) {
	var letter string
	if letterType == "vowel" {
		letter = s.LettersService.DrawLetter("vowel", &game.GameID)
	} else {
		letter = s.LettersService.DrawLetter("consonant", &game.GameID)
	}

	sc := game.Scenes[game.CurrentScene]
	currentLetters := removeMatchingStrings(*sc.Letters, " ")

	if len(currentLetters) >= 9 {
		return
	}

	letters := append(currentLetters, letter)

	for i := 0; i < 8-len(currentLetters); i++ {
		letters = append(letters, " ")
	}

	sc.Letters = &letters
	sc.Board = &[][]string{*sc.Letters, models.EmptyLetters}
	game.Scenes[game.CurrentScene] = sc
	s.GameRepo.UpdateGame(*game)
}

func (s *LetterboardScene) drawLetters(game *models.CountdownGameData) {
	sc := game.Scenes[game.CurrentScene]
	currentLetters := removeMatchingStrings(*sc.Letters, " ")
	if len(currentLetters) >= 9 {
		return
	}
	letters := s.LettersService.DrawRandomLetters(9-len(currentLetters), &game.GameID)
	newLetters := append(currentLetters, letters...)
	sc.Letters = &newLetters
	sc.Board = &[][]string{*sc.Letters, models.EmptyLetters}
	game.Scenes[game.CurrentScene] = sc
	s.GameRepo.UpdateGame(*game)
}

func (s *LetterboardScene) resetGame(gameId string, sceneId string) {
	s.cancelTimer(gameId)
	g := s.GameRepo.ResetGame(gameId, sceneId)
	s.GameRepo.UpdateGame(*g)
}

func (s *LetterboardScene) solveScene(game *models.CountdownGameData) {
	sc := game.Scenes[game.CurrentScene]
	foundWords := s.WordsService.GetMatchingWordsOfLengths(strings.Join(*sc.Letters, ""), 2, 9)
	firstLine := strings.Split(fmt.Sprintf("%-9s", foundWords[0]), "")
	secondLine := strings.Split(fmt.Sprintf("%-9s", foundWords[1]), "")
	board := [][]string{firstLine, secondLine}
	sc.FoundWords = &foundWords
	sc.Board = &board
	game.Scenes[game.CurrentScene] = sc
	s.GameRepo.UpdateGame(*game)
}

func (s *LetterboardScene) submit(game *models.CountdownGameData, submissionText string, playerId string) {
	sc := game.Scenes[game.CurrentScene]
	if sc.Submissions == nil {
		sc.Submissions = make([]models.Submission, 0)
	}

	if !s.playerHasSubmitted(game, playerId) {
		now := time.Now()

		sc.Submissions = append(sc.Submissions, models.Submission{
			PlayerID:  playerId,
			Entry:     "",
			Timestamp: &now,
		})
	}
	game.Scenes[game.CurrentScene] = sc

	for i, sub := range sc.Submissions {
		if sub.PlayerID == playerId && sub.Entry != "" {
			return
		}

		if sub.PlayerID == playerId {
			s.processSubmission(game, submissionText, playerId, i)
			return
		}
	}
}

func (s *LetterboardScene) playerHasSubmitted(game *models.CountdownGameData, playerId string) bool {
	for _, sub := range game.Scenes[game.CurrentScene].Submissions {
		if sub.PlayerID == playerId {
			return true
		}
	}
	return false
}

func (s *LetterboardScene) processSubmission(game *models.CountdownGameData, submissionText string, playerId string, submissionIndex int) {
	sc := game.Scenes[game.CurrentScene]
	foundWords := s.WordsService.GetMatchingWords(strings.Join(*sc.Letters, ""))
	isCorrect := slices.Contains(foundWords, strings.ToLower(submissionText))
	now := time.Now()

	sc.Submissions[submissionIndex] = models.Submission{
		PlayerID:  playerId,
		Entry:     submissionText,
		Timestamp: &now,
		Correct:   &isCorrect,
	}

	if isCorrect {
		game = addToPlayerScore(game, playerId, len(submissionText))
	}

	game.Scenes[game.CurrentScene] = sc
	s.GameRepo.UpdateGame(*game)
}

func addToPlayerScore(game *models.CountdownGameData, playerId string, addToScore int) *models.CountdownGameData {
	for j, p := range game.Players {
		if j == playerId {
			score := 0

			if p.Score != nil {
				score = *p.Score
			}

			newScore := score + addToScore
			player := game.Players[j]
			player.Score = &newScore
			game.Players[j] = player

			break
		}
	}
	return game
}

func (s *LetterboardScene) HandleMessage(msg []byte, gameId string, playerId string, m *melody.Melody, session *melody.Session) {
	game := s.GameRepo.GetGame(gameId)

	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return
	}

	switch messageDecoded["action"].(string) {
	case "start":
		s.startTimer(game, m)
		break
	case "cancel":
		s.cancelTimer(game.GameID)
	case "draw":
		s.drawLetter(game, messageDecoded["type"].(string))
		break
	case "drawRandom":
		s.drawLetters(game)
		break
	case "reset":
		s.resetGame(game.GameID, game.CurrentScene)
		break
	case "submit":
		if messageDecoded["submission"] == nil {

			return
		}
		s.submit(game, messageDecoded["submission"].(string), playerId)
		break
	case "solve":
		s.solveScene(game)
		break
	default:
		break
	}

	return
}
