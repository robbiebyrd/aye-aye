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

var timerLength = 30

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

func (s *LetterboardScene) cancelTimer(game *models.CountdownGameData) *models.CountdownGameData {
	if s.Timers[game.GameID] != nil {
		s.Timers[game.GameID].Stop()
	}
	sc := game.Scenes[game.CurrentScene]
	sc.Timer = -1
	game.Scenes[game.CurrentScene] = sc
	return game
}

func (s *LetterboardScene) incrementTimer(game *models.CountdownGameData, m *melody.Melody, increment int) {
	dataBefore, _ := json.Marshal(game)
	scene := game.Scenes[game.CurrentScene]
	scene.Timer = scene.Timer + increment
	game.Scenes[game.CurrentScene] = scene
	s.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	fmt.Println(services.GetPatch(dataBefore, data))
	m.Broadcast(data)
}

func (s *LetterboardScene) setTimer(game *models.CountdownGameData, m *melody.Melody, setTime int) {
	dataBefore, _ := json.Marshal(game)
	scene := game.Scenes[game.CurrentScene]
	scene.Timer = setTime
	game.Scenes[game.CurrentScene] = scene
	s.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	fmt.Println(services.GetPatch(dataBefore, data))
	m.Broadcast(data)
}

func (s *LetterboardScene) startTimer(game *models.CountdownGameData, m *melody.Melody) {
	s.Timers[game.GameID] = services.NewCountdowner(services.CountdownerOptions{
		Duration:       time.Duration(timerLength) * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun: func(started bool) {
			g := s.GameRepo.GetGame(game.GameID)
			s.setTimer(g, m, timerLength+1)
		},
		OnPaused: func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			g := s.GameRepo.GetGame(game.GameID)
			s.setTimer(g, m, -1)
			delete(s.Timers, game.GameID)
		},
		OnTick: func(passed, remained time.Duration) {
			g := s.GameRepo.GetGame(game.GameID)
			s.incrementTimer(g, m, -1)
		},
	})
	go s.Timers[game.GameID].Run()
	return
}

func (s *LetterboardScene) drawLetter(game *models.CountdownGameData, letterType string) *models.CountdownGameData {
	var letter string
	if letterType == "vowel" {
		letter = s.LettersService.DrawLetter("vowel", &game.GameID)
	} else {
		letter = s.LettersService.DrawLetter("consonant", &game.GameID)
	}

	sc := game.Scenes[game.CurrentScene]
	currentLetters := removeMatchingStrings(*sc.Letters, " ")

	if len(currentLetters) >= 9 {
		return game
	}

	letters := append(currentLetters, letter)

	for i := 0; i < 8-len(currentLetters); i++ {
		letters = append(letters, " ")
	}

	sc.Letters = &letters
	sc.Board = &[][]string{*sc.Letters, models.EmptyLetters}
	game.Scenes[game.CurrentScene] = sc
	return game
}

func (s *LetterboardScene) drawLetters(game *models.CountdownGameData) *models.CountdownGameData {
	sc := game.Scenes[game.CurrentScene]
	currentLetters := removeMatchingStrings(*sc.Letters, " ")
	if len(currentLetters) >= 9 {
		return game
	}
	letters := s.LettersService.DrawRandomLetters(9-len(currentLetters), &game.GameID)
	newLetters := append(currentLetters, letters...)
	sc.Letters = &newLetters
	sc.Board = &[][]string{*sc.Letters, models.EmptyLetters}
	game.Scenes[game.CurrentScene] = sc
	return game
}

func (s *LetterboardScene) resetGame(game *models.CountdownGameData) *models.CountdownGameData {
	game = s.cancelTimer(game)
	return s.GameRepo.ResetGame(game.GameID, game.CurrentScene)
}

func (s *LetterboardScene) solveScene(game *models.CountdownGameData) *models.CountdownGameData {
	sc := game.Scenes[game.CurrentScene]
	foundWords := s.WordsService.GetMatchingWordsOfLengths(strings.Join(*sc.Letters, ""), 2, 9)
	firstLine := strings.Split(fmt.Sprintf("%-9s", foundWords[0]), "")
	secondLine := strings.Split(fmt.Sprintf("%-9s", foundWords[1]), "")
	board := [][]string{firstLine, secondLine}
	sc.FoundWords = &foundWords
	sc.Board = &board
	game.Scenes[game.CurrentScene] = sc
	return game
}

func (s *LetterboardScene) submit(game *models.CountdownGameData, submissionText string, playerId string) *models.CountdownGameData {
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
			return game
		}

		if sub.PlayerID == playerId {
			s.processSubmission(game, submissionText, playerId, i)
		}
	}

	return game
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

func (s *LetterboardScene) HandleMessage(game *models.CountdownGameData, msg []byte, playerId string, m *melody.Melody, session *melody.Session) *models.CountdownGameData {
	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return game
	}

	switch messageDecoded["action"].(string) {
	case "start":
		s.startTimer(game, m)
		break
	case "cancel":
		game = s.cancelTimer(game)
	case "draw":
		game = s.drawLetter(game, messageDecoded["type"].(string))
		break
	case "drawRandom":
		s.drawLetters(game)
		break
	case "reset":
		game = s.resetGame(game)
		break
	case "submit":
		if messageDecoded["submission"] == nil {
			return game
		}
		game = s.submit(game, messageDecoded["submission"].(string), playerId)
		break
	case "solve":
		game = s.solveScene(game)
		break
	default:
		break
	}

	return game
}
