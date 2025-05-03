package models

import "time"

type Submission struct {
	PlayerID  string     `json:"playerId"`
	Entry     *string    `json:"entry,omitempty"`
	Timestamp *time.Time `json:"timestamp,omitempty"`
	Correct   *bool      `json:"correct,omitempty"`
}
