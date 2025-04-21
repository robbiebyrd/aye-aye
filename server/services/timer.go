package services

import (
	"time"
)

type CountdownerOptions struct {
	Duration       time.Duration
	Passed         time.Duration
	TickerInternal time.Duration
	OnPaused       func(passed, remained time.Duration)
	OnDone         func(stopped bool)
	OnTick         func(passed, remained time.Duration)
	OnRun          func(started bool)
}

type Countdowner struct {
	options  CountdownerOptions
	ticker   *time.Ticker
	started  bool
	passed   time.Duration
	lastTick time.Time
}

// NewCountdowner creates instance of a new Countdown Timer.
func NewCountdowner(options CountdownerOptions) *Countdowner {
	return &Countdowner{
		options: options,
	}
}

func (c *Countdowner) Passed() time.Duration {
	return c.passed
}

func (c *Countdowner) Remaining() time.Duration {
	return c.options.Duration - c.Passed()
}

func (c *Countdowner) timeFromLastTick() time.Duration {
	return time.Now().Sub(c.lastTick)
}

// Run starts just created timer and resumes paused.
func (c *Countdowner) Run() {
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
func (c *Countdowner) Pause() {
	c.ticker.Stop()
	c.passed += time.Now().Sub(c.lastTick)
	c.lastTick = time.Now()
	c.options.OnPaused(c.passed, c.Remaining())
}

// Stop finishes the timer.
func (c *Countdowner) Stop() {
	c.ticker.Stop()
	c.options.OnDone(true)
}
