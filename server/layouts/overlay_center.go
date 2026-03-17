package layouts

import (
	"fmt"
	"snapkit/engine"
	"snapkit/models"
)

func overlayCenter() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "overlay-center",
			Name:       "Overlay Center",
			Categories: []string{"landscape", "square"},
			Params: []models.LayoutParam{
				{Key: "title", Type: "text", Label: "Title", Required: true},
				{Key: "subtitle", Type: "text", Label: "Subtitle"},
				{Key: "bg_color", Type: "color", Label: "Background Color"},
				{Key: "bg_image", Type: "image", Label: "Background Image", Searchable: true},
				{Key: "title_color", Type: "color", Label: "Title Color"},
				{Key: "subtitle_color", Type: "color", Label: "Subtitle Color"},
				{Key: "overlay", Type: "select", Label: "Overlay", Options: []string{"none", "light", "medium", "dark"}},
			},
		},
		Render: func(p *engine.RenderParams) string {
			bg := engine.SanitizeColor(p.BgColor, "#1a1a3e")
			titleColor := engine.SanitizeColor(p.TitleColor, "#FFD700")
			subColor := engine.SanitizeColor(p.SubtitleColor, "#FFFFFF")
			title := engine.EscapeHTML(p.Title)
			subtitle := engine.EscapeHTML(p.Subtitle)
			overlay := engine.GetOverlayGradient(p.Overlay)

			safeBg := engine.SanitizeURLForCSS(p.BgImage)
			bgStyle := fmt.Sprintf("background:%s", bg)
			if safeBg != "" {
				if overlay != "none" {
					bgStyle = fmt.Sprintf("background:%s,url('%s') center/cover no-repeat", overlay, safeBg)
				} else {
					bgStyle = fmt.Sprintf("background:url('%s') center/cover no-repeat", safeBg)
				}
			}

			logoHTML := engine.LogoHTML(p.Logo, p.LogoPosition, "8%", "")
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)

			subtitleHTML := ""
			if subtitle != "" {
				subtitleHTML = fmt.Sprintf(`<p style="color:%s;font-weight:500;font-size:clamp(0.9rem,2.5vw,1.8rem);margin-top:0.5em;padding:0 10%%;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">%s</p>`, subColor, subtitle)
			}

			return fmt.Sprintf(`<div id="thumbnail" style="width:%dpx;height:%dpx;%s;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">
  %s
  <h1 style="color:%s;font-weight:800;font-size:clamp(1.5rem,5vw,4rem);line-height:1.2;margin:0;padding:0 8%%;font-family:'Montserrat',sans-serif;">%s</h1>
  %s
  %s
</div>`, p.Width, p.Height, bgStyle, logoHTML, titleColor, title, subtitleHTML, wmHTML)
		},
	}
}
