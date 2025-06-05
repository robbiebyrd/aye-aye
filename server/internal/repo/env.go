package repo

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type envVars struct {
	ListenAddr  string
	ListenPort  string
	TimerLength string
}

func LoadEnvVars() *envVars {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %s", err)
	}

	listenAddr := os.Getenv("LISTEN_ADDR")
	listenPort := os.Getenv("LISTEN_PORT")
	timerLength := os.Getenv("TIMER_LENGTH")

	if listenPort == "" {
		panic("You need to specify a port")
	}

	if listenAddr == "" {
		listenAddr = "0.0.0.0"
	}

	if timerLength == "" {
		timerLength = "30"
	}

	return &envVars{
		ListenPort:  listenPort,
		ListenAddr:  listenAddr,
		TimerLength: timerLength,
	}
}
