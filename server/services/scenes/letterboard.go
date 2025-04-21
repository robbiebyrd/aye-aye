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
	TimerChannels  map[string]*services.Countdowner
	WordsService   *services.WordsService
}

func NewLetterBoardScene() *LetterboardScene {
	return &LetterboardScene{
		GameRepo:       repo.NewGameRepo(),
		LettersService: services.NewLettersService(),
		TimerChannels:  make(map[string]*services.Countdowner),
		WordsService:   services.NewWordsService("./data/words.txt"),
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

	if s.TimerChannels[gameId] != nil {
		s.TimerChannels[gameId].Stop()
	}
	g := s.GameRepo.GetGame(gameId)
	g.SceneData.Timer = -1
	s.GameRepo.UpdateGame(*g)
}

func (s *LetterboardScene) startTimer(game *models.CountdownGameData, m *melody.Melody) {
	previousData, _ := json.Marshal(game)
	game.SceneData.Timer = timerLength + 1
	s.GameRepo.UpdateGame(*game)
	newData, _ := json.Marshal(game)
	fmt.Println(services.GetPatch(previousData, newData))
	m.Broadcast(newData)

	s.TimerChannels[game.GameID] = services.NewCountdowner(services.CountdownerOptions{
		Duration:       time.Duration(timerLength) * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun:          func(started bool) {},
		OnPaused:       func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			g := s.GameRepo.GetGame(game.GameID)
			previousData, _ := json.Marshal(g)
			g.SceneData.Timer -= 1
			s.GameRepo.UpdateGame(*g)
			newData, _ := json.Marshal(g)
			fmt.Println(services.GetPatch(previousData, newData))
			m.Broadcast(newData)
		},
		OnTick: func(passed, remained time.Duration) {
			g := s.GameRepo.GetGame(game.GameID)
			previousData, _ := json.Marshal(g)
			g.SceneData.Timer -= 1
			s.GameRepo.UpdateGame(*g)
			newData, _ := json.Marshal(g)
			fmt.Println(services.GetPatch(previousData, newData))
			m.Broadcast(newData)
		},
	})

	go s.TimerChannels[game.GameID].Run()
	return

}

func (s *LetterboardScene) drawLetter(game *models.CountdownGameData, letterType string) {
	var letter string
	if letterType == "vowel" {
		letter = s.LettersService.DrawLetter("vowel", &game.GameID)
	} else {
		letter = s.LettersService.DrawLetter("consonant", &game.GameID)
	}

	currentLetters := removeMatchingStrings(game.SceneData.Letters, " ")

	if len(currentLetters) >= 9 {
		return
	}

	letters := append(currentLetters, letter)

	for i := 0; i < 8-len(currentLetters); i++ {
		letters = append(letters, " ")
	}

	game.SceneData.Letters = letters
	game.SceneData.Board = [][]string{game.SceneData.Letters, models.EmptyLetters}
	s.GameRepo.UpdateGame(*game)
}

func (s *LetterboardScene) drawLetters(game *models.CountdownGameData) {
	currentLetters := removeMatchingStrings(game.SceneData.Letters, " ")
	if len(currentLetters) >= 9 {
		return
	}
	letters := s.LettersService.DrawRandomLetters(9-len(currentLetters), &game.GameID)
	newLetters := append(currentLetters, letters...)
	game.SceneData.Letters = newLetters
	game.SceneData.Board = [][]string{game.SceneData.Letters, models.EmptyLetters}
	s.GameRepo.UpdateGame(*game)
}

func (s *LetterboardScene) resetGame(gameId string) {
	s.cancelTimer(gameId)
	resetGame := s.GameRepo.ResetGame(gameId)
	s.GameRepo.UpdateGame(*resetGame)
}

func (s *LetterboardScene) solveScene(game *models.CountdownGameData) {
	game.SceneData.FoundWords = s.WordsService.GetMatchingWordsOfLengths(strings.Join(game.SceneData.Letters, ""), 2, 9)
	firstLine := strings.Split(fmt.Sprintf("%-9s", game.SceneData.FoundWords[0]), "")
	secondLine := strings.Split(fmt.Sprintf("%-9s", game.SceneData.FoundWords[1]), "")
	board := [][]string{firstLine, secondLine}
	game.SceneData.Board = board
	s.GameRepo.UpdateGame(*game)
}

func (s *LetterboardScene) submit(game *models.CountdownGameData, submissionText string, playerId string) {
	if game.SceneData.Submissions == nil {
		game.SceneData.Submissions = make([]models.CountdownGameDataSceneSubmissions, 0)
	}

	for i, sub := range game.SceneData.Submissions {
		if sub.PlayerId == playerId && sub.Entry != "" {
			return // Player already submitted
		}
		if sub.PlayerId == playerId {
			foundWords := s.WordsService.GetMatchingWords(strings.Join(game.SceneData.Letters, ""))
			isCorrect := slices.Contains(foundWords, strings.ToLower(submissionText))

			game.SceneData.Submissions[i] = models.CountdownGameDataSceneSubmissions{
				PlayerId: playerId,
				Entry:    submissionText,
				Total:    "",
				Correct:  &isCorrect,
			}

			if isCorrect {
				for j, p := range game.Players {
					if p.ID == playerId {
						score := 0
						if p.Score != nil {
							score = *p.Score
						}
						submissionLength := score + len(submissionText)
						game.Players[j].Score = &submissionLength
						break
					}
				}
			}
			s.GameRepo.UpdateGame(*game)

			return
		}

	}
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
		s.resetGame(game.GameID)
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
