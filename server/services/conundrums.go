package services

import (
	"encoding/csv"
	"math/rand"
	"os"
	"strings"
)

type ConundrumsService struct {
	Conundrums     []Conundrum
	ConundrumsPath string
}

type Conundrum struct {
	Jumbled []string
	Word    []string
	Clue    string
}

func NewConundrumsService(conundrumsPath string) *ConundrumsService {
	conundrums, err := loadConundrums(conundrumsPath)
	if err != nil {
		panic(err)
	}

	return &ConundrumsService{
		Conundrums:     conundrums,
		ConundrumsPath: conundrumsPath,
	}
}

func (c *ConundrumsService) GetConundrum() Conundrum {
	if len(c.Conundrums) == 0 {
		c.Conundrums, _ = loadConundrums(c.ConundrumsPath)
	}
	conundrum := c.Conundrums[len(c.Conundrums)-1]
	c.Conundrums = c.Conundrums[:len(c.Conundrums)-1]
	return conundrum
}

// loadConundrums reads the list of conundrums from a file and returns it
func loadConundrums(filename string) ([]Conundrum, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	csvReader := csv.NewReader(file)

	records, err := csvReader.ReadAll()
	if err != nil {
		return nil, err
	}

	var conundrums []Conundrum

	for _, value := range records {
		conundrums = append(conundrums, Conundrum{
			Jumbled: strings.Split(value[0], ""),
			Word:    strings.Split(value[1], ""),
			Clue:    value[2],
		})
	}

	rand.Shuffle(len(conundrums), func(i, j int) {
		conundrums[i], conundrums[j] = conundrums[j], conundrums[i]
	})

	return conundrums, nil
}
