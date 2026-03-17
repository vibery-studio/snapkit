package handlers

import (
	"encoding/json"
	"fmt"
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

var DataDir = "./data"
var BrandsDir = "./brands"

// UploadLogo POST /api/brands/:id/assets/logos
func UploadLogo(c *gin.Context) {
	brandID := c.Param("id")
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	defer file.Close()

	dir := filepath.Join(BrandsDir, brandID, "logos")
	os.MkdirAll(dir, 0755)
	filename := header.Filename
	dst := filepath.Join(dir, filename)
	out, err := os.Create(dst)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer out.Close()
	io.Copy(out, file)

	url := fmt.Sprintf("/brands/%s/logos/%s", brandID, filename)
	logoID := uuid.New().String()[:8]

	// Update brand logos array
	var logosJSON string
	db.DB.QueryRow("SELECT logos FROM brands WHERE id = ?", brandID).Scan(&logosJSON)
	var logos []models.BrandLogo
	json.Unmarshal([]byte(logosJSON), &logos)
	logos = append(logos, models.BrandLogo{ID: logoID, URL: url, Name: filename})
	now := time.Now().UTC().Format(time.RFC3339)
	db.DB.Exec("UPDATE brands SET logos = ?, updated_at = ? WHERE id = ?", models.MustJSON(logos), now, brandID)

	c.JSON(http.StatusOK, gin.H{"id": logoID, "url": url, "name": filename})
}

// DeleteLogo DELETE /api/brands/:id/assets/logos/:logoId
func DeleteLogo(c *gin.Context) {
	brandID := c.Param("id")
	logoID := c.Param("logoId")

	var logosJSON string
	db.DB.QueryRow("SELECT logos FROM brands WHERE id = ?", brandID).Scan(&logosJSON)
	var logos []models.BrandLogo
	json.Unmarshal([]byte(logosJSON), &logos)

	filtered := []models.BrandLogo{}
	for _, l := range logos {
		if l.ID != logoID {
			filtered = append(filtered, l)
		}
	}
	now := time.Now().UTC().Format(time.RFC3339)
	db.DB.Exec("UPDATE brands SET logos = ?, updated_at = ? WHERE id = ?", models.MustJSON(filtered), now, brandID)
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// UploadBackground POST /api/brands/:id/assets/backgrounds
func UploadBackground(c *gin.Context) {
	brandID := c.Param("id")
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	defer file.Close()

	dir := filepath.Join(BrandsDir, brandID, "bg")
	os.MkdirAll(dir, 0755)
	filename := header.Filename
	dst := filepath.Join(dir, filename)
	out, err := os.Create(dst)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer out.Close()
	io.Copy(out, file)

	url := fmt.Sprintf("/brands/%s/bg/%s", brandID, filename)

	// Update backgrounds array
	var bgJSON string
	db.DB.QueryRow("SELECT backgrounds FROM brands WHERE id = ?", brandID).Scan(&bgJSON)
	var bgs []models.BrandBackground
	json.Unmarshal([]byte(bgJSON), &bgs)
	tags := c.PostFormArray("tags")
	if tags == nil {
		tags = []string{}
	}
	bgs = append(bgs, models.BrandBackground{URL: url, Tags: tags, Name: filename})
	now := time.Now().UTC().Format(time.RFC3339)
	db.DB.Exec("UPDATE brands SET backgrounds = ?, updated_at = ? WHERE id = ?", models.MustJSON(bgs), now, brandID)

	c.JSON(http.StatusOK, gin.H{"url": url, "name": filename})
}

// DeleteBackground DELETE /api/brands/:id/assets/backgrounds/:bgName
func DeleteBackground(c *gin.Context) {
	brandID := c.Param("id")
	bgName := c.Param("bgName")

	var bgJSON string
	db.DB.QueryRow("SELECT backgrounds FROM brands WHERE id = ?", brandID).Scan(&bgJSON)
	var bgs []models.BrandBackground
	json.Unmarshal([]byte(bgJSON), &bgs)

	filtered := []models.BrandBackground{}
	for _, bg := range bgs {
		if bg.Name != bgName {
			filtered = append(filtered, bg)
		}
	}
	now := time.Now().UTC().Format(time.RFC3339)
	db.DB.Exec("UPDATE brands SET backgrounds = ?, updated_at = ? WHERE id = ?", models.MustJSON(filtered), now, brandID)
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// UploadWatermark POST /api/brands/:id/assets/watermark
func UploadWatermark(c *gin.Context) {
	brandID := c.Param("id")
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	defer file.Close()

	dir := filepath.Join(BrandsDir, brandID, "watermark")
	os.MkdirAll(dir, 0755)
	filename := header.Filename
	dst := filepath.Join(dir, filename)
	out, err := os.Create(dst)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer out.Close()
	io.Copy(out, file)

	url := fmt.Sprintf("/brands/%s/watermark/%s", brandID, filename)
	wm := models.BrandWatermark{URL: url, DefaultOpacity: "light"}
	now := time.Now().UTC().Format(time.RFC3339)
	db.DB.Exec("UPDATE brands SET watermark = ?, updated_at = ? WHERE id = ?", models.MustJSON(wm), now, brandID)

	c.JSON(http.StatusOK, gin.H{"url": url})
}
