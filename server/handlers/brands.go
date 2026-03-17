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

// parseBrandRow scans a brand row into a Brand struct
func parseBrandRow(row interface{ Scan(...interface{}) error }) (*models.Brand, error) {
	var b models.Brand
	var colorsJSON, fontsJSON, logosJSON, bgJSON string
	var watermarkJSON sql.NullString
	err := row.Scan(&b.ID, &b.Name, &b.Slug, &colorsJSON, &fontsJSON, &logosJSON, &bgJSON,
		&watermarkJSON, &b.DefaultTextColor, &b.DefaultOverlay, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		return nil, err
	}
	json.Unmarshal([]byte(colorsJSON), &b.Colors)
	json.Unmarshal([]byte(fontsJSON), &b.Fonts)
	json.Unmarshal([]byte(logosJSON), &b.Logos)
	json.Unmarshal([]byte(bgJSON), &b.Backgrounds)
	if watermarkJSON.Valid && watermarkJSON.String != "" {
		var wm models.BrandWatermark
		if json.Unmarshal([]byte(watermarkJSON.String), &wm) == nil {
			b.Watermark = &wm
		}
	}
	if b.Logos == nil {
		b.Logos = []models.BrandLogo{}
	}
	if b.Backgrounds == nil {
		b.Backgrounds = []models.BrandBackground{}
	}
	return &b, nil
}

// ListBrands GET /api/brands
func ListBrands(c *gin.Context) {
	rows, err := db.DB.Query("SELECT * FROM brands ORDER BY name")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	brands := []models.Brand{}
	for rows.Next() {
		b, err := parseBrandRow(rows)
		if err != nil {
			continue
		}
		brands = append(brands, *b)
	}
	c.JSON(http.StatusOK, brands)
}

// GetBrand GET /api/brands/:id
func GetBrand(c *gin.Context) {
	id := c.Param("id")
	row := db.DB.QueryRow("SELECT * FROM brands WHERE id = ? OR slug = ?", id, id)
	b, err := parseBrandRow(row)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	}
	c.JSON(http.StatusOK, b)
}

// CreateBrand POST /api/brands
func CreateBrand(c *gin.Context) {
	var input struct {
		Name             string                `json:"name"`
		Slug             string                `json:"slug"`
		Colors           models.BrandColors    `json:"colors"`
		Fonts            models.BrandFonts     `json:"fonts"`
		DefaultTextColor string                `json:"default_text_color"`
		DefaultOverlay   string                `json:"default_overlay"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}
	if input.Slug == "" {
		input.Slug = input.Name
	}
	if input.DefaultTextColor == "" {
		input.DefaultTextColor = "#FFFFFF"
	}
	if input.DefaultOverlay == "" {
		input.DefaultOverlay = "dark"
	}
	id := uuid.New().String()[:8]
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := db.DB.Exec(
		`INSERT INTO brands (id, name, slug, colors, fonts, logos, backgrounds, watermark, default_text_color, default_overlay, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, '[]', '[]', NULL, ?, ?, ?, ?)`,
		id, input.Name, input.Slug,
		models.MustJSON(input.Colors), models.MustJSON(input.Fonts),
		input.DefaultTextColor, input.DefaultOverlay, now, now,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "name": input.Name, "slug": input.Slug})
}

// UpdateBrand PUT /api/brands/:id
func UpdateBrand(c *gin.Context) {
	id := c.Param("id")
	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	// Build dynamic update
	sets := []string{}
	args := []interface{}{}
	strFields := map[string]string{"name": "name", "slug": "slug", "default_text_color": "default_text_color", "default_overlay": "default_overlay"}
	for jsonKey, col := range strFields {
		if v, ok := input[jsonKey]; ok {
			sets = append(sets, col+" = ?")
			args = append(args, v)
		}
	}
	jsonFields := map[string]string{"colors": "colors", "fonts": "fonts", "logos": "logos", "backgrounds": "backgrounds"}
	for jsonKey, col := range jsonFields {
		if v, ok := input[jsonKey]; ok {
			b, _ := json.Marshal(v)
			sets = append(sets, col+" = ?")
			args = append(args, string(b))
		}
	}
	if v, ok := input["watermark"]; ok {
		if v == nil {
			sets = append(sets, "watermark = NULL")
		} else {
			b, _ := json.Marshal(v)
			sets = append(sets, "watermark = ?")
			args = append(args, string(b))
		}
	}
	if len(sets) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}
	sets = append(sets, "updated_at = ?")
	args = append(args, now, id)
	query := "UPDATE brands SET " + joinStr(sets, ", ") + " WHERE id = ?"
	res, err := db.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	}
	GetBrand(c)
}

// DeleteBrand DELETE /api/brands/:id
func DeleteBrand(c *gin.Context) {
	id := c.Param("id")
	res, err := db.DB.Exec("DELETE FROM brands WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func joinStr(parts []string, sep string) string {
	result := ""
	for i, p := range parts {
		if i > 0 {
			result += sep
		}
		result += p
	}
	return result
}
