package layouts

import (
	"fmt"
	"snapkit/engine"
	"snapkit/models"
)

func textOnly() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "text-only",
			Name:       "Text Only",
			Categories: []string{"landscape", "square", "portrait", "wide"},
			Params: []models.LayoutParam{
				{Key: "title", Type: "text", Label: "Title", Required: true},
				{Key: "subtitle", Type: "text", Label: "Subtitle"},
				{Key: "bg_image", Type: "image", Label: "Background Image", Searchable: true},
				{Key: "overlay", Type: "select", Label: "Overlay", Options: []string{"none", "light", "medium", "dark"}},
				{Key: "bg_color", Type: "color", Label: "Background Color"},
				{Key: "gradient_end", Type: "color", Label: "Gradient End Color"},
				{Key: "title_color", Type: "color", Label: "Title Color"},
				{Key: "subtitle_color", Type: "color", Label: "Subtitle Color"},
			},
		},
		Render: func(p *engine.RenderParams) string {
			bgStart := engine.SanitizeColor(p.BgColor, "#1a1a3e")
			titleColor := engine.SanitizeColor(p.TitleColor, "#FFFFFF")
			subColor := engine.SanitizeColor(p.SubtitleColor, "#FFD700")
			gradientEnd := engine.SanitizeColor(p.Get("gradient_end"), "")
			title := engine.EscapeHTML(p.Title)
			subtitle := engine.EscapeHTML(p.Subtitle)
			safeBg := engine.SanitizeURLForCSS(p.BgImage)
			overlay := engine.GetOverlayGradient(p.Overlay)

			var bgStyle string
			if engine.HasImage(safeBg) {
				if overlay != "none" {
					bgStyle = fmt.Sprintf("background:%s,url('%s') center/cover no-repeat", overlay, safeBg)
				} else {
					bgStyle = fmt.Sprintf("background:url('%s') center/cover no-repeat", safeBg)
				}
			} else if gradientEnd != "" {
				bgStyle = fmt.Sprintf("background:linear-gradient(135deg, %s 0%%, %s 100%%)", bgStart, gradientEnd)
			} else {
				bgStyle = fmt.Sprintf("background:%s", bgStart)
			}

			logoHTML := ""
			if p.Logo != "" {
				logoHTML = fmt.Sprintf(`<img src="%s" alt="logo" style="position:absolute;%s;height:8%%;max-width:25%%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />`, p.Logo, engine.LogoPositionStyle(p.LogoPosition))
			}
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)

			subtitleHTML := ""
			if subtitle != "" {
				subtitleHTML = fmt.Sprintf(`<p style="color:%s;font-weight:500;font-size:clamp(0.85rem,2.5vw,1.6rem);margin:0.6em 0 0;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">%s</p>`, subColor, subtitle)
			}

			return fmt.Sprintf(`<div id="thumbnail" style="width:%dpx;height:%dpx;%s;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;padding:8%%;box-sizing:border-box;">
  %s
  <h1 style="color:%s;font-weight:900;font-size:clamp(1.5rem,6vw,4.5rem);line-height:1.15;margin:0;letter-spacing:-0.02em;overflow:hidden;text-overflow:ellipsis;">%s</h1>
  %s
  %s
</div>`, p.Width, p.Height, bgStyle, logoHTML, titleColor, title, subtitleHTML, wmHTML)
		},
	}
}
