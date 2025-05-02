package services

import (
	"github.com/robbiebyrd/gameserve/models"
	"github.com/robbiebyrd/gameserve/repo"
)

type SceneService struct {
	GameRepo *repo.GameRepo
}

func NewSceneService(gameRepo *repo.GameRepo) *SceneService {
	return &SceneService{
		GameRepo: gameRepo,
	}
}

func (s *SceneService) NextScene(game *models.CountdownGameData) *models.CountdownGameData {
	sc := game.Scenes[game.CurrentScene]
	game.CurrentScene = sc.NextScene
	s.GameRepo.UpdateGame(*game)
	game = s.GameRepo.ResetGame(game.GameID, game.CurrentScene)
	s.GameRepo.UpdateGame(*game)
	game = s.GameRepo.ResetGame(game.GameID, sc.NextScene)
	s.GameRepo.UpdateGame(*game)
	return game
}
