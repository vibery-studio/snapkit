package models

import "encoding/json"

// SizePreset defines banner dimensions
type SizePreset struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	W        int    `json:"w"`
	H        int    `json:"h"`
	Category string `json:"category"`
}

// BrandLogo is a single logo entry
type BrandLogo struct {
	ID   string `json:"id"`
	URL  string `json:"url"`
	Name string `json:"name"`
}

// BrandBackground is a single background entry
type BrandBackground struct {
	URL  string   `json:"url"`
	Tags []string `json:"tags"`
	Name string   `json:"name"`
}

// BrandWatermark optional watermark config
type BrandWatermark struct {
	URL            string `json:"url"`
	DefaultOpacity string `json:"default_opacity"`
}

// BrandColors holds brand color palette
type BrandColors struct {
	Primary   string `json:"primary"`
	Secondary string `json:"secondary"`
	Accent    string `json:"accent"`
	TextLight string `json:"text_light"`
	TextDark  string `json:"text_dark"`
}

// BrandFonts holds heading/body font families
type BrandFonts struct {
	Heading string `json:"heading"`
	Body    string `json:"body"`
}

// Brand is the full brand kit
type Brand struct {
	ID               string            `json:"id"`
	Name             string            `json:"name"`
	Slug             string            `json:"slug"`
	Colors           BrandColors       `json:"colors"`
	Fonts            BrandFonts        `json:"fonts"`
	Logos            []BrandLogo       `json:"logos"`
	Backgrounds      []BrandBackground `json:"backgrounds"`
	Watermark        *BrandWatermark   `json:"watermark"`
	DefaultTextColor string            `json:"default_text_color"`
	DefaultOverlay   string            `json:"default_overlay"`
	CreatedAt        string            `json:"created_at,omitempty"`
	UpdatedAt        string            `json:"updated_at,omitempty"`
}

// LayoutParam defines a configurable parameter for a layout
type LayoutParam struct {
	Key        string   `json:"key"`
	Type       string   `json:"type"`
	Label      string   `json:"label"`
	Required   bool     `json:"required,omitempty"`
	Options    []string `json:"options,omitempty"`
	Searchable bool     `json:"searchable,omitempty"`
}

// LayoutInfo is the serializable layout metadata (no render func)
type LayoutInfo struct {
	ID         string        `json:"id"`
	Name       string        `json:"name"`
	Categories []string      `json:"categories"`
	Params     []LayoutParam `json:"params"`
	Custom     bool          `json:"custom"`
	HTML       string        `json:"html,omitempty"`
	CSS        string        `json:"css,omitempty"`
}

// Design is a saved design configuration
type Design struct {
	ID        string            `json:"id"`
	CreatedAt string            `json:"created_at"`
	UpdatedAt string            `json:"updated_at"`
	Size      DesignSize        `json:"size"`
	Layout    string            `json:"layout"`
	Brand     string            `json:"brand"`
	Params    map[string]string `json:"params"`
	ForkedFrom string           `json:"forked_from,omitempty"`
}

// DesignSize holds preset + actual dimensions
type DesignSize struct {
	Preset string `json:"preset"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

// Template is a pre-configured layout+brand+size combo
type Template struct {
	ID               string            `json:"id"`
	Name             string            `json:"name"`
	Brand            string            `json:"brand,omitempty"`
	Layout           string            `json:"layout"`
	Size             string            `json:"size"`
	Params           map[string]string `json:"params"`
	AutoFeatureImage bool              `json:"auto_feature_image"`
	CreatedAt        string            `json:"created_at,omitempty"`
	UpdatedAt        string            `json:"updated_at,omitempty"`
}

// Media is an uploaded media item
type Media struct {
	ID          string   `json:"id"`
	Filename    string   `json:"filename"`
	ContentType string   `json:"content_type"`
	Size        int64    `json:"size"`
	Path        string   `json:"path"`
	URL         string   `json:"url"`
	Tags        []string `json:"tags"`
	CreatedAt   string   `json:"created_at"`
}

// MustJSON marshals v to JSON string, returns "{}" on error
func MustJSON(v interface{}) string {
	b, err := json.Marshal(v)
	if err != nil {
		return "{}"
	}
	return string(b)
}
