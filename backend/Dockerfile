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
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system app \
 && useradd --system --gid app --no-create-home app
WORKDIR /app
COPY --from=build /out/server ./server
COPY migrations ./migrations
COPY seeds ./seeds
# Cloud Run injects PORT at runtime; the default keeps the image runnable on its own.
ENV PORT=8080 \
    MIGRATIONS_DIR=migrations \
    DEMO_SEED_PATH=seeds/demo_contracts_bills.sql
EXPOSE 8080
USER app
CMD ["./server"]
