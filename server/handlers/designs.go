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

func parseDesignRow(row interface{ Scan(...interface{}) error }) (*models.Design, error) {
	var d models.Design
	var paramsJSON string
	var brand, forkedFrom sql.NullString
	err := row.Scan(&d.ID, &d.Size.Preset, &d.Size.Width, &d.Size.Height,
		&d.Layout, &brand, &paramsJSON, &forkedFrom, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		return nil, err
	}
	if brand.Valid {
		d.Brand = brand.String
	}
	if forkedFrom.Valid {
		d.ForkedFrom = forkedFrom.String
	}
	json.Unmarshal([]byte(paramsJSON), &d.Params)
	if d.Params == nil {
		d.Params = map[string]string{}
	}
	return &d, nil
}

// CreateDesign POST /api/designs
func CreateDesign(c *gin.Context) {
	var input struct {
		Size   models.DesignSize `json:"size"`
		Layout string            `json:"layout"`
		Brand  string            `json:"brand"`
		Params map[string]string `json:"params"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id := "d_" + uuid.New().String()[:8]
	now := time.Now().UTC().Format(time.RFC3339)
	if input.Params == nil {
		input.Params = map[string]string{}
	}
	_, err := db.DB.Exec(
		`INSERT INTO designs (id, size_preset, size_width, size_height, layout, brand, params, forked_from, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
		id, input.Size.Preset, input.Size.Width, input.Size.Height,
		input.Layout, nilIfEmpty(input.Brand), models.MustJSON(input.Params), now, now,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.Design{
		ID: id, CreatedAt: now, UpdatedAt: now,
		Size: input.Size, Layout: input.Layout, Brand: input.Brand, Params: input.Params,
	})
}

// GetDesign GET /api/designs/:id
func GetDesign(c *gin.Context) {
	id := c.Param("id")
	row := db.DB.QueryRow("SELECT * FROM designs WHERE id = ?", id)
	d, err := parseDesignRow(row)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Design not found"})
		return
	}
	c.JSON(http.StatusOK, d)
}

// UpdateDesign PUT /api/designs/:id
func UpdateDesign(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Size   *models.DesignSize `json:"size"`
		Layout *string            `json:"layout"`
		Brand  *string            `json:"brand"`
		Params map[string]string  `json:"params"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	row := db.DB.QueryRow("SELECT * FROM designs WHERE id = ?", id)
	d, err := parseDesignRow(row)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Design not found"})
		return
	}
	if input.Size != nil {
		d.Size = *input.Size
	}
	if input.Layout != nil {
		d.Layout = *input.Layout
	}
	if input.Brand != nil {
		d.Brand = *input.Brand
	}
	if input.Params != nil {
		d.Params = input.Params
	}
	now := time.Now().UTC().Format(time.RFC3339)
	_, err = db.DB.Exec(
		`UPDATE designs SET size_preset=?, size_width=?, size_height=?, layout=?, brand=?, params=?, updated_at=? WHERE id=?`,
		d.Size.Preset, d.Size.Width, d.Size.Height, d.Layout, nilIfEmpty(d.Brand), models.MustJSON(d.Params), now, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	d.UpdatedAt = now
	c.JSON(http.StatusOK, d)
}

// ForkDesign POST /api/designs/:id/fork
func ForkDesign(c *gin.Context) {
	id := c.Param("id")
	row := db.DB.QueryRow("SELECT * FROM designs WHERE id = ?", id)
	d, err := parseDesignRow(row)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Design not found"})
		return
	}
	newID := "d_" + uuid.New().String()[:8]
	now := time.Now().UTC().Format(time.RFC3339)
	_, err = db.DB.Exec(
		`INSERT INTO designs (id, size_preset, size_width, size_height, layout, brand, params, forked_from, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		newID, d.Size.Preset, d.Size.Width, d.Size.Height,
		d.Layout, nilIfEmpty(d.Brand), models.MustJSON(d.Params), id, now, now,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.Design{
		ID: newID, CreatedAt: now, UpdatedAt: now,
		Size: d.Size, Layout: d.Layout, Brand: d.Brand, Params: d.Params, ForkedFrom: id,
	})
}

func nilIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
