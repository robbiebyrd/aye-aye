# Use the official Go image as a base image
FROM golang:latest

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download Go dependencies
RUN go mod download

# Copy the application source code
COPY . .

COPY .env .env

# Build the Go application
RUN go build -o main /app/cmd/server/main.go

# Expose the port your app listens on (if necessary)
EXPOSE 5002

# Command to run the application
CMD ["/app/main"]
