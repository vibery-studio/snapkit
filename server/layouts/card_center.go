package layouts

import (
	"fmt"
	"snapkit/engine"
	"snapkit/models"
)

func cardCenter() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "card-center",
			Name:       "Card Center",
			Categories: []string{"square", "portrait"},
			Params: []models.LayoutParam{
				{Key: "title", Type: "text", Label: "Title", Required: true},
				{Key: "subtitle", Type: "text", Label: "Subtitle"},
				{Key: "feature_image", Type: "image", Label: "Feature Image", Required: true, Searchable: true},
				{Key: "bg_color", Type: "color", Label: "Panel Background Color"},
				{Key: "title_color", Type: "color", Label: "Title Color"},
			},
		},
		Render: func(p *engine.RenderParams) string {
			bg := engine.SanitizeColor(p.BgColor, "#1a1a3e")
			titleColor := engine.SanitizeColor(p.TitleColor, "#FFFFFF")
			title := engine.EscapeHTML(p.Title)
			subtitle := engine.EscapeHTML(p.Subtitle)
			imgURL := engine.SanitizeURLForCSS(p.FeatureImage)

			logoHTML := engine.LogoHTML(p.Logo, p.LogoPosition, "12%", "35%")
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)

			imgTag := ""
			if engine.HasImage(imgURL) {
				imgTag = fmt.Sprintf(`<img src="%s" alt="" style="width:100%%;height:100%%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.display='none'" />`, imgURL)
			}

			subtitleHTML := ""
			if subtitle != "" {
				subtitleHTML = fmt.Sprintf(`<p style="color:%s;font-weight:400;font-size:clamp(0.75rem,2vw,1.2rem);margin:0.5em 0 0;opacity:0.8;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">%s</p>`, titleColor, subtitle)
			}

			return fmt.Sprintf(`<div id="thumbnail" style="width:%dpx;height:%dpx;display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  <div style="width:100%%;height:60%%;position:relative;flex-shrink:0;overflow:hidden;background:#333;">
    %s
  </div>
  <div style="width:100%%;height:40%%;background:%s;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6%% 8%%;box-sizing:border-box;position:relative;">
    %s
    <h1 style="color:%s;font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.25;margin:0;overflow:hidden;text-overflow:ellipsis;">%s</h1>
    %s
  </div>
  %s
</div>`, p.Width, p.Height, imgTag, bg, logoHTML, titleColor, title, subtitleHTML, wmHTML)
		},
	}
}
