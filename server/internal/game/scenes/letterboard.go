package scenes

import (
	"encoding/json"
	"fmt"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/olahol/melody"
	services "github.com/robbiebyrd/aye-aye/internal/game"
	"github.com/robbiebyrd/aye-aye/internal/models"
	"github.com/robbiebyrd/aye-aye/internal/repo"
)

// LetterboardScene represents the state and logic for the Letterboard game scene.
type LetterboardScene struct {
	// GameScene provides access to game data persistence and timers.
	GameScene *GameScene
	// LettersService manages letter distribution and drawing.
	LettersService *services.LettersService
	// Timers holds active countdown timers for each game.
	Timers map[string]*services.Countdowner
	// WordsService provides word validation and lookup functionality.
	WordsService *repo.WordsRepo
}

// NewLetterBoardScene creates a new instance of the LetterboardScene.
// It initializes the scene with the provided dictionary path and game repository.
func NewLetterBoardScene(dictionaryPath string, pickType services.LetterPickType, gameRepo *repo.GameRepo) *LetterboardScene {
	return &LetterboardScene{
		GameScene:      NewGameScene(gameRepo),
		LettersService: services.NewLettersService(pickType),
		Timers:         make(map[string]*services.Countdowner),
		WordsService:   repo.NewWordsRepo(dictionaryPath),
	}
}

// removeMatchingItemsFromArray removes all occurrences of a given string from a slice of strings.
func removeMatchingItemsFromArray(slice []string, match string) []string {
	var result []string
	for _, str := range slice {
		if str != match {
			result = append(result, str)
		}
	}
	return result
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
	currentLetters := removeMatchingItemsFromArray(*sc.Letters, " ")

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
	currentLetters := removeMatchingItemsFromArray(*sc.Letters, " ")
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
	game = s.GameScene.CancelTimer(game)
	return s.GameScene.GameRepo.ResetGame(game, game.CurrentScene)
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
		sc.Submissions = map[string]models.Submission{}
	}

	if !s.GameScene.HasPlayerSubmitted(game, playerId) {
		now := time.Now()

		sc.Submissions[playerId] = models.Submission{
			PlayerID:  playerId,
			Entry:     &submissionText,
			Timestamp: &now,
		}
	}
	game.Scenes[game.CurrentScene] = sc

	s.processSubmission(game, submissionText, playerId)

	return game
}

// processSubmission validates a player's submission, updates their score, and persists the game state.
func (s *LetterboardScene) processSubmission(game *models.GameData, submissionText string, playerId string) {
	sc := game.Scenes[game.CurrentScene]
	foundWords := s.WordsService.GetMatchingWords(strings.Join(*sc.Letters, ""))
	isCorrect := slices.Contains(foundWords, strings.ToLower(submissionText))
	now := time.Now()

	sc.Submissions[playerId] = models.Submission{
		PlayerID:  playerId,
		Entry:     &submissionText,
		Timestamp: &now,
		Correct:   &isCorrect,
	}
	game.Scenes[game.CurrentScene] = sc

	if isCorrect {
		game = s.GameScene.AddToPlayerScore(game, playerId, len(submissionText))
	}

	s.GameScene.GameRepo.UpdateGame(*game)
}

// HandleMessage processes incoming messages for the Letterboard scene, handling game actions and updates.
func (s *LetterboardScene) HandleMessage(game *models.GameData, msg []byte, playerId string, m *melody.Melody) *models.GameData {
	// timerLength is the default duration of the game timer in seconds.
	envVars := repo.LoadEnvVars()
	timerLength, _ := strconv.Atoi(envVars.TimerLength)

	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return game
	}

	switch messageDecoded["action"].(string) {
	case "start":
		s.GameScene.StartTimer(game, m, timerLength, func(updatedGame *models.GameData) {})
		break
	case "cancel":
		game = s.GameScene.CancelTimer(game)
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
