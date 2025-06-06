package scenes

import (
	"encoding/json"
	"math"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/0x3alex/gee"
	"github.com/olahol/melody"

	"github.com/robbiebyrd/aye-aye/internal/models"
	"github.com/robbiebyrd/aye-aye/internal/repo"
)

type MathsScene struct {
	NumbersRepo *repo.NumbersRepo
	GameScene   *GameScene
}

func NewMathsScene(gameRepo *repo.GameRepo) *MathsScene {
	return &MathsScene{
		NumbersRepo: repo.NewNumbersRepo(repo.NumberPickDeck),
		GameScene:   NewGameScene(gameRepo),
	}
}

// drawTarget draws a letter of the specified type (vowel or consonant) and adds it to the game board.
func (r *MathsScene) drawTarget(game *models.GameData) *models.GameData {
	number := r.NumbersRepo.DrawTarget()
	sc := game.Scenes[game.CurrentScene]
	sc.TargetNumber = &number
	game.Scenes[game.CurrentScene] = sc
	return game
}

// drawLetter draws a letter of the specified type (vowel or consonant) and adds it to the game board.
func (r *MathsScene) drawNumber(game *models.GameData, numberType string) *models.GameData {
	var number int
	if numberType == "big" {
		number = r.NumbersRepo.DrawNumber(repo.Big, &game.GameID)
	} else {
		number = r.NumbersRepo.DrawNumber(repo.Little, &game.GameID)
	}

	sc := game.Scenes[game.CurrentScene]
	var currentNumbers []int
	for _, num := range *sc.Numbers {
		if num != 0 {
			currentNumbers = append(currentNumbers, num)
		}
	}

	if len(currentNumbers) > 6 {
		return game
	}

	numbers := append(currentNumbers, number)

	sc.Numbers = &numbers
	game.Scenes[game.CurrentScene] = sc
	return game
}

// drawNumbers draws random letters to fill the game board up to 9 letters.
func (r *MathsScene) drawNumbers(game *models.GameData) *models.GameData {
	sc := game.Scenes[game.CurrentScene]
	var currentNumbers []int
	for _, num := range *sc.Numbers {
		if num != 0 {
			currentNumbers = append(currentNumbers, num)
		}
	}
	if len(currentNumbers) > 6 {
		return game
	}

	numbers := r.NumbersRepo.DrawRandomNumbers(6-len(currentNumbers), &game.GameID)
	newNumbers := append(currentNumbers, numbers...)
	sc.Numbers = &newNumbers
	game.Scenes[game.CurrentScene] = sc
	return game
}

func (r *MathsScene) startMathsTimer(game *models.GameData, m *melody.Melody) *models.GameData {

	// timerLength is the default duration of the game timer in seconds.
	envVars := repo.LoadEnvVars()
	timerLength, _ := strconv.Atoi(envVars.TimerLength)

	r.GameScene.StartTimer(game, m, timerLength, func(updatedGame *models.GameData) {
		sc := updatedGame.Scenes[updatedGame.CurrentScene]
		updatedGame.Scenes[updatedGame.CurrentScene] = sc
		r.GameScene.GameRepo.UpdateGame(*updatedGame)
	})

	return game
}

func (r *MathsScene) resetMaths(game *models.GameData) *models.GameData {
	game = r.GameScene.CancelTimer(game)
	return r.GameScene.GameRepo.ResetGame(game, game.CurrentScene)
}

type numberFreq map[int]int

func (r *MathsScene) getNumbersFrequencies(numbers []int) map[int]int {
	numbersFreq := make(numberFreq)

	for _, num := range numbers {
		numbersFreq[num] += 1
	}
	return numbersFreq
}

func (r *MathsScene) getNumbersFromFormula(formula string) []int {
	re := regexp.MustCompile(`\D+`)
	var submissionNumbers = []int{}
	for _, i := range strings.Split(re.ReplaceAllString(formula, ","), ",") {
		j, _ := strconv.Atoi(i)
		if j != 0 {
			submissionNumbers = append(submissionNumbers, j)
		}
	}
	return submissionNumbers
}

// processMathsSubmission validates a player's submission, updates their score, and persists the game state.
func (r *MathsScene) processMathsSubmission(game *models.GameData, submissionText string, isCorrect bool, scoreToAdd int, playerId string) {
	sc := game.Scenes[game.CurrentScene]

	now := time.Now()

	sc.Submissions[playerId] = models.Submission{
		PlayerID:  playerId,
		Entry:     &submissionText,
		Timestamp: &now,
		Correct:   &isCorrect,
	}
	game.Scenes[game.CurrentScene] = sc

	if isCorrect {
		game = r.GameScene.AddToPlayerScore(game, playerId, scoreToAdd)
	}

	r.GameScene.GameRepo.UpdateGame(*game)
}

func (r *MathsScene) checkForNumberOveruse(submissionNumbers []int, sceneNumbers []int) bool {
	submissionFreq := r.getNumbersFrequencies(submissionNumbers)
	lettersFreq := r.getNumbersFrequencies(sceneNumbers)

	if len(submissionFreq) > len(lettersFreq) {
		return true
	}

	for _, s := range submissionFreq {
		_, ok := lettersFreq[s]
		if !ok {
			return true
		}
		if lettersFreq[s] < submissionFreq[s] {
			return true
		}
	}

	return false
}

func (r *MathsScene) solveMathsEquation(submissionText string) float64 {
	t, v, err := gee.Eval(submissionText)
	if err != nil || v == nil || t != 0 {
		return 0.0
	}
	return v.(float64)
}

func (r *MathsScene) submitMaths(game *models.GameData, submissionText string, playerId string) *models.GameData {
	sc := game.Scenes[game.CurrentScene]

	if submissionText == "" || r.GameScene.HasPlayerSubmitted(game, playerId) {
		return game
	}

	isCorrect := false
	submissionNumbers := r.getNumbersFromFormula(submissionText)

	isOverUsed := r.checkForNumberOveruse(submissionNumbers, *sc.Numbers)

	submissionSolved := r.solveMathsEquation(submissionText)

	intPart, decimalPart := math.Modf(submissionSolved)
	difference := math.Abs(submissionSolved - float64(*sc.TargetNumber))

	// Logic check for if the answer is correct
	if decimalPart == 0.0 && difference < 10 && isOverUsed != true {
		isCorrect = true
	}

	scoreToAdd := int(10 - difference)

	submissionFormatted := strconv.FormatFloat(intPart, 'f', 0, 64)
	r.processMathsSubmission(game, submissionFormatted, isCorrect, scoreToAdd, playerId)

	return game
}

func (r *MathsScene) HandleMathsMessage(game *models.GameData, msg []byte, playerId string, m *melody.Melody) *models.GameData {
	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return game
	}

	switch messageDecoded["action"].(string) {
	case "start":
		game = r.startMathsTimer(game, m)
	case "cancel":
		game = r.GameScene.CancelTimer(game)
	case "draw":
		game = r.drawNumber(game, messageDecoded["type"].(string))
	case "target":
		game = r.drawTarget(game)
	case "drawRandom":
		r.drawNumbers(game)
	case "reset":
		game = r.resetMaths(game)
	case "submit":
		if messageDecoded["submission"] == nil {
			return game
		}
		game = r.submitMaths(game, messageDecoded["submission"].(string), playerId)
	default:
		break
	}

	return game
}
