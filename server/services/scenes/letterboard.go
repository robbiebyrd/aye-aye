package scenes

import (
	"encoding/json"
	"fmt"
	"github.com/olahol/melody"
	"github.com/robbiebyrd/gameserve/models"
	"github.com/robbiebyrd/gameserve/repo"
	"github.com/robbiebyrd/gameserve/services"
	"github.com/robbiebyrd/gameserve/services/timer"
	"log"
	"slices"
	"strings"
	"time"
)

type LetterBoardScene struct {
	GameRepo       *repo.GameRepo
	PlayerRepo     *repo.PlayerRepo
	LettersService *services.LettersService
}

func NewLetterBoardScene() *LetterBoardScene {
	return &LetterBoardScene{
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

func (s *LetterBoardScene) drawLetter(game *models.CountdownGameData, letterType string) {
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

func (s *LetterBoardScene) drawLetters(game *models.CountdownGameData) {
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

func (s *LetterBoardScene) HandleMessage(msg []byte, gameId string, playerId string, wordsService *services.WordsService, m *melody.Melody) {
	game := s.GameRepo.GetGame(gameId)

	var messageDecoded map[string]interface{}
	_ = json.Unmarshal(msg, &messageDecoded)

	if messageDecoded["action"] == nil {
		return
	}

	switch messageDecoded["action"].(string) {
	case "start":
		game.SceneData.Timer = 6
		s.GameRepo.UpdateGame(*game)
		data, _ := json.Marshal(game)
		m.Broadcast(data)

		var finish = make(chan bool, 1)

		t := timer.New(timer.Options{
			Duration:       5 * time.Second,
			TickerInternal: 1 * time.Second,
			OnRun: func(started bool) {
				if started {
					log.Printf("started: %v", time.Now())
				} else {
					log.Printf("resumed: %v", time.Now())
				}
			},
			OnPaused: func(passed, remained time.Duration) {
				log.Printf("paused (passed=%v, remaining=%v)", passed, remained)
			},
			OnDone: func(stopped bool) {
				log.Printf("finish: %v (stopped=%v)", time.Now(), stopped)
				g := s.GameRepo.GetGame(gameId)
				g.SceneData.Timer -= 1
				fmt.Print(g.SceneData.Timer)
				s.GameRepo.UpdateGame(*g)
				data, _ := json.Marshal(g)
				m.Broadcast(data)
				finish <- true
			},
			OnTick: func(passed, remained time.Duration) {
				g := s.GameRepo.GetGame(gameId)
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

		// start in goroutine to prevent blocking of current
		go t.Run()

		go func() {
			//time.Sleep(100 * time.Millisecond)
			//t.Pause()
			//time.Sleep(100 * time.Millisecond)
			t.Run()
		}()

		select {
		case <-finish:
		}

		//ticker := time.NewTicker(1 * time.Second)
		//go func() {
		//	for {
		//		select {
		//		case <-ticker.C:
		//			g := s.GameRepo.GetGame(gameId)
		//			g.SceneData.Timer -= 1
		//			fmt.Print(g.SceneData.Timer)
		//			s.GameRepo.UpdateGame(*g)
		//			data, _ := json.Marshal(g)
		//			m.Broadcast(data)
		//
		//			if game.SceneData.Timer < 0 {
		//				ticker.Stop()
		//				return
		//			}
		//		}
		//	}
		//}()
		break
	case "draw":
		s.drawLetter(game, messageDecoded["type"].(string))
		break
	case "drawRandom":
		s.drawLetters(game)
		break
	case "reset":
		s.GameRepo.ResetGame(gameId)
		break
	case "submit":
		if messageDecoded["submission"] == nil {

			return
		}

		submissionText := messageDecoded["submission"].(string)
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

		break
	case "solve":
		game.SceneData.FoundWords = wordsService.GetMatchingWordsOfLengths(strings.Join(game.SceneData.Letters, ""), 2, 9)
		firstLine := strings.Split(fmt.Sprintf("%-9s", game.SceneData.FoundWords[0]), "")
		secondLine := strings.Split(fmt.Sprintf("%-9s", game.SceneData.FoundWords[1]), "")
		board := [][]string{firstLine, secondLine}
		game.SceneData.Board = board
		s.GameRepo.UpdateGame(*game)
		break
	default:
		break
	}

	return
}
