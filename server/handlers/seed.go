package handlers

import (
	"log"
	"time"

	"snapkit/db"
	"snapkit/models"
)

// SeedBrands upserts default brands and templates (safe to run repeatedly)
func SeedBrands() {
	log.Println("Syncing seed data...")
	now := time.Now().UTC().Format(time.RFC3339)

	brands := []models.Brand{
		{
			ID: "goha", Name: "GOHA", Slug: "goha",
			Colors:           models.BrandColors{Primary: "#1a1a3e", Secondary: "#FFD700", Accent: "#FF6B35", TextLight: "#FFFFFF", TextDark: "#1a1a3e"},
			Fonts:            models.BrandFonts{Heading: "Montserrat", Body: "Be Vietnam Pro"},
			Logos: []models.BrandLogo{
				{ID: "main", URL: "/brands/goha/logos/goha-logo-write.png", Name: "GOHA White"},
			},
			Backgrounds: []models.BrandBackground{
				{URL: "/brands/goha/bg/default-background.png", Tags: []string{"tech", "ai"}, Name: "Agency Default"},
			},
			DefaultTextColor: "#FFFFFF", DefaultOverlay: "dark",
		},
		{
			ID: "trungnguyen", Name: "Trung Nguyên", Slug: "trungnguyen",
			Colors:           models.BrandColors{Primary: "#a40000", Secondary: "#FFFFFF", Accent: "#fc7400", TextLight: "#FFFFFF", TextDark: "#a40000"},
			Fonts:            models.BrandFonts{Heading: "TikTok Sans", Body: "TikTok Sans"},
			Logos: []models.BrandLogo{
				{ID: "white", URL: "/brands/trungnguyen/logos/Logo_Original.png", Name: "Logo White (for dark bg)"},
				{ID: "main", URL: "/brands/trungnguyen/logos/logo.png", Name: "Logo Dark (for light bg)"},
				{ID: "white-alt", URL: "/brands/trungnguyen/logos/logo-white.png", Name: "Logo White Alt"},
			},
			Backgrounds: []models.BrandBackground{
				{URL: "/brands/trungnguyen/bg/template-thumbnail-2.png", Tags: []string{"industrial", "machinery"}, Name: "Template Thumbnail"},
				{URL: "/brands/trungnguyen/frame_left.png", Tags: []string{"frame", "overlay"}, Name: "Frame Left Overlay"},
			},
			DefaultTextColor: "#FFFFFF", DefaultOverlay: "dark",
		},
	}

	for _, b := range brands {
		_, err := db.DB.Exec(
			`INSERT INTO brands (id, name, slug, colors, fonts, logos, backgrounds, watermark, default_text_color, default_overlay, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)
			 ON CONFLICT(id) DO UPDATE SET
			   name=excluded.name, slug=excluded.slug, colors=excluded.colors, fonts=excluded.fonts,
			   logos=excluded.logos, backgrounds=excluded.backgrounds,
			   default_text_color=excluded.default_text_color, default_overlay=excluded.default_overlay,
			   updated_at=excluded.updated_at`,
			b.ID, b.Name, b.Slug,
			models.MustJSON(b.Colors), models.MustJSON(b.Fonts),
			models.MustJSON(b.Logos), models.MustJSON(b.Backgrounds),
			b.DefaultTextColor, b.DefaultOverlay, now, now,
		)
		if err != nil {
			log.Printf("Seed brand %s error: %v", b.ID, err)
		}
	}

	templates := []struct {
		ID, Name, Brand, Layout, Size string
		Params                        map[string]string
	}{
		{"agency-default", "Agency Default", "goha", "agency-split", "agency-wide", map[string]string{"title": "Your Headline Here", "subtitle": "Supporting text goes here", "feature_image": "/brands/goha/bg/default-background.png"}},
		{"overlay-dark", "Dark Overlay", "goha", "overlay-center", "fb-post", map[string]string{"title": "This is dark title", "subtitle": "This is subtitle", "title_color": "#FFFFFF", "subtitle_color": "#CCCCCC", "overlay": "dark"}},
		{"goha-corporate", "GOHA Corporate", "goha", "split-left", "og-image", map[string]string{"title": "Corporate Solutions", "subtitle": "Strategic Growth Partner", "bg_color": "#0f1629", "title_color": "#FFD700", "subtitle_color": "#FFFFFF"}},
		{"goha-minimal", "GOHA Minimal", "goha", "text-only", "ig-post", map[string]string{"title": "Simple. Elegant. Effective.", "bg_color": "#1a1a3e", "title_color": "#FFFFFF", "subtitle_color": "#FFD700"}},
		{"goha-professional", "GOHA Professional", "goha", "overlay-center", "yt-thumbnail", map[string]string{"title": "Professional Excellence", "subtitle": "Building Trust Through Quality", "bg_color": "#1a1a3e", "title_color": "#FFD700", "subtitle_color": "#FFFFFF", "overlay": "dark", "bg_image": "/brands/goha/bg/default-background.png"}},
		{"trungnguyen-showcase", "Trung Nguyên Showcase", "trungnguyen", "brand-showcase", "ig-post", map[string]string{"title": "Robot Máy Ép Nhựa – Xu Hướng Tự Động Hóa Ngành Nhựa", "cta_text": "XEM NGAY", "footer_text": "0986 403 790 – 098 210 3223\ndinhduong@trungnguyentw.com\ntrungnguyentw.com", "accent_color": "#fc7400", "title_color": "#FFFFFF", "frame_image": "/brands/trungnguyen/frame_left.png", "feature_image": "/brands/trungnguyen/sample_cover_2.jpg", "logo_scale": "1.5", "logo_offset_y": "60"}},
		{"trungnguyen-inner-frame", "Trung Nguyên Inner Frame", "trungnguyen", "inner-frame", "ig-post", map[string]string{"feature_image": "/brands/trungnguyen/inner-frame-default-v2.jpg", "frame_image": "/brands/trungnguyen/bottom-frame.png", "title": "0986 403 790 – 098 210 3223", "subtitle": "trungnguyentw.com"}},
	}

	for _, t := range templates {
		db.DB.Exec(
			`INSERT INTO templates (id, name, brand, layout, size, params, auto_feature_image, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
			 ON CONFLICT(id) DO UPDATE SET
			   name=excluded.name, brand=excluded.brand, layout=excluded.layout, size=excluded.size,
			   params=excluded.params, updated_at=excluded.updated_at`,
			t.ID, t.Name, t.Brand, t.Layout, t.Size, models.MustJSON(t.Params), now, now,
		)
	}
	log.Printf("Synced %d brands, %d templates", len(brands), len(templates))
}
