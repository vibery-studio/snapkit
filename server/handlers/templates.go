package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"snapkit/db"
	"snapkit/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func parseTemplateRow(row interface{ Scan(...interface{}) error }) (*models.Template, error) {
	var t models.Template
	var brand sql.NullString
	var paramsJSON string
	var autoFI int
	var updatedAt sql.NullString
	err := row.Scan(&t.ID, &t.Name, &brand, &t.Layout, &t.Size, &paramsJSON, &autoFI, &t.CreatedAt, &updatedAt)
	if err != nil {
		return nil, err
	}
	if brand.Valid {
		t.Brand = brand.String
	}
	json.Unmarshal([]byte(paramsJSON), &t.Params)
	if t.Params == nil {
		t.Params = map[string]string{}
	}
	t.AutoFeatureImage = autoFI == 1
	if updatedAt.Valid {
		t.UpdatedAt = updatedAt.String
	}
	return &t, nil
}

// ListTemplates GET /api/templates
func ListTemplates(c *gin.Context) {
	rows, err := db.DB.Query("SELECT * FROM templates ORDER BY name")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	templates := []models.Template{}
	for rows.Next() {
		t, err := parseTemplateRow(rows)
		if err != nil {
			continue
		}
		templates = append(templates, *t)
	}
	c.JSON(http.StatusOK, templates)
}

// GetTemplate GET /api/templates/:id
func GetTemplate(c *gin.Context) {
	id := c.Param("id")
	row := db.DB.QueryRow("SELECT * FROM templates WHERE id = ?", id)
	t, err := parseTemplateRow(row)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}
	c.JSON(http.StatusOK, t)
}

// CreateTemplate POST /api/templates
func CreateTemplate(c *gin.Context) {
	var input struct {
		ID               string            `json:"id"`
		Name             string            `json:"name"`
		Brand            string            `json:"brand"`
		Layout           string            `json:"layout"`
		Size             string            `json:"size"`
		Params           map[string]string `json:"params"`
		AutoFeatureImage bool              `json:"auto_feature_image"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Name == "" || input.Layout == "" || input.Size == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name, layout, size required"})
		return
	}
	id := input.ID
	if id == "" {
		id = "t_" + uuid.New().String()[:8]
	}
	now := time.Now().UTC().Format(time.RFC3339)
	autoFI := 0
	if input.AutoFeatureImage {
		autoFI = 1
	}
	if input.Params == nil {
		input.Params = map[string]string{}
	}
	_, err := db.DB.Exec(
		"INSERT INTO templates (id, name, brand, layout, size, params, auto_feature_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		id, input.Name, input.Brand, input.Layout, input.Size, models.MustJSON(input.Params), autoFI, now, now,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "name": input.Name})
}

// UpdateTemplate PUT /api/templates/:id
func UpdateTemplate(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Name             *string            `json:"name"`
		Brand            *string            `json:"brand"`
		Layout           *string            `json:"layout"`
		Size             *string            `json:"size"`
		Params           map[string]string  `json:"params"`
		AutoFeatureImage *bool              `json:"auto_feature_image"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get existing
	row := db.DB.QueryRow("SELECT * FROM templates WHERE id = ?", id)
	t, err := parseTemplateRow(row)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	if input.Name != nil {
		t.Name = *input.Name
	}
	if input.Brand != nil {
		t.Brand = *input.Brand
	}
	if input.Layout != nil {
		t.Layout = *input.Layout
	}
	if input.Size != nil {
		t.Size = *input.Size
	}
	if input.Params != nil {
		t.Params = input.Params
	}
	if input.AutoFeatureImage != nil {
		t.AutoFeatureImage = *input.AutoFeatureImage
	}

	now := time.Now().UTC().Format(time.RFC3339)
	autoFI := 0
	if t.AutoFeatureImage {
		autoFI = 1
	}
	_, err = db.DB.Exec(
		"UPDATE templates SET name=?, brand=?, layout=?, size=?, params=?, auto_feature_image=?, updated_at=? WHERE id=?",
		t.Name, t.Brand, t.Layout, t.Size, models.MustJSON(t.Params), autoFI, now, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	t.UpdatedAt = now
	c.JSON(http.StatusOK, t)
}

// DeleteTemplate DELETE /api/templates/:id
func DeleteTemplate(c *gin.Context) {
	id := c.Param("id")
	res, err := db.DB.Exec("DELETE FROM templates WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
