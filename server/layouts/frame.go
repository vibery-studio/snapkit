package layouts

import (
	"fmt"
	"math"
	"snapkit/engine"
	"snapkit/models"
)

func frame() *BuiltinLayout {
	return &BuiltinLayout{
		Info: models.LayoutInfo{
			ID:         "frame",
			Name:       "Frame",
			Categories: []string{"landscape", "square", "portrait", "wide"},
			Params: []models.LayoutParam{
				{Key: "feature_image", Type: "image", Label: "Feature Image", Required: true, Searchable: true},
				{Key: "frame_color", Type: "color", Label: "Frame Color"},
				{Key: "logo_position", Type: "select", Label: "Logo Position", Options: []string{"top-left", "top-right", "bottom-left", "bottom-right"}},
			},
		},
		Render: func(p *engine.RenderParams) string {
			imgURL := engine.SanitizeURLForCSS(p.FeatureImage)
			frameColor := engine.SanitizeColor(p.Get("frame_color"), "#FFD700")
			logoPos := p.LogoPosition
			if logoPos == "" {
				logoPos = "bottom-right"
			}

			inset := int(math.Round(float64(min(p.Width, p.Height)) * 0.03))

			logoCorner := map[string]string{
				"top-left":     "top:calc(3% + 1em);left:calc(3% + 1em)",
				"top-right":    "top:calc(3% + 1em);right:calc(3% + 1em)",
				"bottom-left":  "bottom:calc(3% + 1em);left:calc(3% + 1em)",
				"bottom-right": "bottom:calc(3% + 1em);right:calc(3% + 1em)",
			}
			posStyle := logoCorner[logoPos]
			if posStyle == "" {
				posStyle = logoCorner["bottom-right"]
			}

			safeLogo := engine.SanitizeURLForCSS(p.Logo)
			logoHTML := ""
			if safeLogo != "" {
				logoHTML = fmt.Sprintf(`<img src="%s" alt="logo" style="position:absolute;%s;height:8%%;max-width:25%%;object-fit:contain;z-index:3;" crossorigin="anonymous" onerror="this.style.display='none'" />`, safeLogo, posStyle)
			}
			wmHTML := engine.WatermarkHTML(p.WatermarkURL, p.WatermarkOpacity)

			hasImg := engine.HasImage(imgURL)
			imgHTML := ""
			bgColor := "#ddd"
			if hasImg {
				imgHTML = fmt.Sprintf(`<img src="%s" alt="" style="position:absolute;inset:0;width:100%%;height:100%%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.display='none'" />`, imgURL)
				bgColor = "#000"
			}

			return fmt.Sprintf(`<div id="thumbnail" style="width:%dpx;height:%dpx;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;background:%s;">
  %s
  <div style="position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 %dpx %s;z-index:2;"></div>
  %s
  %s
</div>`, p.Width, p.Height, bgColor, imgHTML, inset, frameColor, logoHTML, wmHTML)
		},
	}
}
