// Package scenes provides the implementation for the Letterboard game scene.
package scenes

import (
	"encoding/json"
	"fmt"
	"slices"
	"strings"
	"time"

	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/models"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/services"
)

// timerLength is the default duration of the game timer in seconds.
var timerLength = 5

// LetterboardScene represents the state and logic for the Letterboard game scene.
type LetterboardScene struct {
	// GameRepo provides access to game data persistence.
	GameRepo *repo.GameRepo
	// LettersService manages letter distribution and drawing.
	LettersService *services.LettersService
	// Timers holds active countdown timers for each game.
	Timers map[string]*services.Countdowner
	// WordsService provides word validation and lookup functionality.
	WordsService *services.WordsService
}

// NewLetterBoardScene creates a new instance of the LetterboardScene.
// It initializes the scene with the provided dictionary path and game repository.
func NewLetterBoardScene(dictionaryPath string, gameRepo *repo.GameRepo) *LetterboardScene {
	return &LetterboardScene{
		GameRepo:       gameRepo,
		LettersService: services.NewLettersService(),
		Timers:         make(map[string]*services.Countdowner),
		WordsService:   services.NewWordsService(dictionaryPath),
	}
}

// removeMatchingStrings removes all occurrences of a given string from a slice of strings.
func removeMatchingStrings(slice []string, match string) []string {
	var result []string
	for _, str := range slice {
		if str != match {
			result = append(result, str)
		}
	}
	return result
}

// cancelTimer stops and removes the game timer for the specified game.
func (s *LetterboardScene) cancelTimer(game *models.GameData) *models.GameData {
	if s.Timers[game.GameID] != nil {
		s.Timers[game.GameID].Stop()
	}
	sc := game.Scenes[game.CurrentScene]
	sc.Timer = -1
	game.Scenes[game.CurrentScene] = sc
	return game
}

// incrementTimer adjusts the game timer by the given increment and broadcasts the updated game state.
func (s *LetterboardScene) incrementTimer(game *models.GameData, m *melody.Melody, increment int) {
	scene := game.Scenes[game.CurrentScene]
	scene.Timer = scene.Timer + increment
	game.Scenes[game.CurrentScene] = scene
	s.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	m.Broadcast(data)
}

// setTimer sets the game timer to the specified value and running state, then broadcasts the update.
func (s *LetterboardScene) setTimer(game *models.GameData, m *melody.Melody, setTime int, setRun bool) {
	scene := game.Scenes[game.CurrentScene]
	scene.Timer = setTime
	scene.TimerRun = setRun
	game.Scenes[game.CurrentScene] = scene
	s.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	m.Broadcast(data)
}

// startTimer initializes and starts the game timer for the specified game.
func (s *LetterboardScene) startTimer(game *models.GameData, m *melody.Melody) {
	s.Timers[game.GameID] = services.NewCountdowner(services.CountdownerOptions{
		Duration:       time.Duration(timerLength) * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun: func(started bool) {
			g := s.GameRepo.GetGame(game.GameID)
			s.setTimer(g, m, timerLength+1, false)
		},
		OnPaused: func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			g := s.GameRepo.GetGame(game.GameID)
			s.setTimer(g, m, -1, true)
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

// drawLetter draws a letter of the specified type (vowel or consonant) and adds it to the game board.
func (s *LetterboardScene) drawLetter(game *models.GameData, letterType string) *models.GameData {
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

// drawLetters draws random letters to fill the game board up to 9 letters.
func (s *LetterboardScene) drawLetters(game *models.GameData) *models.GameData {
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

// resetGame resets the game state for the current scene, including the timer and game data.
func (s *LetterboardScene) resetGame(game *models.GameData) *models.GameData {
	game = s.cancelTimer(game)
	return s.GameRepo.ResetGame(game, game.CurrentScene)
}

// solveScene finds the longest two words for the current letters and updates the game board.
func (s *LetterboardScene) solveScene(game *models.GameData) *models.GameData {
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

// submit processes a player's word submission, checks its validity, and updates the game state.
func (s *LetterboardScene) submit(game *models.GameData, submissionText string, playerId string) *models.GameData {
	sc := game.Scenes[game.CurrentScene]
	if sc.Submissions == nil {
		sc.Submissions = make([]models.Submission, 0)
	}

	if !s.playerHasSubmitted(game, playerId) {
		now := time.Now()

		sc.Submissions = append(sc.Submissions, models.Submission{
			PlayerID:  playerId,
			Entry:     &submissionText,
			Timestamp: &now,
		})
	}
	game.Scenes[game.CurrentScene] = sc

	for i, sub := range sc.Submissions {
		if sub.PlayerID == playerId {
			s.processSubmission(game, submissionText, playerId, i)
		}
	}

	return game
}

// playerHasSubmitted checks if a player has already submitted a word for the current round.
func (s *LetterboardScene) playerHasSubmitted(game *models.GameData, playerId string) bool {
	for _, sub := range game.Scenes[game.CurrentScene].Submissions {
		if sub.PlayerID == playerId {
			return true
		}
	}
	return false
}

// processSubmission validates a player's submission, updates their score, and persists the game state.
func (s *LetterboardScene) processSubmission(game *models.GameData, submissionText string, playerId string, submissionIndex int) {
	sc := game.Scenes[game.CurrentScene]
	foundWords := s.WordsService.GetMatchingWords(strings.Join(*sc.Letters, ""))
	isCorrect := slices.Contains(foundWords, strings.ToLower(submissionText))
	now := time.Now()

	sc.Submissions[submissionIndex] = models.Submission{
		PlayerID:  playerId,
		Entry:     &submissionText,
		Timestamp: &now,
		Correct:   &isCorrect,
	}

	if isCorrect {
		game = addToPlayerScore(game, playerId, len(submissionText))
	}

	game.Scenes[game.CurrentScene] = sc
	s.GameRepo.UpdateGame(*game)
}

// addToPlayerScore adds the given score to the specified player's total score.
func addToPlayerScore(game *models.GameData, playerId string, addToScore int) *models.GameData {
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

// HandleMessage processes incoming messages for the Letterboard scene, handling game actions and updates.
func (s *LetterboardScene) HandleMessage(game *models.GameData, msg []byte, playerId string, m *melody.Melody) *models.GameData {
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
