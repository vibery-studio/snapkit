package engine

// RenderParams holds all possible layout render parameters
type RenderParams struct {
	Width            int
	Height           int
	Title            string
	Subtitle         string
	BgColor          string
	BgImage          string
	TitleColor       string
	SubtitleColor    string
	Logo             string
	LogoPosition     string
	FeatureImage     string
	Image1           string
	Image2           string
	Overlay          string
	WatermarkURL     string
	WatermarkOpacity string
	// Extra params for custom layouts and extended built-in layouts
	Extra map[string]string
}

// Get returns a param value, checking Extra map as fallback
func (p *RenderParams) Get(key string) string {
	switch key {
	case "width":
		return ""
	case "height":
		return ""
	case "title":
		return p.Title
	case "subtitle":
		return p.Subtitle
	case "bg_color":
		return p.BgColor
	case "bg_image":
		return p.BgImage
	case "title_color":
		return p.TitleColor
	case "subtitle_color":
		return p.SubtitleColor
	case "logo":
		return p.Logo
	case "logo_position":
		return p.LogoPosition
	case "feature_image":
		return p.FeatureImage
	case "image_1":
		return p.Image1
	case "image_2":
		return p.Image2
	case "overlay":
		return p.Overlay
	case "watermark_url":
		return p.WatermarkURL
	case "watermark_opacity":
		return p.WatermarkOpacity
	}
	if p.Extra != nil {
		return p.Extra[key]
	}
	return ""
}

// ToMap converts RenderParams to a flat string map (for custom layout rendering)
func (p *RenderParams) ToMap() map[string]string {
	m := map[string]string{
		"width":             intToStr(p.Width),
		"height":            intToStr(p.Height),
		"title":             EscapeHTML(p.Title),
		"subtitle":          EscapeHTML(p.Subtitle),
		"bg_color":          SanitizeColor(p.BgColor, "#1a1a3e"),
		"bg_image":          p.BgImage,
		"title_color":       SanitizeColor(p.TitleColor, "#FFFFFF"),
		"subtitle_color":    SanitizeColor(p.SubtitleColor, "#FFFFFF"),
		"logo":              p.Logo,
		"logo_position":     p.LogoPosition,
		"feature_image":     p.FeatureImage,
		"image_1":           p.Image1,
		"image_2":           p.Image2,
		"overlay":           p.Overlay,
		"watermark_url":     p.WatermarkURL,
		"watermark_opacity": p.WatermarkOpacity,
	}
	for k, v := range p.Extra {
		if _, exists := m[k]; !exists {
			m[k] = v
		}
	}
	return m
}

// ParamsFromMap creates RenderParams from a flat query/JSON map + width/height
func ParamsFromMap(m map[string]string, w, h int) *RenderParams {
	p := &RenderParams{
		Width:            w,
		Height:           h,
		Title:            m["title"],
		Subtitle:         m["subtitle"],
		BgColor:          m["bg_color"],
		BgImage:          m["bg_image"],
		TitleColor:       m["title_color"],
		SubtitleColor:    m["subtitle_color"],
		Logo:             m["logo"],
		LogoPosition:     m["logo_position"],
		FeatureImage:     m["feature_image"],
		Image1:           m["image_1"],
		Image2:           m["image_2"],
		Overlay:          m["overlay"],
		WatermarkURL:     m["watermark_url"],
		WatermarkOpacity: m["watermark_opacity"],
		Extra:            make(map[string]string),
	}
	known := map[string]bool{
		"title": true, "subtitle": true, "bg_color": true, "bg_image": true,
		"title_color": true, "subtitle_color": true, "logo": true, "logo_position": true,
		"feature_image": true, "image_1": true, "image_2": true, "overlay": true,
		"watermark_url": true, "watermark_opacity": true, "width": true, "height": true,
		"layout": true, "size": true, "brand": true, "t": true, "d": true,
	}
	for k, v := range m {
		if !known[k] {
			p.Extra[k] = v
		}
	}
	return p
}

func intToStr(n int) string {
	if n == 0 {
		return "0"
	}
	s := ""
	neg := false
	if n < 0 {
		neg = true
		n = -n
	}
	for n > 0 {
		s = string(rune('0'+n%10)) + s
		n /= 10
	}
	if neg {
		s = "-" + s
	}
	return s
}
