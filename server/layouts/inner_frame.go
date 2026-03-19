package layouts

import (
	"fmt"
	"math"

	"snapkit/engine"
	"snapkit/models"
)

func innerFrame() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "inner-frame",
			Name:       "Inner Frame",
			Categories: []string{"square", "landscape", "portrait"},
			Params: []models.LayoutParam{
				{Key: "feature_image", Type: "image", Label: "Feature Image", Required: true, Searchable: true},
				{Key: "frame_image", Type: "image", Label: "Bottom Frame Overlay", Required: true},
			},
		},
		Render: func(p *engine.RenderParams) string {
			w, h := p.Width, p.Height
			featureImg := engine.SanitizeURLForCSS(p.FeatureImage)
			frameImg := engine.SanitizeURLForCSS(p.Get("frame_image"))
			// title = phone text, subtitle = website text
			phoneText := engine.EscapeHTML(p.Title)
			websiteText := engine.EscapeHTML(p.Subtitle)
			safeLogo := engine.SanitizeURLForCSS(p.Logo)
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)

			s := float64(h) / 1080.0
			r := func(v float64) int { return int(math.Round(v * s)) }

			// Feature image background
			featureBg := `<div style="position:absolute;inset:0;background:#333;"></div>`
			if engine.HasImage(featureImg) {
				featureBg = fmt.Sprintf(`<img src="%s" alt="" style="position:absolute;top:0;left:0;width:100%%;height:100%%;object-fit:cover;" crossorigin="anonymous" onerror="this.style.display='none'" />`, featureImg)
			}

			// Frame overlay at bottom
			frameHTML := ""
			if frameImg != "" {
				frameHTML = fmt.Sprintf(`<img src="%s" alt="" style="position:absolute;bottom:0;left:0;width:100%%;height:%dpx;object-fit:fill;z-index:1;" crossorigin="anonymous" onerror="this.style.display='none'" />`, frameImg, r(200))
			}

			// Logo bottom-left on bar
			logoHTML := ""
			if safeLogo != "" {
				logoHTML = fmt.Sprintf(`<img src="%s" alt="logo" style="position:absolute;bottom:%dpx;left:%dpx;height:%dpx;max-width:%dpx;object-fit:contain;z-index:3;" crossorigin="anonymous" onerror="this.style.display='none'" />`,
					safeLogo, r(25), r(30), r(110), int(math.Round(float64(w)*0.22)))
			}

			// Phone icon + text (from title field)
			phoneSvg := fmt.Sprintf(`<svg viewBox="0 0 24 24" style="width:%dpx;height:%dpx;fill:#FFFFFF;flex-shrink:0;"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`, r(24), r(24))
			phoneHTML := ""
			if phoneText != "" {
				phoneHTML = fmt.Sprintf(`<div style="display:flex;align-items:center;gap:%dpx;white-space:nowrap;">%s<span>%s</span></div>`, r(8), phoneSvg, phoneText)
			}

			// Globe icon + website (from subtitle field)
			webSvg := fmt.Sprintf(`<svg viewBox="0 0 24 24" style="width:%dpx;height:%dpx;flex-shrink:0;"><circle cx="12" cy="12" r="10" fill="none" stroke="#FFFFFF" stroke-width="2"/><path d="M2 12h20M12 2c2.5 2.5 4 5.5 4 10s-1.5 7.5-4 10c-2.5-2.5-4-5.5-4-10s1.5-7.5 4-10z" fill="none" stroke="#FFFFFF" stroke-width="1.5"/></svg>`, r(24), r(24))
			webHTML := ""
			if websiteText != "" {
				webHTML = fmt.Sprintf(`<div style="display:flex;align-items:center;gap:%dpx;white-space:nowrap;">%s<span>%s</span></div>`, r(8), webSvg, websiteText)
			}

			// Contact bar — 3-column grid on the frame
			contactHTML := ""
			if phoneHTML != "" || webHTML != "" {
				contactHTML = fmt.Sprintf(`<div style="position:absolute;bottom:0;left:0;right:0;height:%dpx;display:grid;grid-template-columns:%dpx 1fr auto;align-items:center;z-index:3;color:#FFFFFF;font-family:'TikTok Sans','Be Vietnam Pro',sans-serif;font-size:%dpx;font-weight:600;">
  <div></div>
  <div style="display:flex;justify-content:center;">%s</div>
  <div style="padding-right:%dpx;">%s</div>
</div>`,
					r(160), int(math.Round(float64(w)*0.25)), r(22), phoneHTML, r(30), webHTML)
			}

			return fmt.Sprintf(`<div id="thumbnail" style="position:relative;width:%dpx;height:%dpx;overflow:hidden;">
  %s
  %s
  %s
  %s
  %s
</div>`, w, h, featureBg, frameHTML, logoHTML, contactHTML, wmHTML)
		},
	}
}
