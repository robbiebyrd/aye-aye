package timer

import (
	"time"
)

// Options represents configuration for timer.
type Options struct {
	Duration       time.Duration
	Passed         time.Duration
	TickerInternal time.Duration
	OnPaused       func(passed, remained time.Duration)
	OnDone         func(stopped bool)
	OnTick         func(passed, remained time.Duration)
	OnRun          func(started bool)
}

// Timer represents timer with pause/resume features.
type Timer struct {
	options  Options
	ticker   *time.Ticker
	started  bool
	passed   time.Duration
	lastTick time.Time
}

// Passed returns how much done is already passed.
func (c Timer) Passed() time.Duration {
	return c.passed
}

// Remaining returns how much time is left to end.
func (c Timer) Remaining() time.Duration {
	return c.options.Duration - c.Passed()
}

func (t Timer) timeFromLastTick() time.Duration {
	return time.Now().Sub(t.lastTick)
}

// Run starts just created timer and resumes paused.
func (c *Timer) Run() {
	//c.active = true
	c.ticker = time.NewTicker(c.options.TickerInternal)
	c.lastTick = time.Now()
	if !c.started {
		c.started = true
		c.options.OnRun(true)
	} else {
		c.options.OnRun(false)
	}
	c.options.OnTick(c.passed, c.Remaining())
	for tickAt := range c.ticker.C {
		c.passed += tickAt.Sub(c.lastTick)
		c.lastTick = time.Now()
		c.options.OnTick(c.passed, c.Remaining())
		if c.Remaining() <= 0 {
			c.ticker.Stop()
			c.options.OnDone(false)
		} else if c.Remaining() <= c.options.TickerInternal {
			c.ticker.Stop()
			time.Sleep(c.Remaining())
			c.passed = c.options.Duration
			c.options.OnTick(c.passed, c.Remaining())
			c.options.OnDone(false)
		}
	}
}

// Pause temporarily pauses active timer.
func (c *Timer) Pause() {
	c.ticker.Stop()
	c.passed += time.Now().Sub(c.lastTick)
	c.lastTick = time.Now()
	c.options.OnPaused(c.passed, c.Remaining())
}

// Stop finishes the timer.
func (c *Timer) Stop() {
	c.ticker.Stop()
	c.options.OnDone(true)
}

// New creates instance of timer.
func New(options Options) *Timer {
	return &Timer{
		options: options,
	}
}
