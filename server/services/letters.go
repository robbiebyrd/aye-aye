package services

import (
	"math/rand"
	"sort"
	"strings"
	"time"
)

type LetterPickType string

const (
	LetterPickDeck      LetterPickType = "deck"
	LetterPickFrequency                = "frequency"
	LetterPickRandom                   = "random"
)

type LettersService struct {
	Rng                   *rand.Rand
	LetterTypeFrequencies map[string]int
	ConsonantFrequencies  map[string]int
	VowelFrequencies      map[string]int
	PickType              LetterPickType
	VowelDecks            map[string][]string
	ConsonantDecks        map[string][]string
}

var letterTypeFrequencies = map[string]int{
	"vowels":     2,
	"consonants": 7,
}

var vowelFrequencies = map[string]int{
	"a": 15,
	"e": 21,
	"i": 13,
	"o": 13,
	"u": 5,
}

var consonantFrequencies = map[string]int{
	"b": 4,
	"c": 6,
	"d": 12,
	"f": 4,
	"g": 6,
	"h": 4,
	"j": 2,
	"k": 2,
	"l": 10,
	"m": 8,
	"n": 16,
	"p": 8,
	"q": 1,
	"r": 18,
	"s": 18,
	"t": 18,
	"v": 2,
	"w": 2,
	"x": 1,
	"y": 4,
	"z": 1,
}

func NewLettersService() *LettersService {
	return &LettersService{
		Rng:                   rand.New(rand.NewSource(time.Now().UnixNano())),
		VowelFrequencies:      vowelFrequencies,
		ConsonantFrequencies:  consonantFrequencies,
		LetterTypeFrequencies: letterTypeFrequencies,
		PickType:              LetterPickDeck,
		VowelDecks:            map[string][]string{},
		ConsonantDecks:        map[string][]string{},
	}
}

type LetterWeight struct {
	Letter string
	Weight int
}

type LetterType string

const (
	Consonant LetterType = "consonant"
	Vowel                = "vowel"
)

func (s *LettersService) getLetterFrequencies(letterType LetterType) map[string]int {
	switch letterType {
	case Consonant:
		return s.ConsonantFrequencies
	case Vowel:
		return s.VowelFrequencies
	default:
		return s.ConsonantFrequencies
	}
}

func (s *LettersService) getLettersFromFrequencies(frequencies map[string]int) []string {
	keys := make([]string, 0, len(frequencies))
	for k := range frequencies {
		keys = append(keys, k)
	}
	return keys
}

func (s *LettersService) createLettersDeck(gameId string) {
	if len(s.VowelFrequencies) <= 0 {
		s.VowelFrequencies = vowelFrequencies
	}
	if len(s.ConsonantFrequencies) <= 0 {
		s.ConsonantFrequencies = consonantFrequencies
	}

	var vowelDeck string
	for letter, frequency := range s.VowelFrequencies {
		vowelDeck = vowelDeck + strings.Repeat(letter, frequency)
	}
	s.VowelDecks[gameId] = strings.Split(vowelDeck, "")

	var consonantDeck string
	for letter, frequency := range s.ConsonantFrequencies {
		consonantDeck = consonantDeck + strings.Repeat(letter, frequency)
	}
	s.ConsonantDecks[gameId] = strings.Split(consonantDeck, "")

}

func (s *LettersService) drawLetterFromListAtRandom(letters []string) (string, int) {
	position := rand.Intn(len(letters))
	return letters[position], position
}

func (s *LettersService) drawLetterFromRandom(letterType LetterType) string {
	var letters []string

	if letterType == Vowel {
		letters = s.getLettersFromFrequencies(s.VowelFrequencies)
	} else {
		letters = s.getLettersFromFrequencies(s.ConsonantFrequencies)
	}

	letter, _ := s.drawLetterFromListAtRandom(letters)
	return letter
}

func (s *LettersService) drawLetterFromWeights(letterType LetterType) string {
	letterFrequencies := s.getLetterFrequencies(letterType)

	var letterWeights []LetterWeight
	for letter, frequency := range letterFrequencies {
		letterWeights = append(letterWeights, LetterWeight{letter, s.Rng.Int() * frequency / 2})
	}

	sort.Slice(letterWeights, func(i, j int) bool {
		return letterWeights[i].Weight > letterWeights[j].Weight
	})

	return letterWeights[0].Letter
}

func (s *LettersService) drawLetterFromDeck(letterType LetterType, gameId string) string {
	var deck []string

	if len(s.VowelDecks[gameId]) == 0 || len(s.ConsonantDecks[gameId]) == 0 {
		s.createLettersDeck(gameId)
	}

	if letterType == Vowel {
		deck = s.VowelDecks[gameId]
	} else {
		deck = s.ConsonantDecks[gameId]
	}

	letter, position := s.drawLetterFromListAtRandom(deck)

	if letterType == Vowel {
		s.VowelDecks[gameId] = append(deck[:position], deck[position+1:]...)
	} else {
		s.ConsonantDecks[gameId] = append(deck[:position], deck[position+1:]...)
	}

	return letter
}

func (s *LettersService) DrawLetter(letterType LetterType, gameId *string) string {
	if s.PickType == LetterPickDeck && &gameId != nil {
		return s.drawLetterFromDeck(letterType, *gameId)
	}
	return s.drawLetterFromRandom(letterType)
}

func (s *LettersService) DrawRandomLetters(numberOfLetters int, gameId *string) []string {
	var letters []string
	for i := 0; i < numberOfLetters; i++ {
		letters = append(letters, s.DrawLetter(s.DrawConsonantOrVowels(), gameId))
	}
	return letters
}

func (s *LettersService) DrawConsonantOrVowels() LetterType {
	if s.Rng.Int()*s.LetterTypeFrequencies["consonants"] <= s.Rng.Int()*s.LetterTypeFrequencies["vowels"] {
		return Consonant
	}
	return Vowel
}
