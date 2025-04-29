package services

import (
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

func (s *SceneService) NextScene(gameId string) {
	g := s.GameRepo.GetGame(gameId)
	sc := g.Scenes[g.CurrentScene]
	g.CurrentScene = sc.NextScene
	s.GameRepo.UpdateGame(*g)
	g = s.GameRepo.ResetGame(gameId, g.CurrentScene)
	s.GameRepo.UpdateGame(*g)
	g = s.GameRepo.ResetGame(gameId, sc.NextScene)
	s.GameRepo.UpdateGame(*g)
	return
}
