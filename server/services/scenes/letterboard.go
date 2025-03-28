package scenes

import (
	"encoding/json"
	"fmt"
	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/models"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/services"
	"log"
	"slices"
	"strings"
	"time"
)

type LetterboardScene struct {
	GameRepo       *repo.GameRepo
	PlayerRepo     *repo.PlayerRepo
	LettersService *services.LettersService
}

func NewLetterBoardScene() *LetterboardScene {
	return &LetterboardScene{
		GameRepo:       repo.NewGameRepo(),
		PlayerRepo:     repo.NewPlayerRepo(),
		LettersService: services.NewLettersService(),
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

func (s *LetterboardScene) startScene(game *models.CountdownGameData, session *melody.Session, m *melody.Melody) {
	game.SceneData.Timer = 31
	s.GameRepo.UpdateGame(*game)
	data, _ := json.Marshal(game)
	m.Broadcast(data)

	var finish = make(chan bool, 1)

	t := services.New(services.Options{
		Duration:       30 * time.Second,
		TickerInternal: 1 * time.Second,
		OnRun:          func(started bool) {},
		OnPaused:       func(passed, remained time.Duration) {},
		OnDone: func(stopped bool) {
			log.Printf("finish: %v (stopped=%v)", time.Now(), stopped)
			g := s.GameRepo.GetGame(game.GameID)
			g.SceneData.Timer -= 1
			fmt.Print(g.SceneData.Timer)
			s.GameRepo.UpdateGame(*g)
			data, _ := json.Marshal(g)
			m.Broadcast(data)

			finish <- true
		},
		OnTick: func(passed, remained time.Duration) {
			g := s.GameRepo.GetGame(game.GameID)
			g.SceneData.Timer -= 1
			fmt.Print(g.SceneData.Timer)
			s.GameRepo.UpdateGame(*g)
			data, _ := json.Marshal(g)
			m.Broadcast(data)

			if game.SceneData.Timer < 0 {
				finish <- true
			}

		},
	})

	// startScene in goroutine to prevent blocking of current
	go t.Run()
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

func (s *LetterboardScene) resetGame(game *models.CountdownGameData) {
	s.GameRepo.ResetGame(game.GameID)
}

func (s *LetterboardScene) solveScene(game *models.CountdownGameData, wordsService *services.WordsService) {
	game.SceneData.FoundWords = wordsService.GetMatchingWordsOfLengths(strings.Join(game.SceneData.Letters, ""), 2, 9)
	firstLine := strings.Split(fmt.Sprintf("%-9s", game.SceneData.FoundWords[0]), "")
	secondLine := strings.Split(fmt.Sprintf("%-9s", game.SceneData.FoundWords[1]), "")
	board := [][]string{firstLine, secondLine}
	game.SceneData.Board = board
	s.GameRepo.UpdateGame(*game)
}

func (s *LetterboardScene) submit(game *models.CountdownGameData, submissionText string, playerId string, wordsService *services.WordsService) {
	submissionIndex := -1

	submission := models.CountdownGameDataSceneSubmissions{
		PlayerId: playerId,
		Entry:    "",
		Total:    "",
	}

	for i, p := range game.SceneData.Submissions {
		if p.PlayerId == playerId {
			submissionIndex = i
			submission = game.SceneData.Submissions[submissionIndex]
			break
		}
	}

	submission.Entry = submissionText

	foundWords := wordsService.GetMatchingWords(strings.Join(game.SceneData.Letters, ""))
	submission.Correct = slices.Contains(foundWords, submissionText)

	if submission.Correct {
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
	s.GameRepo.UpdateGame(*game)

}

func (s *LetterboardScene) HandleMessage(msg []byte, gameId string, playerId string, wordsService *services.WordsService, m *melody.Melody, session *melody.Session) {
	game := s.GameRepo.GetGame(gameId)

	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return
	}

	switch messageDecoded["action"].(string) {
	case "start":
		s.startScene(game, session, m)
		break
	case "draw":
		s.drawLetter(game, messageDecoded["type"].(string))
		break
	case "drawRandom":
		s.drawLetters(game)
		break
	case "reset":
		s.resetGame(game)
		break
	case "submit":
		if messageDecoded["submission"] == nil {

			return
		}
		s.submit(game, messageDecoded["submission"].(string), playerId, wordsService)
		break
	case "solve":
		s.solveScene(game, wordsService)
		break
	default:
		break
	}

	return
}
