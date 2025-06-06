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
func (s *MathsScene) drawTarget(game *models.GameData) *models.GameData {
	number := s.NumbersRepo.DrawTarget()
	sc := game.Scenes[game.CurrentScene]
	sc.TargetNumber = &number
	game.Scenes[game.CurrentScene] = sc
	return game
}

// drawLetter draws a letter of the specified type (vowel or consonant) and adds it to the game board.
func (s *MathsScene) drawNumber(game *models.GameData, numberType string) *models.GameData {
	var number int
	if numberType == "big" {
		number = s.NumbersRepo.DrawNumber(repo.Big, &game.GameID)
	} else {
		number = s.NumbersRepo.DrawNumber(repo.Little, &game.GameID)
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
func (s *MathsScene) drawNumbers(game *models.GameData) *models.GameData {
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

	numbers := s.NumbersRepo.DrawRandomNumbers(6-len(currentNumbers), &game.GameID)
	newNumbers := append(currentNumbers, numbers...)
	sc.Numbers = &newNumbers
	game.Scenes[game.CurrentScene] = sc
	return game
}

func (c *MathsScene) startMathsTimer(game *models.GameData, m *melody.Melody) *models.GameData {

	// timerLength is the default duration of the game timer in seconds.
	envVars := repo.LoadEnvVars()
	timerLength, _ := strconv.Atoi(envVars.TimerLength)

	c.GameScene.StartTimer(game, m, timerLength, func(updatedGame *models.GameData) {
		sc := updatedGame.Scenes[updatedGame.CurrentScene]
		updatedGame.Scenes[updatedGame.CurrentScene] = sc
		c.GameScene.GameRepo.UpdateGame(*updatedGame)
	})

	return game
}

func (c *MathsScene) resetMaths(game *models.GameData) *models.GameData {
	game = c.GameScene.CancelTimer(game)
	return c.GameScene.GameRepo.ResetGame(game, game.CurrentScene)
}

type numberFreq map[int]int

func (c *MathsScene) getNumbersFrequencies(numbers []int) map[int]int {
	numbersFreq := make(numberFreq)

	for _, num := range numbers {
		numbersFreq[num] += 1
	}
	return numbersFreq
}

func (c *MathsScene) getNumbersFromFormula(formula string) []int {
	re := regexp.MustCompile(`\D+`)
	var submissionNumbers = []int{}
	for _, i := range strings.Split(re.ReplaceAllString(formula, ","), ",") {
		j, err := strconv.Atoi(i)
		if err != nil {
			panic(err)
		}
		submissionNumbers = append(submissionNumbers, j)
	}
	return submissionNumbers
}

// processMathsSubmission validates a player's submission, updates their score, and persists the game state.
func (s *MathsScene) processMathsSubmission(game *models.GameData, submissionText string, isCorrect bool, scoreToAdd int, playerId string) {
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
		game = s.GameScene.AddToPlayerScore(game, playerId, scoreToAdd)
	}

	s.GameScene.GameRepo.UpdateGame(*game)
}

func (c *MathsScene) submitMaths(game *models.GameData, submissionText string, playerId string) *models.GameData {
	sc := game.Scenes[game.CurrentScene]

	if submissionText == "" || c.GameScene.HasPlayerSubmitted(game, playerId) {
		return game
	}

	isCorrect := false
	submissionNumbers := c.getNumbersFromFormula(submissionText)
	submissionFreq := c.getNumbersFrequencies(submissionNumbers)
	lettersFreq := c.getNumbersFrequencies(*sc.Numbers)

	isOverUsed := false

	for _, s := range submissionFreq {
		_, ok := lettersFreq[s]
		if !ok {
			isOverUsed = true
			break
		}
		if lettersFreq[s] < submissionFreq[s] {
			isOverUsed = true
			break
		}
	}

	var submissionSolved float64
	t, v, err := gee.Eval(submissionText)

	if err != nil || v == nil || t != 0 {
		v = 0.0
	}

	submissionSolved = v.(float64)
	intPart, decimalPart := math.Modf(submissionSolved)
	difference := math.Abs(submissionSolved - float64(*sc.TargetNumber))

	// Logic check for if the answer is correct
	if decimalPart == 0.0 && difference < 10 && len(submissionNumbers) < 6 && isOverUsed != true {
		isCorrect = true
	}

	scoreToAdd := int(10 - intPart)

	submissionFormatted := submissionText + " = " + strconv.FormatFloat(intPart, 'f', 0, 64)
	c.processMathsSubmission(game, submissionFormatted, isCorrect, scoreToAdd, playerId)

	return game
}

func (c *MathsScene) HandleMathsMessage(game *models.GameData, msg []byte, playerId string, m *melody.Melody) *models.GameData {
	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return game
	}

	switch messageDecoded["action"].(string) {
	case "start":
		game = c.startMathsTimer(game, m)
	case "cancel":
		game = c.GameScene.CancelTimer(game)
	case "draw":
		game = c.drawNumber(game, messageDecoded["type"].(string))
	case "target":
		game = c.drawTarget(game)
	case "drawRandom":
		c.drawNumbers(game)
	case "reset":
		game = c.resetMaths(game)
	case "submit":
		if messageDecoded["submission"] == nil {
			return game
		}
		game = c.submitMaths(game, messageDecoded["submission"].(string), playerId)
	default:
		break
	}

	return game
}
