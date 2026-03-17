package engine

import (
	"fmt"
	"regexp"
	"strings"
)

var hexColorRe = regexp.MustCompile(`^#[0-9A-Fa-f]{6}$`)

// EscapeHTML escapes HTML special characters
func EscapeHTML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, `"`, "&quot;")
	s = strings.ReplaceAll(s, "'", "&#39;")
	return s
}

// SanitizeColor returns color if valid hex, else fallback
func SanitizeColor(color, fallback string) string {
	if color == "" {
		return fallback
	}
	if hexColorRe.MatchString(color) {
		return color
	}
	return fallback
}

// SanitizeURLForCSS prevents CSS injection via url()
func SanitizeURLForCSS(url string) string {
	if url == "" {
		return ""
	}
	// Remove dangerous characters
	sanitized := strings.NewReplacer("'", "", `"`, "", "(", "", ")", "", `\`, "").Replace(url)
	// Only allow http/https/data URLs or relative paths
	if strings.HasPrefix(sanitized, "http://") || strings.HasPrefix(sanitized, "https://") ||
		strings.HasPrefix(sanitized, "data:") || strings.HasPrefix(sanitized, "/") {
		return sanitized
	}
	return ""
}

// GetOverlayGradient returns CSS gradient for overlay level
func GetOverlayGradient(overlay string) string {
	switch overlay {
	case "light":
		return "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))"
	case "medium":
		return "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))"
	case "dark":
		return "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))"
	default:
		return "none"
	}
}

// LogoPositionStyle returns inline CSS for logo placement
func LogoPositionStyle(pos string) string {
	m := map[string]string{
		"top-left":     "top:5%;left:5%",
		"top-right":    "top:5%;right:5%",
		"bottom-left":  "bottom:5%;left:5%",
		"bottom-right": "bottom:5%;right:5%",
	}
	if s, ok := m[pos]; ok {
		return s
	}
	return m["top-right"]
}

// WatermarkHTML returns watermark img element or empty string
func WatermarkHTML(wmURL, opacity string) string {
	if wmURL == "" {
		return ""
	}
	safe := SanitizeURLForCSS(wmURL)
	if safe == "" {
		return ""
	}
	opMap := map[string]string{"light": "0.2", "medium": "0.4", "dark": "0.6"}
	opVal := opMap[opacity]
	if opVal == "" {
		opVal = "0.2"
	}
	return fmt.Sprintf(`<img src="%s" alt="" style="position:absolute;bottom:3%%;right:3%%;height:6%%;max-width:20%%;object-fit:contain;opacity:%s;pointer-events:none;z-index:10;" crossorigin="anonymous" onerror="this.style.display='none'" />`, safe, opVal)
}

// HasImage checks if URL is valid and not "undefined"/"null"
func HasImage(url string) bool {
	return url != "" && url != "undefined" && url != "null"
}

// LogoHTML returns logo img element
func LogoHTML(logo, position, height, maxWidth string) string {
	safe := SanitizeURLForCSS(logo)
	if safe == "" {
		return ""
	}
	if height == "" {
		height = "8%"
	}
	if maxWidth == "" {
		maxWidth = "25%"
	}
	return fmt.Sprintf(`<img src="%s" alt="logo" style="position:absolute;%s;height:%s;max-width:%s;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />`,
		safe, LogoPositionStyle(position), height, maxWidth)
}
