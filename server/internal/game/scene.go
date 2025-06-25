package services

import (
	"github.com/robbiebyrd/aye-aye/internal/models"
	"github.com/robbiebyrd/aye-aye/internal/repo"
)

type SceneService struct {
	GameRepo *repo.GameRepo
}

// NewSceneService creates a new Scene Service
func NewSceneService(gameRepo *repo.GameRepo) *SceneService {
	return &SceneService{
		GameRepo: gameRepo,
	}
}

// NextScene moves to the next scene as specified by the NextScene property of the current Scene.
func (s *SceneService) NextScene(game *models.GameData) *models.GameData {
	sc := game.Scenes[game.CurrentScene]
	game = s.GameRepo.ResetGame(game, game.CurrentScene)
	game.CurrentScene = sc.NextScene
	game = s.GameRepo.ResetGame(game, sc.NextScene)

	if sc.NextTeam != nil {
		game.ControllingTeam = sc.NextTeam
	} else {
		for _, team := range game.Players {
			if *game.ControllingTeam != team.Team {
				game.ControllingTeam = &team.Team
			}
			break
		}
	}

	return game
}
