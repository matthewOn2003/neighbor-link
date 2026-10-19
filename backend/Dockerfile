# Build stage
FROM golang:1.27.1 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

# Runtime stage
FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /out/server ./server
COPY migrations ./migrations
COPY seeds ./seeds
# godotenv reads .env at startup; variables set on the platform take precedence over it.
COPY .env ./.env
EXPOSE 10000
CMD ["./server"]
