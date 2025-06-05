package repo

import (
	"math/rand"
	"time"
)

type NumberPickType string

var largeNumbers = []int{25, 50, 75, 100}
var smallNumbers = []int{1, 2, 3, 4, 5, 6, 7, 8, 9}
var repeatFrequency = 5
var maxTarget = 999
var minTarget = 101

const (
	NumberPickDeck   NumberPickType = "deck"
	NumberPickRandom NumberPickType = "random"
)

var defaultNumberTypeFrequencies = map[string]int{"big": 2, "little": 4}

type NumbersRepo struct {
	Rng                   *rand.Rand
	PickType              NumberPickType
	BigNumberDecks        map[string][]int
	LittleNumberDecks     map[string][]int
	NumberTypeFrequencies map[string]int
}

func NewNumbersRepo(pickType NumberPickType) *NumbersRepo {
	return &NumbersRepo{
		Rng:                   rand.New(rand.NewSource(time.Now().UnixNano())),
		PickType:              pickType,
		LittleNumberDecks:     map[string][]int{},
		BigNumberDecks:        map[string][]int{},
		NumberTypeFrequencies: defaultNumberTypeFrequencies,
	}
}

type NumberType string

const (
	Big    NumberType = "big"
	Little NumberType = "little"
)

func (s *NumbersRepo) generateNumbersDeck(numbers []int, frequency int) []int {
	deck := []int{}
	for i := 1; i < frequency; i++ {
		for j := 0; j < len(numbers); j++ {
			deck = append(deck, numbers[j])
		}
	}
	s.Rng.Shuffle(len(deck), func(i, j int) {
		deck[i], deck[j] = deck[j], deck[i]
	})

	return deck
}

func (s *NumbersRepo) createNumbersDecks(gameId string) {
	// Add 5 "copies" of each number from 1-9
	littleDeck := s.generateNumbersDeck(smallNumbers, repeatFrequency)
	largeDeck := s.generateNumbersDeck(largeNumbers, repeatFrequency)
	// Save to the Repo
	s.BigNumberDecks[gameId] = largeDeck
	s.LittleNumberDecks[gameId] = littleDeck
}

func (s *NumbersRepo) drawNumberFromListAtRandom(numbers []int) (int, int) {
	position := rand.Intn(len(numbers))
	return numbers[position], position
}

func (s *NumbersRepo) drawNumberFromRandom(numberType NumberType) int {
	if numberType == Big {
		return largeNumbers[rand.Intn(len(largeNumbers))]
	}
	return smallNumbers[rand.Intn(len(smallNumbers))]
}

func (s *NumbersRepo) drawNumberFromDeck(numberType NumberType, gameId string) int {
	var deck []int

	if len(s.LittleNumberDecks[gameId]) == 0 || len(s.BigNumberDecks[gameId]) == 0 {
		s.createNumbersDecks(gameId)
	}

	if numberType == Big {
		deck = s.BigNumberDecks[gameId]
	} else {
		deck = s.LittleNumberDecks[gameId]
	}

	number, position := s.drawNumberFromListAtRandom(deck)

	if numberType == Big {
		s.BigNumberDecks[gameId] = append(deck[:position], deck[position+1:]...)
	} else {
		s.LittleNumberDecks[gameId] = append(deck[:position], deck[position+1:]...)
	}

	return number
}

func (s *NumbersRepo) DrawNumber(numberType NumberType, gameId *string) int {

	switch s.PickType {
	case NumberPickDeck:
		return s.drawNumberFromDeck(numberType, *gameId)
	case NumberPickRandom:
		return s.drawNumberFromRandom(numberType)
	default:
		return s.drawNumberFromRandom(numberType)
	}
}
func (s *NumbersRepo) DrawTarget() int {
	return s.Rng.Intn(maxTarget-minTarget+1) + minTarget
}

func (s *NumbersRepo) DrawRandomNumbers(numberOfLetters int, gameId *string) []int {
	var letters []int
	for i := 0; i < numberOfLetters; i++ {
		letters = append(letters, s.DrawNumber(s.DrawBigOrLittleNumber(), gameId))
	}
	return letters
}

func (s *NumbersRepo) DrawBigOrLittleNumber() NumberType {
	if s.Rng.Int()*s.NumberTypeFrequencies["big"] <= s.Rng.Int()*s.NumberTypeFrequencies["little"] {
		return Big
	}
	return Little
}
