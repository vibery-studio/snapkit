package layouts

import (
	"fmt"
	"snapkit/engine"
	"snapkit/models"
)

func collage2() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "collage-2",
			Name:       "Collage 2",
			Categories: []string{"landscape"},
			Params: []models.LayoutParam{
				{Key: "title", Type: "text", Label: "Title", Required: true},
				{Key: "image_1", Type: "image", Label: "Image 1", Required: true, Searchable: true},
				{Key: "image_2", Type: "image", Label: "Image 2", Required: true, Searchable: true},
				{Key: "bg_color", Type: "color", Label: "Background Color"},
				{Key: "title_color", Type: "color", Label: "Title Color"},
			},
		},
		Render: func(p *engine.RenderParams) string {
			bg := engine.SanitizeColor(p.BgColor, "#111111")
			titleColor := engine.SanitizeColor(p.TitleColor, "#FFFFFF")
			title := engine.EscapeHTML(p.Title)
			img1 := engine.SanitizeURLForCSS(p.Image1)
			img2 := engine.SanitizeURLForCSS(p.Image2)

			safeLogo := engine.SanitizeURLForCSS(p.Logo)
			logoHTML := ""
			if safeLogo != "" {
				logoHTML = fmt.Sprintf(`<img src="%s" alt="logo" style="position:absolute;%s;height:9%%;max-width:25%%;object-fit:contain;z-index:2;" crossorigin="anonymous" onerror="this.style.display='none'" />`, safeLogo, engine.LogoPositionStyle(p.LogoPosition))
			}
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)

			img1Tag := ""
			if engine.HasImage(img1) {
				img1Tag = fmt.Sprintf(`<img src="%s" alt="" style="width:100%%;height:100%%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.display='none'" />`, img1)
			}
			img2Tag := ""
			if engine.HasImage(img2) {
				img2Tag = fmt.Sprintf(`<img src="%s" alt="" style="width:100%%;height:100%%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.display='none'" />`, img2)
			}

			return fmt.Sprintf(`<div id="thumbnail" style="width:%dpx;height:%dpx;background:%s;display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  %s
  <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:2%%;padding:3%% 5%%;box-sizing:border-box;overflow:hidden;">
    <div style="width:46%%;height:100%%;overflow:hidden;border-radius:4px;background:#333;">
      %s
    </div>
    <div style="width:46%%;height:100%%;overflow:hidden;border-radius:4px;background:#333;">
      %s
    </div>
  </div>
  <div style="height:22%%;display:flex;align-items:center;justify-content:center;padding:0 6%%;box-sizing:border-box;border-top:2px solid rgba(255,255,255,0.1);">
    <h1 style="color:%s;font-weight:800;font-size:clamp(0.9rem,3vw,2rem);line-height:1.2;margin:0;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%%;">%s</h1>
  </div>
  %s
</div>`, p.Width, p.Height, bg, logoHTML, img1Tag, img2Tag, titleColor, title, wmHTML)
		},
	}
}
