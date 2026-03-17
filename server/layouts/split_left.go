package layouts

import (
	"fmt"
	"snapkit/engine"
	"snapkit/models"
)

func splitLeft() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "split-left",
			Name:       "Split Left",
			Categories: []string{"landscape"},
			Params: []models.LayoutParam{
				{Key: "title", Type: "text", Label: "Title", Required: true},
				{Key: "subtitle", Type: "text", Label: "Subtitle"},
				{Key: "feature_image", Type: "image", Label: "Feature Image", Required: true, Searchable: true},
				{Key: "bg_color", Type: "color", Label: "Panel Background Color"},
				{Key: "title_color", Type: "color", Label: "Title Color"},
				{Key: "accent_color", Type: "color", Label: "Accent Color"},
			},
		},
		Render: func(p *engine.RenderParams) string {
			bg := engine.SanitizeColor(p.BgColor, "#1a1a3e")
			titleColor := engine.SanitizeColor(p.TitleColor, "#FFFFFF")
			accentColor := engine.SanitizeColor(p.Get("accent_color"), "#FFD700")
			title := engine.EscapeHTML(p.Title)
			subtitle := engine.EscapeHTML(p.Subtitle)
			imgURL := engine.SanitizeURLForCSS(p.FeatureImage)

			logoHTML := engine.LogoHTML(p.Logo, p.LogoPosition, "10%", "30%")
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)

			imgTag := ""
			if engine.HasImage(imgURL) {
				imgTag = fmt.Sprintf(`<img src="%s" alt="" style="width:100%%;height:100%%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.display='none'" />`, imgURL)
			}

			subtitleHTML := ""
			if subtitle != "" {
				subtitleHTML = fmt.Sprintf(`<p style="color:%s;font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">%s</p>`, accentColor, subtitle)
			}

			accentBar := fmt.Sprintf(`<div style="width:3em;height:4px;background:%s;margin-bottom:1em;border-radius:2px;"></div>`, accentColor)

			return fmt.Sprintf(`<div id="thumbnail" style="width:%dpx;height:%dpx;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  <div style="width:50%%;height:100%%;flex-shrink:0;overflow:hidden;background:#333;">
    %s
  </div>
  <div style="width:50%%;height:100%%;background:%s;display:flex;flex-direction:column;justify-content:center;padding:8%%;box-sizing:border-box;position:relative;">
    %s
    %s
    <h1 style="color:%s;font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;overflow:hidden;text-overflow:ellipsis;">%s</h1>
    %s
  </div>
  %s
</div>`, p.Width, p.Height, imgTag, bg, logoHTML, accentBar, titleColor, title, subtitleHTML, wmHTML)
		},
	}
}
