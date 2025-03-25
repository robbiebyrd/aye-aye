# aye-aye
Aye Aye is a Countdown-style, multiplayer online game.

## [Play here!](http://aye-aye.robbiebyrd.com)

## Running

1. Clone this repo to your local machine.
2. Install the necessary dependencies
   3. Go(lang) - v1.16 or higher
   4. Node - v20 or higher
   5. Docker
   6. direnv
7. Copy the `.env.example` file in the `client` directory to `.env` in the same folder.
6. Change into the serer directory and run the following command:
`go build main.go`
7. Run the server:
`./main`
8. Change into the `client` directory and run the following command:
`yarn dev`
9. You should be able to access the game by visiting `http://localhost:3000`.