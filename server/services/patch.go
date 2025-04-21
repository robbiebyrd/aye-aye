package services

import (
	"encoding/json"
	"github.com/sanity-io/mendoza"
)

func GetPatch(gameBefore []byte, gameAfter []byte) string {
	dataBefore, _ := json.Marshal(gameBefore)
	var docBefore interface{}
	_ = json.Unmarshal(dataBefore, &docBefore)

	dataAfter, _ := json.Marshal(gameAfter)
	var docAfter interface{}
	_ = json.Unmarshal(dataAfter, &docAfter)

	patch, _ := mendoza.CreatePatch(docAfter, docBefore)
	a, _ := json.Marshal(patch)
	return string(a)
}
