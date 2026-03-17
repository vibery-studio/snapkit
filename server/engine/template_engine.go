package engine

import (
	"regexp"
	"strings"
)

var (
	placeholderRe = regexp.MustCompile(`\{\{(\w+)\}\}`)
	scriptRe      = regexp.MustCompile(`(?is)<script[\s\S]*?</script>`)
)

// RenderCustomLayout replaces {{key}} placeholders in HTML with values from params.
// Strips script tags for XSS prevention.
func RenderCustomLayout(html, css string, params map[string]string) string {
	result := scriptRe.ReplaceAllString(html, "")
	result = placeholderRe.ReplaceAllStringFunc(result, func(match string) string {
		key := match[2 : len(match)-2]
		if v, ok := params[key]; ok {
			return v
		}
		return ""
	})
	if css != "" {
		return "<style>" + css + "</style>" + result
	}
	return result
}

// PageShell wraps thumbnail HTML in a full page with font loading
func PageShell(thumbnailHTML string) string {
	var b strings.Builder
	b.WriteString(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=TikTok+Sans:wght@400;600;700&family=Google+Sans:wght@400;500;700&display=block" />
  <style>
    @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-Bold.woff2') format('woff2'); font-weight: 700; font-display: block; }
    @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-ExtraBold.woff2') format('woff2'); font-weight: 800; font-display: block; }
    @font-face { font-family: 'Be Vietnam Pro'; src: url('/fonts/BeVietnamPro-Regular.woff2') format('woff2'); font-weight: 400; font-display: block; }
    @font-face { font-family: 'Be Vietnam Pro'; src: url('/fonts/BeVietnamPro-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: block; }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #000; }
  </style>
</head>
<body>
  `)
	b.WriteString(thumbnailHTML)
	b.WriteString(`
  <script>
    (function() {
      var images = document.querySelectorAll('img');
      var bgImages = [];
      document.querySelectorAll('[style*="background-image"]').forEach(function(el) {
        var match = el.style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && match[1]) bgImages.push(match[1]);
      });
      var pending = images.length + bgImages.length;
      if (pending === 0) { document.body.classList.add('ready'); return; }
      function done() { if (--pending <= 0) document.body.classList.add('ready'); }
      images.forEach(function(img) {
        if (img.complete) done();
        else { img.onload = done; img.onerror = done; }
      });
      bgImages.forEach(function(src) {
        var img = new Image();
        img.onload = done;
        img.onerror = done;
        img.src = src;
      });
      setTimeout(function() { document.body.classList.add('ready'); }, 5000);
    })();
  </script>
</body>
</html>`)
	return b.String()
}
