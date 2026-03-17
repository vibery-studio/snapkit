package handlers

import (
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"snapkit/db"
	"snapkit/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ListMedia GET /api/media
func ListMedia(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, filename, content_type, size, path, tags, created_at FROM media ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	items := []models.Media{}
	for rows.Next() {
		var m models.Media
		var tagsJSON string
		if rows.Scan(&m.ID, &m.Filename, &m.ContentType, &m.Size, &m.Path, &tagsJSON, &m.CreatedAt) == nil {
			json.Unmarshal([]byte(tagsJSON), &m.Tags)
			if m.Tags == nil {
				m.Tags = []string{}
			}
			m.URL = "/uploads/" + m.Path
			items = append(items, m)
		}
	}
	c.JSON(http.StatusOK, items)
}

// GetMedia GET /api/media/:id
func GetMedia(c *gin.Context) {
	id := c.Param("id")
	var m models.Media
	var tagsJSON string
	err := db.DB.QueryRow("SELECT id, filename, content_type, size, path, tags, created_at FROM media WHERE id = ?", id).
		Scan(&m.ID, &m.Filename, &m.ContentType, &m.Size, &m.Path, &tagsJSON, &m.CreatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media not found"})
		return
	}
	json.Unmarshal([]byte(tagsJSON), &m.Tags)
	if m.Tags == nil {
		m.Tags = []string{}
	}
	m.URL = "/uploads/" + m.Path
	c.JSON(http.StatusOK, m)
}

// CreateMedia POST /api/media
func CreateMedia(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	defer file.Close()

	id := uuid.New().String()[:12]
	ext := filepath.Ext(header.Filename)
	storedName := id + ext
	uploadDir := filepath.Join(DataDir, "uploads")
	os.MkdirAll(uploadDir, 0755)
	dst := filepath.Join(uploadDir, storedName)
	out, err := os.Create(dst)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer out.Close()
	written, _ := io.Copy(out, file)

	now := time.Now().UTC().Format(time.RFC3339)
	tags := c.PostFormArray("tags")
	if tags == nil {
		tags = []string{}
	}
	ct := header.Header.Get("Content-Type")
	if ct == "" {
		ct = "application/octet-stream"
	}

	_, err = db.DB.Exec(
		"INSERT INTO media (id, filename, content_type, size, path, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		id, header.Filename, ct, written, storedName, models.MustJSON(tags), now,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id": id, "filename": header.Filename, "url": "/uploads/" + storedName,
		"content_type": ct, "size": written,
	})
}

// DeleteMedia DELETE /api/media/:id
func DeleteMedia(c *gin.Context) {
	id := c.Param("id")
	var path string
	err := db.DB.QueryRow("SELECT path FROM media WHERE id = ?", id).Scan(&path)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media not found"})
		return
	}
	// Delete file
	os.Remove(filepath.Join(DataDir, "uploads", path))
	db.DB.Exec("DELETE FROM media WHERE id = ?", id)
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

