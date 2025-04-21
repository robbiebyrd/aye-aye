package services

import (
	"bufio"
	"os"
	"sort"
	"strings"
)

type LetterFrequency map[rune]int

type WordsService struct {
	Words []string
}

func NewWordsService(dictionaryPath string) *WordsService {
	words, err := loadWords(dictionaryPath)
	if err != nil {
		panic(err)
	}

	words = dropShortWords(words, 3)
	words = dropLongWords(words, 9)
	words = dropMultiwords(words)

	return &WordsService{
		Words: words,
	}
}

func (s *WordsService) GetMatchingWords(letters string) []string {
	letters = strings.ToLower(letters)
	letterCounts := getLetterCounts(letters)

	var matchingWords []string

	for _, word := range s.Words {
		if isValidWord(word, letterCounts) {
			matchingWords = append(matchingWords, word)
		}
	}

	return sortWordLists(matchingWords)
}

func (s *WordsService) GetMatchingWordsOfLengths(letters string, minimumLength int, maximumLength int) []string {
	var matchingWords []string

	for wordLength := minimumLength; wordLength <= maximumLength; wordLength++ {
		matchingWords = append(matchingWords, s.GetMatchingWords(letters[:wordLength])...)
	}

	return sortWordLists(matchingWords)
}

func sortWordLists(words []string) []string {
	sort.Strings(words)

	sort.Slice(words, func(i, j int) bool {
		return len(words[i]) > len(words[j])
	})

	return removeWordListDuplicates(words)
}

func removeWordListDuplicates(arr []string) []string {
	seen := make(map[string]bool)
	result := []string{}

	for _, val := range arr {
		if _, ok := seen[val]; !ok {
			seen[val] = true
			result = append(result, val)
		}
	}
	return result
}

// getLetterCounts returns a frequency map of letters in a string.
func getLetterCounts(letters string) map[rune]int {
	counts := make(map[rune]int)
	for _, ch := range letters {
		counts[ch]++
	}
	return counts
}

// isValidWord checks if a word can be formed using the given letters.
func isValidWord(word string, letterCounts map[rune]int) bool {
	wordCounts := make(map[rune]int)
	for _, ch := range word {
		wordCounts[ch]++
		if wordCounts[ch] > letterCounts[ch] {
			return false
		}
	}
	return true
}

// loadWords reads the word list from a file and saves it in the service
func loadWords(filename string) ([]string, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var words []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		word := strings.TrimSpace(scanner.Text())
		words = append(words, word)
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return words, nil
}

// countLetterFrequency computes and returns the number of times each letter appears in a word
func countLetterFrequency(checkString string) LetterFrequency {
	frequencyMap := make(LetterFrequency)

	for _, char := range strings.ToLower(checkString) {
		if char >= 'a' && char <= 'z' {
			frequencyMap[char]++
		}
	}
	return frequencyMap
}

// dropLongWords removes words over a specific length
func dropLongWords(words []string, length int) []string {
	var updatedWords []string

	for _, word := range words {
		if len(word) <= length {
			updatedWords = append(updatedWords, word)
		}
	}

	return updatedWords
}

// dropShortWords removes words less than a specific length
func dropShortWords(words []string, length int) []string {
	var updatedWords []string

	for _, word := range words {
		if len(word) >= length {
			updatedWords = append(updatedWords, word)
		}
	}

	return updatedWords
}

// dropMultiwords removes words with spaces or hyphenated words
func dropMultiwords(words []string) []string {
	var updatedWords []string
	charsToFind := []string{" ", "-", "'"}

	for _, word := range words {
		found := false
		for _, char := range charsToFind {
			if strings.Contains(word, char) {
				found = true
			}
		}
		if !found {
			updatedWords = append(updatedWords, word)
		}
	}
	return updatedWords
}
