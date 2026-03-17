package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"snapkit/db"
	"snapkit/engine"

	"github.com/gin-gonic/gin"
)

// BulkRenderRequest is the POST body for /api/bulk/render
type BulkRenderRequest struct {
	TemplateID string              `json:"template_id"`
	LayoutID   string              `json:"layout_id"`
	SizeID     string              `json:"size_id"`
	BrandID    string              `json:"brand_id"`
	Items      []map[string]string `json:"items"`
}

// BulkRenderResponse is one item in the response array
type BulkRenderResponse struct {
	Index int    `json:"index"`
	HTML  string `json:"html,omitempty"`
	Error string `json:"error,omitempty"`
}

// HandleBulkRender POST /api/bulk/render
func HandleBulkRender(c *gin.Context) {
	var req BulkRenderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "items array is required"})
		return
	}

	// Resolve base params from template if provided
	baseParams := map[string]string{}
	layoutID := req.LayoutID
	sizeID := req.SizeID
	brandID := req.BrandID

	if req.TemplateID != "" {
		// Load template
		var tLayout, tSize, tParamsJSON string
		var tBrand sql.NullString
		err := db.DB.QueryRow("SELECT layout, size, brand, params FROM templates WHERE id = ?", req.TemplateID).
			Scan(&tLayout, &tSize, &tBrand, &tParamsJSON)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found: " + req.TemplateID})
			return
		}
		layoutID = tLayout
		sizeID = tSize
		if tBrand.Valid && tBrand.String != "" {
			brandID = tBrand.String
		}
		json.Unmarshal([]byte(tParamsJSON), &baseParams)
	}

	if layoutID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "layout_id or template_id required"})
		return
	}
	if sizeID == "" {
		sizeID = "fb-post"
	}

	// Resolve size
	var w, h int
	preset := GetSizeByID(sizeID)
	if preset != nil {
		w, h = preset.W, preset.H
	} else {
		w, h = 1200, 630
	}

	// Resolve brand defaults
	brand := getBrandFromDB(brandID)

	results := make([]BulkRenderResponse, len(req.Items))
	for i, item := range req.Items {
		// Merge base + item overrides
		params := make(map[string]string)
		for k, v := range baseParams {
			params[k] = v
		}
		if brandID != "" {
			params["brand"] = brandID
		}
		for k, v := range item {
			params[k] = v
		}

		// Apply brand defaults
		if brand != nil {
			if params["bg_color"] == "" {
				params["bg_color"] = brand.Colors.Primary
			}
			if params["title_color"] == "" {
				params["title_color"] = brand.Colors.Secondary
			}
			if params["subtitle_color"] == "" {
				params["subtitle_color"] = brand.Colors.TextLight
			}
			if params["logo"] == "" && len(brand.Logos) > 0 {
				params["logo"] = brand.Logos[0].URL
			}
		}

		rp := engine.ParamsFromMap(params, w, h)
		html, err := renderLayout(layoutID, rp)
		if err != nil {
			results[i] = BulkRenderResponse{Index: i, Error: err.Error()}
		} else {
			results[i] = BulkRenderResponse{Index: i, HTML: engine.PageShell(html)}
		}
	}

	c.JSON(http.StatusOK, results)
}
