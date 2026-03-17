package layouts

import (
	"fmt"
	"snapkit/engine"
	"snapkit/models"
)

func overlayBottom() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "overlay-bottom",
			Name:       "Overlay Bottom",
			Categories: []string{"landscape", "square"},
			Params: []models.LayoutParam{
				{Key: "title", Type: "text", Label: "Title", Required: true},
				{Key: "subtitle", Type: "text", Label: "Subtitle"},
				{Key: "bg_image", Type: "image", Label: "Background Image", Required: true, Searchable: true},
				{Key: "bg_color", Type: "color", Label: "Fallback Background Color"},
				{Key: "title_color", Type: "color", Label: "Title Color"},
				{Key: "bar_color", Type: "color", Label: "Bar Background Color"},
			},
		},
		Render: func(p *engine.RenderParams) string {
			fallbackBg := engine.SanitizeColor(p.BgColor, "#1a1a3e")
			titleColor := engine.SanitizeColor(p.TitleColor, "#FFFFFF")
			barColor := engine.SanitizeColor(p.Get("bar_color"), "#000000")
			title := engine.EscapeHTML(p.Title)
			subtitle := engine.EscapeHTML(p.Subtitle)

			safeBg := engine.SanitizeURLForCSS(p.BgImage)
			bgStyle := fmt.Sprintf("background:%s", fallbackBg)
			if safeBg != "" {
				bgStyle = fmt.Sprintf("background:url('%s') center/cover no-repeat", safeBg)
			}

			logoHTML := engine.LogoHTML(p.Logo, p.LogoPosition, "8%", "25%")
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)

			subtitleHTML := ""
			if subtitle != "" {
				subtitleHTML = fmt.Sprintf(`<p style="position:relative;color:%s;font-weight:400;font-size:clamp(0.7rem,2vw,1.2rem);margin:0.4em 0 0;opacity:0.85;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">%s</p>`, titleColor, subtitle)
			}

			return fmt.Sprintf(`<div id="thumbnail" style="width:%dpx;height:%dpx;%s;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">
  %s
  <div style="position:absolute;bottom:0;left:0;right:0;height:30%%;padding:0 6%%;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;">
    <div style="position:absolute;inset:0;background:%s;opacity:0.88;"></div>
    <h1 style="position:relative;color:%s;font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.2;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">%s</h1>
    %s
  </div>
  %s
</div>`, p.Width, p.Height, bgStyle, logoHTML, barColor, titleColor, title, subtitleHTML, wmHTML)
		},
	}
}
