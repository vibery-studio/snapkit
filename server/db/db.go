package db

import (
	"database/sql"
	_ "embed"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schemaSQL string

var DB *sql.DB

// Init opens (or creates) the SQLite database and runs the embedded schema.
func Init(dataDir string) {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		log.Fatalf("create data dir: %v", err)
	}
	dbPath := filepath.Join(dataDir, "snapkit.db")
	var err error
	DB, err = sql.Open("sqlite", dbPath+"?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	DB.SetMaxOpenConns(1) // SQLite single-writer
	if _, err := DB.Exec(schemaSQL); err != nil {
		log.Fatalf("init schema: %v", err)
	}
	log.Printf("SQLite ready: %s", dbPath)
}
