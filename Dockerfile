FROM golang:1.23-alpine AS builder
WORKDIR /build
COPY server/ ./
RUN go mod download && go build -o snapkit .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /build/snapkit .
COPY brands/ ./brands/

RUN mkdir -p data/uploads
ENV SNAPKIT_ROOT=/app
EXPOSE 8080
CMD ["./snapkit"]
