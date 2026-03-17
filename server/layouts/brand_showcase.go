package layouts

import (
	"fmt"
	"math"
	"strings"

	"snapkit/engine"
	"snapkit/models"
)

func brandShowcase() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "brand-showcase",
			Name:       "Brand Showcase",
			Categories: []string{"square", "portrait"},
			Params: []models.LayoutParam{
				{Key: "title", Type: "text", Label: "Title", Required: true},
				{Key: "cta_text", Type: "text", Label: "CTA Button Text"},
				{Key: "footer_text", Type: "text", Label: "Footer (contact info)"},
				{Key: "feature_image", Type: "image", Label: "Feature Image", Required: true, Searchable: true},
				{Key: "frame_image", Type: "image", Label: "Frame Overlay Image"},
				{Key: "accent_color", Type: "color", Label: "Accent/CTA Color"},
			},
		},
		Render: func(p *engine.RenderParams) string {
			w, h := p.Width, p.Height
			titleColor := engine.SanitizeColor(p.TitleColor, "#FFFFFF")
			accentColor := engine.SanitizeColor(p.Get("accent_color"), "#fc7400")
			title := engine.EscapeHTML(p.Title)
			ctaText := engine.EscapeHTML(p.Get("cta_text"))
			footerText := engine.EscapeHTML(p.Get("footer_text"))
			featureImg := engine.SanitizeURLForCSS(p.FeatureImage)
			frameImg := engine.SanitizeURLForCSS(p.Get("frame_image"))
			safeLogo := engine.SanitizeURLForCSS(p.Logo)
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)
			font := p.Get("font_heading")
			if font == "" {
				font = "Google Sans"
			}

			s := float64(h) / 1080.0
			r := func(v float64) int { return int(math.Round(v * s)) }

			logoPos := p.LogoPosition
			if logoPos == "" {
				logoPos = "top-left"
			}
			logoPosMap := map[string]string{
				"top-left":     fmt.Sprintf("top:%dpx;left:%dpx", r(40), r(42)),
				"top-right":    fmt.Sprintf("top:%dpx;right:%dpx", r(40), r(42)),
				"bottom-left":  fmt.Sprintf("bottom:%dpx;left:%dpx", r(40), r(42)),
				"bottom-right": fmt.Sprintf("bottom:%dpx;right:%dpx", r(40), r(42)),
			}
			logoPosStyle := logoPosMap[logoPos]
			if logoPosStyle == "" {
				logoPosStyle = logoPosMap["top-left"]
			}

			logoHTML := ""
			if safeLogo != "" {
				logoHTML = fmt.Sprintf(`<img src="%s" alt="" style="position:absolute;%s;height:%dpx;max-width:%dpx;object-fit:contain;z-index:3;" onerror="this.style.display='none'" />`,
					safeLogo, logoPosStyle, r(100), int(math.Round(float64(w)*0.4)))
			}

			ctaHTML := ""
			if ctaText != "" {
				ctaHTML = fmt.Sprintf(`<div style="position:absolute;top:%dpx;left:%dpx;z-index:3;">
          <span style="display:inline-block;background:%s;color:#FFFFFF;font-family:'%s',sans-serif;font-weight:700;font-size:%dpx;padding:%dpx %dpx;border-radius:%dpx;letter-spacing:0.5px;">%s</span>
        </div>`, r(698), r(42), accentColor, font, r(28), r(18), r(56), r(6), ctaText)
			}

			// Footer with inline SVG icons
			phoneSvg := fmt.Sprintf(`<svg viewBox="0 0 24 24" style="width:%dpx;height:%dpx;fill:%s;flex-shrink:0;"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`, r(18), r(18), titleColor)
			emailSvg := fmt.Sprintf(`<svg viewBox="0 0 24 24" style="width:%dpx;height:%dpx;fill:%s;flex-shrink:0;"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`, r(18), r(18), titleColor)
			webSvg := fmt.Sprintf(`<svg viewBox="0 0 24 24" style="width:%dpx;height:%dpx;flex-shrink:0;"><circle cx="12" cy="12" r="10" fill="none" stroke="%s" stroke-width="2"/><path d="M2 12h20M12 2c2.5 2.5 4 5.5 4 10s-1.5 7.5-4 10c-2.5-2.5-4-5.5-4-10s1.5-7.5 4-10z" fill="none" stroke="%s" stroke-width="1.5"/></svg>`, r(18), r(18), titleColor, titleColor)

			footerHTML := ""
			if footerText != "" {
				lines := strings.Split(footerText, "\n")
				icons := []string{phoneSvg, emailSvg, webSvg}
				var footerLines strings.Builder
				for i, line := range lines {
					line = strings.TrimSpace(line)
					if line == "" {
						continue
					}
					icon := ""
					if i < len(icons) {
						icon = icons[i]
					}
					footerLines.WriteString(fmt.Sprintf(`<div style="display:flex;align-items:center;gap:%dpx;">%s%s</div>`, r(10), icon, engine.EscapeHTML(line)))
				}
				footerHTML = fmt.Sprintf(`<div style="position:absolute;top:%dpx;left:%dpx;width:%dpx;z-index:3;color:%s;font-size:%dpx;line-height:2;font-family:'%s',sans-serif;">%s</div>`,
					r(818), r(42), r(460), titleColor, r(20), font, footerLines.String())
			}

			frameHTML := ""
			if frameImg != "" {
				frameHTML = fmt.Sprintf(`<img src="%s" alt="" style="position:absolute;top:0;left:0;height:100%%;z-index:1;" />`, frameImg)
			}

			featureBg := `<div style="position:absolute;inset:0;background:#333;"></div>`
			if featureImg != "" {
				featureBg = fmt.Sprintf(`<img src="%s" alt="" style="position:absolute;top:0;left:0;width:100%%;height:100%%;object-fit:cover;" />`, featureImg)
			}

			return fmt.Sprintf(`<div id="thumbnail" style="position:relative;width:%dpx;height:%dpx;overflow:hidden;font-family:'%s',sans-serif;">
  %s
  %s
  %s
  <div style="position:absolute;top:%dpx;left:%dpx;width:%dpx;z-index:3;">
    <h1 style="margin:0;font-weight:700;font-size:%dpx;line-height:1.22;color:%s;font-family:'%s',sans-serif;">%s</h1>
  </div>
  %s
  %s
  %s
</div>`, w, h, font, featureBg, frameHTML, logoHTML, r(250), r(42), r(440), r(54), titleColor, font, title, ctaHTML, footerHTML, wmHTML)
		},
	}
}
