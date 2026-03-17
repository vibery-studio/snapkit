# Stage 1: Build Vue frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY app/package.json ./
RUN npm install
COPY app/ ./
RUN npm run build

# Stage 2: Build Go server
FROM golang:1.23-alpine AS backend
WORKDIR /build
COPY server/ ./
RUN go mod download && go build -o snapkit .

# Stage 3: Production
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=backend /build/snapkit .
COPY --from=frontend /app/dist ./static/
COPY brands/ ./brands/

RUN mkdir -p data/uploads
ENV SNAPKIT_ROOT=/app
ENV GIN_MODE=release
EXPOSE 8080
CMD ["./snapkit"]
