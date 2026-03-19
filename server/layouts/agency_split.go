package layouts

import (
	"fmt"
	"math"
	"snapkit/engine"
	"snapkit/models"
)

func agencySplit() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "agency-split",
			Name:       "Agency Split",
			Categories: []string{"landscape", "wide"},
			Params: []models.LayoutParam{
				{Key: "title", Type: "text", Label: "Title", Required: true},
				{Key: "subtitle", Type: "text", Label: "Subtitle"},
				{Key: "feature_image", Type: "image", Label: "Feature Image", Searchable: true},
			},
		},
		Render: func(p *engine.RenderParams) string {
			w, h := p.Width, p.Height
			bgColor := engine.SanitizeColor(p.BgColor, "#1a1a3e")
			titleColor := engine.SanitizeColor(p.TitleColor, "#FFD700")
			subtitleColor := engine.SanitizeColor(p.SubtitleColor, "#FFFFFF")
			title := engine.EscapeHTML(p.Title)
			subtitle := engine.EscapeHTML(p.Subtitle)
			featureImg := p.FeatureImage
			bgImg := p.BgImage
			if bgImg == "" {
				bgImg = "/brands/goha/bg/default-background.png"
			}
			logo := p.Logo
			logoPos := p.LogoPosition
			if logoPos == "" {
				logoPos = "top-right"
			}

			logoPosMap := map[string]string{
				"top-left":     "top:3%;left:3%",
				"top-right":    "top:3%;right:3%",
				"bottom-left":  "bottom:3%;left:3%",
				"bottom-right": "bottom:3%;right:3%",
			}

			imgW := int(math.Round(float64(w) * 0.48))
			imgH := int(math.Round(float64(h) * 0.85))
			imgTop := int(math.Round(float64(h) * 0.075))
			imgLeft := int(math.Round(float64(w) * 0.02))
			tintColor := bgColor + "40"
			titleSize := int(math.Round(float64(h) * 0.06))
			subSize := int(math.Round(float64(h) * 0.042))
			subMargin := int(math.Round(float64(h) * 0.02))

			featureHTML := ""
			if featureImg != "" {
				featureHTML = fmt.Sprintf(`<div style="position:absolute;top:%dpx;left:%dpx;width:%dpx;height:%dpx;border-radius:12px;overflow:hidden;">
    <img src="%s" alt="" style="width:100%%;height:100%%;object-fit:cover;" crossorigin="anonymous" onerror="this.parentElement.style.display='none'" />
    <div style="position:absolute;inset:0;background:%s;mix-blend-mode:multiply;pointer-events:none;"></div>
  </div>`, imgTop, imgLeft, imgW, imgH, featureImg, tintColor)
			}

			subtitleHTML := ""
			if subtitle != "" {
				subtitleHTML = fmt.Sprintf(`<p style="margin:%dpx 0 0;font-size:%dpx;color:%s;font-style:italic;">%s</p>`, subMargin, subSize, subtitleColor, subtitle)
			}

			logoHTML := ""
			if logo != "" {
				pos := logoPosMap[logoPos]
				if pos == "" {
					pos = logoPosMap["top-right"]
				}
				logoHTML = fmt.Sprintf(`<img src="%s" alt="logo" style="position:absolute;%s;height:7%%;max-width:15%%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />`, logo, pos)
			}

			return fmt.Sprintf(`<div id="thumbnail" style="position:relative;width:%dpx;height:%dpx;background:%s;overflow:hidden;font-family:'IBM Plex Sans',system-ui,sans-serif;">
  <div style="position:absolute;inset:0;background:url('%s') center/cover no-repeat;"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,%scc 0%%,%s99 50%%,%s66 100%%);mix-blend-mode:multiply;"></div>
  %s
  <div style="position:absolute;top:0;right:0;width:50%%;height:100%%;display:flex;flex-direction:column;justify-content:center;padding:0 4%% 0 2%%;">
    <h1 style="margin:0;font-size:%dpx;font-weight:600;line-height:1.25;color:%s;">%s</h1>
    %s
  </div>
  %s
</div>`, w, h, bgColor, bgImg, bgColor, bgColor, bgColor, featureHTML, titleSize, titleColor, title, subtitleHTML, logoHTML)
		},
	}
}
