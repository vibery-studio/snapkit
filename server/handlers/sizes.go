package handlers

import (
	"net/http"
	"snapkit/models"

	"github.com/gin-gonic/gin"
)

var sizePresets = []models.SizePreset{
	{ID: "fb-post", Name: "Facebook Post", W: 1200, H: 630, Category: "landscape"},
	{ID: "og-image", Name: "OG Image", W: 1200, H: 630, Category: "landscape"},
	{ID: "zalo-post", Name: "Zalo Post", W: 1200, H: 630, Category: "landscape"},
	{ID: "tw-post", Name: "Twitter/X Post", W: 1200, H: 675, Category: "landscape"},
	{ID: "yt-thumbnail", Name: "YouTube Thumbnail", W: 1280, H: 720, Category: "landscape"},
	{ID: "blog-hero", Name: "Blog Hero", W: 1600, H: 900, Category: "landscape"},
	{ID: "agency-wide", Name: "Agency Wide", W: 1300, H: 874, Category: "landscape"},
	{ID: "ig-landscape", Name: "Instagram Landscape", W: 1080, H: 566, Category: "landscape"},
	{ID: "ig-post", Name: "Instagram Post", W: 1080, H: 1080, Category: "square"},
	{ID: "fb-story", Name: "Facebook Story", W: 1080, H: 1920, Category: "portrait"},
	{ID: "ig-story", Name: "Instagram Story", W: 1080, H: 1920, Category: "portrait"},
	{ID: "fb-cover", Name: "Facebook Cover", W: 1640, H: 924, Category: "wide"},
	{ID: "yt-banner", Name: "YouTube Banner", W: 2560, H: 1440, Category: "wide"},
}

// GetSizeByID returns a size preset by ID
func GetSizeByID(id string) *models.SizePreset {
	for _, s := range sizePresets {
		if s.ID == id {
			return &s
		}
	}
	return nil
}

// HandleSizes returns all size presets
func HandleSizes(c *gin.Context) {
	c.JSON(http.StatusOK, sizePresets)
}
