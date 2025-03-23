package timer

import (
	"math"
	"time"
)

func round(num float64) int {
	return int(num + math.Copysign(0.5, num))
}

func toFixed(num float64, precision int) float64 {
	output := math.Pow(10, float64(precision))
	return float64(round(num*output)) / output
}

// Duration represent duration for countdown.
type Duration time.Duration

// Millisecondable returns duration with precision of 3 signs.
// Example "1.188" (1 second 188 milliseconds)
func (d Duration) Millisecondable() float64 {
	return toFixed(float64(time.Duration(d).Seconds()), 3)
}
