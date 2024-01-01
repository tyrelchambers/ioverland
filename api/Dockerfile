# Use a minimal base image for Go
FROM golang:1.21.5-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the source code into the container
COPY . .

# Build the Go application
RUN go build -o output

# Use a lightweight base image
FROM alpine:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /app/output .

# Expose the port your application is listening on
EXPOSE 8000

# Set the command to run your application
CMD ["./output"]