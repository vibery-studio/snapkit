package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"snapkit/db"
	"snapkit/engine"
	"snapkit/layouts"
	"snapkit/models"

	"github.com/gin-gonic/gin"
)

// HandleRenderHTML GET /api/render/html — returns just the thumbnail div (no page shell), for inline preview
func HandleRenderHTML(c *gin.Context) {
	templateID := c.Query("t")
	layoutID := c.Query("layout")
	sizeID := c.Query("size")

	params := collectQueryParams(c, "t", "layout", "size", "d")

	// Resolve from template
	if templateID != "" {
		var tLayout, tSize, tParamsJSON string
		var tBrand sql.NullString
		err := db.DB.QueryRow("SELECT layout, size, brand, params FROM templates WHERE id = ?", templateID).
			Scan(&tLayout, &tSize, &tBrand, &tParamsJSON)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
			return
		}
		layoutID = tLayout
		sizeID = tSize
		tParams := map[string]string{}
		json.Unmarshal([]byte(tParamsJSON), &tParams)
		brandID := "goha"
		if tBrand.Valid && tBrand.String != "" {
			brandID = tBrand.String
		}
		// Base from template, override with query
		merged := make(map[string]string)
		for k, v := range tParams {
			merged[k] = v
		}
		merged["brand"] = brandID
		for k, v := range params {
			merged[k] = v
		}
		params = merged
	}

	if layoutID == "" || sizeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "layout and size required"})
		return
	}

	var w, h int
	if sizeID == "custom" && params["width"] != "" && params["height"] != "" {
		w, _ = strconv.Atoi(params["width"])
		h, _ = strconv.Atoi(params["height"])
	} else {
		preset := GetSizeByID(sizeID)
		if preset == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown size"})
			return
		}
		w, h = preset.W, preset.H
	}

	brand := getBrandFromDB(params["brand"])
	if brand != nil {
		if params["bg_color"] == "" { params["bg_color"] = brand.Colors.Primary }
		if params["title_color"] == "" { params["title_color"] = brand.Colors.Secondary }
		if params["subtitle_color"] == "" { params["subtitle_color"] = brand.Colors.TextLight }
		if params["logo"] == "" && len(brand.Logos) > 0 { params["logo"] = brand.Logos[0].URL }
		if params["font_heading"] == "" { params["font_heading"] = brand.Fonts.Heading }
	}

	rp := engine.ParamsFromMap(params, w, h)
	html, err := renderLayout(layoutID, rp)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Return just the thumbnail HTML, no page shell
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// HandleRender GET /api/render — 3 modes: ?d=DESIGN_ID, ?t=TEMPLATE_ID, ?layout=X&size=Y
func HandleRender(c *gin.Context) {
	designID := c.Query("d")
	templateID := c.Query("t")

	if designID != "" {
		renderDesign(c, designID)
		return
	}
	if templateID != "" {
		renderTemplate(c, templateID)
		return
	}

	layoutID := c.Query("layout")
	sizeID := c.Query("size")
	if layoutID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required param: layout (or d for saved design)"})
		return
	}
	if sizeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required param: size"})
		return
	}

	params := collectQueryParams(c, "layout", "size")
	renderInline(c, layoutID, sizeID, params)
}

func renderDesign(c *gin.Context, id string) {
	row := db.DB.QueryRow("SELECT * FROM designs WHERE id = ?", id)
	d, err := parseDesignRow(row)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Design not found"})
		return
	}

	preset := GetSizeByID(d.Size.Preset)
	w, h := d.Size.Width, d.Size.Height
	if preset != nil {
		w, h = preset.W, preset.H
	}

	brand := getBrandFromDB(d.Brand)
	params := d.Params
	bgColor := params["bg_color"]
	if bgColor == "" && brand != nil {
		bgColor = brand.Colors.Primary
	}
	titleColor := params["title_color"]
	if titleColor == "" && brand != nil {
		titleColor = brand.Colors.Secondary
	}
	subColor := params["subtitle_color"]
	if subColor == "" && brand != nil {
		subColor = brand.Colors.TextLight
	}
	logo := params["logo"]
	if logo == "" && params["showLogo"] != "false" && params["showLogo"] != "0" && brand != nil && len(brand.Logos) > 0 {
		logo = brand.Logos[0].URL
	}

	rp := engine.ParamsFromMap(params, w, h)
	rp.BgColor = bgColor
	rp.TitleColor = titleColor
	rp.SubtitleColor = subColor
	rp.Logo = logo

	html, err := renderLayout(d.Layout, rp)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(engine.PageShell(html)))
}

func renderTemplate(c *gin.Context, id string) {
	var tLayout, tSize, tBrand string
	var tParamsJSON string
	var brand sql.NullString
	err := db.DB.QueryRow("SELECT layout, size, brand, params FROM templates WHERE id = ?", id).
		Scan(&tLayout, &tSize, &brand, &tParamsJSON)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Template not found: %s", id)})
		return
	}
	if brand.Valid {
		tBrand = brand.String
	}
	if tBrand == "" {
		tBrand = "goha"
	}

	tParams := map[string]string{}
	json.Unmarshal([]byte(tParamsJSON), &tParams)

	// Merge template params with query overrides
	params := make(map[string]string)
	for k, v := range tParams {
		params[k] = v
	}
	params["brand"] = tBrand
	// Override with query params (except t)
	for k, v := range collectQueryParams(c, "t") {
		params[k] = v
	}

	renderInline(c, tLayout, tSize, params)
}

func renderInline(c *gin.Context, layoutID, sizeID string, params map[string]string) {
	var w, h int
	if sizeID == "custom" && params["width"] != "" && params["height"] != "" {
		w, _ = strconv.Atoi(params["width"])
		h, _ = strconv.Atoi(params["height"])
		if w == 0 {
			w = 1200
		}
		if h == 0 {
			h = 630
		}
	} else {
		preset := GetSizeByID(sizeID)
		if preset == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Unknown size preset: %s", sizeID)})
			return
		}
		w, h = preset.W, preset.H
	}

	// Apply brand defaults
	brand := getBrandFromDB(params["brand"])
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
		if params["font_heading"] == "" {
			params["font_heading"] = brand.Fonts.Heading
		}
	}

	rp := engine.ParamsFromMap(params, w, h)
	html, err := renderLayout(layoutID, rp)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(engine.PageShell(html)))
}

// renderLayout renders a layout by ID (built-in or custom from DB)
func renderLayout(id string, rp *engine.RenderParams) (string, error) {
	// Check built-in
	if l, ok := layouts.Registry[id]; ok {
		return l.Render(rp), nil
	}

	// Check DB for custom layout
	var html, css string
	var cssNull sql.NullString
	err := db.DB.QueryRow("SELECT html, css FROM layouts WHERE id = ?", id).Scan(&html, &cssNull)
	if err != nil {
		return "", fmt.Errorf("unknown layout: %s", id)
	}
	if cssNull.Valid {
		css = cssNull.String
	}
	return engine.RenderCustomLayout(html, css, rp.ToMap()), nil
}

// getBrandFromDB loads brand by ID or slug
func getBrandFromDB(id string) *models.Brand {
	if id == "" {
		return nil
	}
	row := db.DB.QueryRow("SELECT * FROM brands WHERE id = ? OR slug = ?", id, id)
	b, err := parseBrandRow(row)
	if err != nil {
		return nil
	}
	return b
}

func collectQueryParams(c *gin.Context, exclude ...string) map[string]string {
	excl := make(map[string]bool)
	for _, e := range exclude {
		excl[e] = true
	}
	params := map[string]string{}
	for k, v := range c.Request.URL.Query() {
		if !excl[k] && len(v) > 0 {
			params[k] = v[0]
		}
	}
	return params
}
