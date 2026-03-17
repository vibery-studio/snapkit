package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"snapkit/db"
	"snapkit/layouts"
	"snapkit/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ListLayouts GET /api/layouts
func ListLayouts(c *gin.Context) {
	category := c.Query("category")

	// Built-in layouts
	result := []models.LayoutInfo{}
	for _, l := range layouts.Registry {
		info := l.Info
		info.Custom = false
		if category != "" {
			found := false
			for _, cat := range info.Categories {
				if cat == category {
					found = true
					break
				}
			}
			if !found {
				continue
			}
		}
		result = append(result, info)
	}

	// Custom layouts from DB
	rows, err := db.DB.Query("SELECT id, name, categories, params FROM layouts ORDER BY name")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var info models.LayoutInfo
			var catsJSON, paramsJSON string
			if rows.Scan(&info.ID, &info.Name, &catsJSON, &paramsJSON) == nil {
				json.Unmarshal([]byte(catsJSON), &info.Categories)
				json.Unmarshal([]byte(paramsJSON), &info.Params)
				info.Custom = true
				if category != "" {
					found := false
					for _, cat := range info.Categories {
						if cat == category {
							found = true
							break
						}
					}
					if !found {
						continue
					}
				}
				result = append(result, info)
			}
		}
	}

	c.JSON(http.StatusOK, result)
}

// GetLayout GET /api/layouts/:id
func GetLayout(c *gin.Context) {
	id := c.Param("id")

	// Check built-in first
	if l, ok := layouts.Registry[id]; ok {
		info := l.Info
		info.Custom = false
		c.JSON(http.StatusOK, info)
		return
	}

	// Check DB
	var info models.LayoutInfo
	var catsJSON, paramsJSON string
	var css sql.NullString
	err := db.DB.QueryRow("SELECT id, name, categories, params, html, css FROM layouts WHERE id = ?", id).
		Scan(&info.ID, &info.Name, &catsJSON, &paramsJSON, &info.HTML, &css)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Layout not found"})
		return
	}
	json.Unmarshal([]byte(catsJSON), &info.Categories)
	json.Unmarshal([]byte(paramsJSON), &info.Params)
	info.Custom = true
	if css.Valid {
		info.CSS = css.String
	}
	c.JSON(http.StatusOK, info)
}

// CreateLayout POST /api/layouts
func CreateLayout(c *gin.Context) {
	var input struct {
		Name       string              `json:"name"`
		Categories []string            `json:"categories"`
		Params     []models.LayoutParam `json:"params"`
		HTML       string              `json:"html"`
		CSS        string              `json:"css"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Name == "" || input.HTML == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and html are required"})
		return
	}
	if len(input.Categories) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "categories must be non-empty"})
		return
	}

	id := "cl_" + uuid.New().String()[:8]
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := db.DB.Exec(
		"INSERT INTO layouts (id, name, categories, params, html, css, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		id, input.Name, models.MustJSON(input.Categories), models.MustJSON(input.Params), input.HTML, input.CSS, now, now,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "name": input.Name})
}

// UpdateLayout PUT /api/layouts/:id
func UpdateLayout(c *gin.Context) {
	id := c.Param("id")
	// Disallow editing built-in
	if _, ok := layouts.Registry[id]; ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot edit built-in layout"})
		return
	}

	var input struct {
		Name       string              `json:"name"`
		Categories []string            `json:"categories"`
		Params     []models.LayoutParam `json:"params"`
		HTML       string              `json:"html"`
		CSS        string              `json:"css"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	res, err := db.DB.Exec(
		"UPDATE layouts SET name=?, categories=?, params=?, html=?, css=?, updated_at=? WHERE id=?",
		input.Name, models.MustJSON(input.Categories), models.MustJSON(input.Params), input.HTML, input.CSS, now, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Layout not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": id, "updated": true})
}

// DeleteLayout DELETE /api/layouts/:id
func DeleteLayout(c *gin.Context) {
	id := c.Param("id")
	if _, ok := layouts.Registry[id]; ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot delete built-in layout"})
		return
	}
	res, err := db.DB.Exec("DELETE FROM layouts WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Layout not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
