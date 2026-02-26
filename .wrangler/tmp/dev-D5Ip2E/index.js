var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/lib/response-helpers.ts
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(jsonResponse, "jsonResponse");
function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(htmlResponse, "htmlResponse");
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}
__name(errorResponse, "errorResponse");
function notFoundResponse(message = "Not found") {
  return errorResponse(message, 404);
}
__name(notFoundResponse, "notFoundResponse");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}
__name(corsHeaders, "corsHeaders");
function corsResponse() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
__name(corsResponse, "corsResponse");

// src/data/size-presets.ts
var SIZE_PRESETS = [
  // Landscape (~16:9, 1.91:1)
  { id: "fb-post", name: "Facebook Post", w: 1200, h: 630, category: "landscape" },
  { id: "og-image", name: "OG Image", w: 1200, h: 630, category: "landscape" },
  { id: "zalo-post", name: "Zalo Post", w: 1200, h: 630, category: "landscape" },
  { id: "tw-post", name: "Twitter/X Post", w: 1200, h: 675, category: "landscape" },
  { id: "yt-thumbnail", name: "YouTube Thumbnail", w: 1280, h: 720, category: "landscape" },
  { id: "blog-hero", name: "Blog Hero", w: 1600, h: 900, category: "landscape" },
  { id: "ig-landscape", name: "Instagram Landscape", w: 1080, h: 566, category: "landscape" },
  // Square (1:1)
  { id: "ig-post", name: "Instagram Post", w: 1080, h: 1080, category: "square" },
  // Portrait (9:16)
  { id: "fb-story", name: "Facebook Story", w: 1080, h: 1920, category: "portrait" },
  { id: "ig-story", name: "Instagram Story", w: 1080, h: 1920, category: "portrait" },
  // Wide (ultra-wide)
  { id: "fb-cover", name: "Facebook Cover", w: 1640, h: 924, category: "wide" },
  { id: "yt-banner", name: "YouTube Banner", w: 2560, h: 1440, category: "wide" }
];
function getSizeById(id) {
  return SIZE_PRESETS.find((s) => s.id === id);
}
__name(getSizeById, "getSizeById");

// src/data/brand-kits.ts
var BRANDS = {
  goha: {
    id: "goha",
    name: "GOHA",
    slug: "goha",
    colors: {
      primary: "#1a1a3e",
      secondary: "#FFD700",
      accent: "#FF6B35",
      text_light: "#FFFFFF",
      text_dark: "#1a1a3e"
    },
    fonts: { heading: "Montserrat", body: "Be Vietnam Pro" },
    logos: [
      { id: "main", url: "/brands/goha/logos/goha-white.svg", name: "GOHA White" },
      { id: "dark", url: "/brands/goha/logos/goha-dark.png", name: "GOHA Dark" },
      { id: "icon", url: "/brands/goha/logos/goha-icon.png", name: "GOHA Icon" }
    ],
    backgrounds: [
      { url: "/brands/goha/bg/circuit-board.png", tags: ["tech", "ai"], name: "Circuit Board" },
      { url: "/brands/goha/bg/data-flow.png", tags: ["tech", "data"], name: "Data Flow" }
    ],
    watermark: {
      url: "/brands/goha/watermark.png",
      default_opacity: "light"
    },
    default_text_color: "#FFFFFF",
    default_overlay: "dark"
  },
  tonyfriends: {
    id: "tonyfriends",
    name: "Tony's Friends",
    slug: "tonyfriends",
    colors: {
      primary: "#2D3436",
      secondary: "#00B894",
      accent: "#FDCB6E",
      text_light: "#FFFFFF",
      text_dark: "#2D3436"
    },
    fonts: { heading: "Montserrat", body: "Be Vietnam Pro" },
    logos: [
      { id: "main", url: "/brands/tonyfriends/logos/tonyfriends-white.svg", name: "Tony's Friends White" }
    ],
    backgrounds: [],
    watermark: {
      url: "/brands/tonyfriends/watermark.png",
      default_opacity: "light"
    },
    default_text_color: "#FFFFFF",
    default_overlay: "medium"
  },
  vibery: {
    id: "vibery",
    name: "Vibery",
    slug: "vibery",
    colors: {
      primary: "#6C5CE7",
      secondary: "#A29BFE",
      accent: "#FD79A8",
      text_light: "#FFFFFF",
      text_dark: "#2D3436"
    },
    fonts: { heading: "Montserrat", body: "Be Vietnam Pro" },
    logos: [
      { id: "main", url: "/brands/vibery/logos/vibery-white.svg", name: "Vibery White" }
    ],
    backgrounds: [],
    watermark: {
      url: "/brands/vibery/watermark.png",
      default_opacity: "light"
    },
    default_text_color: "#FFFFFF",
    default_overlay: "dark"
  }
};
var BRAND_IDS = Object.keys(BRANDS);
function getBrandById(id) {
  return BRANDS[id];
}
__name(getBrandById, "getBrandById");

// src/lib/html-helpers.ts
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c] || c);
}
__name(escapeHtml, "escapeHtml");
function isValidHexColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
__name(isValidHexColor, "isValidHexColor");
function sanitizeColor(color, fallback) {
  if (!color) return fallback;
  return isValidHexColor(color) ? color : fallback;
}
__name(sanitizeColor, "sanitizeColor");
function getOverlayGradient(overlay) {
  switch (overlay) {
    case "light":
      return "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))";
    case "medium":
      return "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))";
    case "dark":
      return "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))";
    default:
      return "none";
  }
}
__name(getOverlayGradient, "getOverlayGradient");
function sanitizeUrlForCss(url) {
  if (!url) return "";
  const sanitized = url.replace(/['"()\\]/g, "");
  if (/^(https?:\/\/|data:|\/)/i.test(sanitized)) {
    return sanitized;
  }
  return "";
}
__name(sanitizeUrlForCss, "sanitizeUrlForCss");

// src/layouts/overlay-center.ts
var overlayCenterLayout = {
  id: "overlay-center",
  name: "Overlay Center",
  categories: ["landscape", "square"],
  params: [
    { key: "title", type: "text", label: "Title", required: true },
    { key: "subtitle", type: "text", label: "Subtitle" },
    { key: "bg_color", type: "color", label: "Background Color" },
    { key: "bg_image", type: "image", label: "Background Image", searchable: true },
    { key: "title_color", type: "color", label: "Title Color" },
    { key: "subtitle_color", type: "color", label: "Subtitle Color" },
    { key: "overlay", type: "select", label: "Overlay", options: ["none", "light", "medium", "dark"] }
  ],
  render(p) {
    const bg = sanitizeColor(p.bg_color, "#1a1a3e");
    const titleColor = sanitizeColor(p.title_color, "#FFD700");
    const subColor = sanitizeColor(p.subtitle_color, "#FFFFFF");
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const overlay = getOverlayGradient(p.overlay);
    const safeBgImage = sanitizeUrlForCss(p.bg_image);
    const bgStyle = safeBgImage ? `background:${overlay !== "none" ? overlay + "," : ""}url('${safeBgImage}') center/cover no-repeat` : `background:${bg}`;
    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo ? `<img src="${safeLogo}" alt="logo" style="position:absolute;top:5%;right:5%;height:8%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />` : "";
    const subtitleHtml = subtitle ? `<p style="color:${subColor};font-weight:500;font-size:clamp(0.9rem,2.5vw,1.8rem);margin-top:0.5em;padding:0 10%;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">${subtitle}</p>` : "";
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">
  ${logoHtml}
  <h1 style="color:${titleColor};font-weight:800;font-size:clamp(1.5rem,5vw,4rem);line-height:1.2;margin:0;padding:0 8%;font-family:'Montserrat',sans-serif;">${title}</h1>
  ${subtitleHtml}
</div>`;
  }
};

// src/layouts/split-left.ts
var splitLeftLayout = {
  id: "split-left",
  name: "Split Left",
  categories: ["landscape"],
  params: [
    { key: "title", type: "text", label: "Title", required: true },
    { key: "subtitle", type: "text", label: "Subtitle" },
    { key: "feature_image", type: "image", label: "Feature Image", required: true, searchable: true },
    { key: "bg_color", type: "color", label: "Panel Background Color" },
    { key: "title_color", type: "color", label: "Title Color" },
    { key: "accent_color", type: "color", label: "Accent Color" }
  ],
  render(p) {
    const bg = sanitizeColor(p.bg_color, "#1a1a3e");
    const titleColor = sanitizeColor(p.title_color, "#FFFFFF");
    const params = p;
    const accentColor = sanitizeColor(params.accent_color, "#FFD700");
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const imgUrl = sanitizeUrlForCss(p.feature_image);
    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo ? `<img src="${safeLogo}" alt="logo" style="position:absolute;top:5%;right:5%;height:10%;max-width:30%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />` : "";
    const subtitleHtml = subtitle ? `<p style="color:${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>` : "";
    const accentBar = `<div style="width:3em;height:4px;background:${accentColor};margin-bottom:1em;border-radius:2px;"></div>`;
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  <div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;">
    <img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
  </div>
  <div style="width:50%;height:100%;background:${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">
    ${logoHtml}
    ${accentBar}
    <h1 style="color:${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;overflow:hidden;text-overflow:ellipsis;">${title}</h1>
    ${subtitleHtml}
  </div>
</div>`;
  }
};

// src/layouts/split-right.ts
var splitRightLayout = {
  id: "split-right",
  name: "Split Right",
  categories: ["landscape"],
  params: [
    { key: "title", type: "text", label: "Title", required: true },
    { key: "subtitle", type: "text", label: "Subtitle" },
    { key: "feature_image", type: "image", label: "Feature Image", required: true, searchable: true },
    { key: "bg_color", type: "color", label: "Panel Background Color" },
    { key: "title_color", type: "color", label: "Title Color" },
    { key: "accent_color", type: "color", label: "Accent Color" }
  ],
  render(p) {
    const bg = sanitizeColor(p.bg_color, "#1a1a3e");
    const titleColor = sanitizeColor(p.title_color, "#FFFFFF");
    const params = p;
    const accentColor = sanitizeColor(params.accent_color, "#FFD700");
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const imgUrl = sanitizeUrlForCss(p.feature_image);
    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo ? `<img src="${safeLogo}" alt="logo" style="position:absolute;top:5%;left:5%;height:10%;max-width:30%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />` : "";
    const subtitleHtml = subtitle ? `<p style="color:${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>` : "";
    const accentBar = `<div style="width:3em;height:4px;background:${accentColor};margin-bottom:1em;border-radius:2px;"></div>`;
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  <div style="width:50%;height:100%;background:${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">
    ${logoHtml}
    ${accentBar}
    <h1 style="color:${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;overflow:hidden;text-overflow:ellipsis;">${title}</h1>
    ${subtitleHtml}
  </div>
  <div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;">
    <img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
  </div>
</div>`;
  }
};

// src/layouts/overlay-bottom.ts
var overlayBottomLayout = {
  id: "overlay-bottom",
  name: "Overlay Bottom",
  categories: ["landscape", "square"],
  params: [
    { key: "title", type: "text", label: "Title", required: true },
    { key: "subtitle", type: "text", label: "Subtitle" },
    { key: "bg_image", type: "image", label: "Background Image", required: true, searchable: true },
    { key: "bg_color", type: "color", label: "Fallback Background Color" },
    { key: "title_color", type: "color", label: "Title Color" },
    { key: "bar_color", type: "color", label: "Bar Background Color" }
  ],
  render(p) {
    const fallbackBg = sanitizeColor(p.bg_color, "#1a1a3e");
    const titleColor = sanitizeColor(p.title_color, "#FFFFFF");
    const params = p;
    const barColor = sanitizeColor(params.bar_color, "#000000");
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const safeBgImage = sanitizeUrlForCss(p.bg_image);
    const bgStyle = safeBgImage ? `background:url('${safeBgImage}') center/cover no-repeat` : `background:${fallbackBg}`;
    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo ? `<img src="${safeLogo}" alt="logo" style="position:absolute;top:5%;right:5%;height:8%;max-width:25%;object-fit:contain;z-index:2;" crossorigin="anonymous" onerror="this.style.display='none'" />` : "";
    const subtitleHtml = subtitle ? `<p style="position:relative;color:${titleColor};font-weight:400;font-size:clamp(0.7rem,2vw,1.2rem);margin:0.4em 0 0;opacity:0.85;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${subtitle}</p>` : "";
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;${bgStyle};position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">
  ${logoHtml}
  <div style="position:absolute;bottom:0;left:0;right:0;height:30%;padding:0 6%;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;">
    <div style="position:absolute;inset:0;background:${barColor};opacity:0.88;"></div>
    <h1 style="position:relative;color:${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.2;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}</h1>
    ${subtitleHtml}
  </div>
</div>`;
  }
};

// src/layouts/card-center.ts
var cardCenterLayout = {
  id: "card-center",
  name: "Card Center",
  categories: ["square", "portrait"],
  params: [
    { key: "title", type: "text", label: "Title", required: true },
    { key: "subtitle", type: "text", label: "Subtitle" },
    { key: "feature_image", type: "image", label: "Feature Image", required: true, searchable: true },
    { key: "bg_color", type: "color", label: "Panel Background Color" },
    { key: "title_color", type: "color", label: "Title Color" }
  ],
  render(p) {
    const bg = sanitizeColor(p.bg_color, "#1a1a3e");
    const titleColor = sanitizeColor(p.title_color, "#FFFFFF");
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const imgUrl = sanitizeUrlForCss(p.feature_image);
    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo ? `<img src="${safeLogo}" alt="logo" style="position:absolute;top:5%;left:5%;height:12%;max-width:35%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />` : "";
    const subtitleHtml = subtitle ? `<p style="color:${titleColor};font-weight:400;font-size:clamp(0.75rem,2vw,1.2rem);margin:0.5em 0 0;opacity:0.8;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>` : "";
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;">
  <div style="width:100%;height:60%;position:relative;flex-shrink:0;overflow:hidden;">
    <img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
  </div>
  <div style="width:100%;height:40%;background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6% 8%;box-sizing:border-box;position:relative;">
    ${logoHtml}
    <h1 style="color:${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.25;margin:0;overflow:hidden;text-overflow:ellipsis;">${title}</h1>
    ${subtitleHtml}
  </div>
</div>`;
  }
};

// src/layouts/text-only.ts
var textOnlyLayout = {
  id: "text-only",
  name: "Text Only",
  categories: ["landscape", "square", "portrait", "wide"],
  params: [
    { key: "title", type: "text", label: "Title", required: true },
    { key: "subtitle", type: "text", label: "Subtitle" },
    { key: "bg_color", type: "color", label: "Background Color" },
    { key: "gradient_end", type: "color", label: "Gradient End Color" },
    { key: "title_color", type: "color", label: "Title Color" },
    { key: "subtitle_color", type: "color", label: "Subtitle Color" }
  ],
  render(p) {
    const bgStart = sanitizeColor(p.bg_color, "#1a1a3e");
    const titleColor = sanitizeColor(p.title_color, "#FFFFFF");
    const subColor = sanitizeColor(p.subtitle_color, "#FFD700");
    const params = p;
    const gradientEnd = sanitizeColor(params.gradient_end, "");
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const bgStyle = gradientEnd ? `background:linear-gradient(135deg, ${bgStart} 0%, ${gradientEnd} 100%)` : `background:${bgStart}`;
    const logoHtml = p.logo ? `<img src="${p.logo}" alt="logo" style="position:absolute;bottom:5%;right:5%;height:8%;max-width:25%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />` : "";
    const subtitleHtml = subtitle ? `<p style="color:${subColor};font-weight:500;font-size:clamp(0.85rem,2.5vw,1.6rem);margin:0.6em 0 0;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>` : "";
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;padding:8%;box-sizing:border-box;">
  ${logoHtml}
  <h1 style="color:${titleColor};font-weight:900;font-size:clamp(1.5rem,6vw,4.5rem);line-height:1.15;margin:0;letter-spacing:-0.02em;overflow:hidden;text-overflow:ellipsis;">${title}</h1>
  ${subtitleHtml}
</div>`;
  }
};

// src/layouts/collage-2.ts
var collage2Layout = {
  id: "collage-2",
  name: "Collage 2",
  categories: ["landscape"],
  params: [
    { key: "title", type: "text", label: "Title", required: true },
    { key: "image_1", type: "image", label: "Image 1", required: true, searchable: true },
    { key: "image_2", type: "image", label: "Image 2", required: true, searchable: true },
    { key: "bg_color", type: "color", label: "Background Color" },
    { key: "title_color", type: "color", label: "Title Color" }
  ],
  render(p) {
    const bg = sanitizeColor(p.bg_color, "#111111");
    const titleColor = sanitizeColor(p.title_color, "#FFFFFF");
    const title = escapeHtml(p.title);
    const params = p;
    const img1 = sanitizeUrlForCss(params.image_1);
    const img2 = sanitizeUrlForCss(params.image_2);
    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo ? `<img src="${safeLogo}" alt="logo" style="position:absolute;top:5%;right:5%;height:9%;max-width:25%;object-fit:contain;z-index:2;" crossorigin="anonymous" onerror="this.style.display='none'" />` : "";
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;background:${bg};display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  ${logoHtml}
  <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:2%;padding:3% 5%;box-sizing:border-box;overflow:hidden;">
    <div style="width:46%;height:100%;overflow:hidden;border-radius:4px;">
      <img src="${img1}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
    </div>
    <div style="width:46%;height:100%;overflow:hidden;border-radius:4px;">
      <img src="${img2}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
    </div>
  </div>
  <div style="height:22%;display:flex;align-items:center;justify-content:center;padding:0 6%;box-sizing:border-box;border-top:2px solid rgba(255,255,255,0.1);">
    <h1 style="color:${titleColor};font-weight:800;font-size:clamp(0.9rem,3vw,2rem);line-height:1.2;margin:0;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">${title}</h1>
  </div>
</div>`;
  }
};

// src/layouts/frame.ts
var frameLayout = {
  id: "frame",
  name: "Frame",
  categories: ["landscape", "square", "portrait", "wide"],
  params: [
    { key: "feature_image", type: "image", label: "Feature Image", required: true, searchable: true },
    { key: "frame_color", type: "color", label: "Frame Color" },
    { key: "logo_position", type: "select", label: "Logo Position", options: ["top-left", "top-right", "bottom-left", "bottom-right"] }
  ],
  render(p) {
    const imgUrl = sanitizeUrlForCss(p.feature_image);
    const params = p;
    const frameColor = sanitizeColor(params.frame_color, "#FFD700");
    const logoPos = params.logo_position || "bottom-right";
    const inset = Math.round(Math.min(p.width, p.height) * 0.03);
    const logoCornerStyle = {
      "top-left": "top:calc(3% + 1em);left:calc(3% + 1em)",
      "top-right": "top:calc(3% + 1em);right:calc(3% + 1em)",
      "bottom-left": "bottom:calc(3% + 1em);left:calc(3% + 1em)",
      "bottom-right": "bottom:calc(3% + 1em);right:calc(3% + 1em)"
    };
    const logoPos2Style = logoCornerStyle[logoPos] || logoCornerStyle["bottom-right"];
    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo ? `<img src="${safeLogo}" alt="logo" style="position:absolute;${logoPos2Style};height:8%;max-width:25%;object-fit:contain;z-index:3;" crossorigin="anonymous" onerror="this.style.display='none'" />` : "";
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;background:#000;">
  <img src="${imgUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
  <div style="position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 ${inset}px ${frameColor};z-index:2;"></div>
  ${logoHtml}
</div>`;
  }
};

// src/layouts/index.ts
var LAYOUTS = {
  "overlay-center": overlayCenterLayout,
  "split-left": splitLeftLayout,
  "split-right": splitRightLayout,
  "overlay-bottom": overlayBottomLayout,
  "card-center": cardCenterLayout,
  "text-only": textOnlyLayout,
  "collage-2": collage2Layout,
  "frame": frameLayout
};
var LAYOUT_IDS = Object.keys(LAYOUTS);
function getLayoutById(id) {
  return LAYOUTS[id];
}
__name(getLayoutById, "getLayoutById");

// src/routes/builder.ts
function handleBuilder() {
  return htmlResponse(builderHTML());
}
__name(handleBuilder, "handleBuilder");
function builderHTML() {
  const sizeOptions = SIZE_PRESETS.map((s) => `<option value="${s.id}">${s.name} (${s.w}\xD7${s.h})</option>`).join("\n            ");
  const brandOptions = BRAND_IDS.map((id) => `<option value="${id}">${BRANDS[id].name}</option>`).join("\n            ");
  const layoutOptions = LAYOUT_IDS.map((id) => `<option value="${id}">${LAYOUTS[id].name}</option>`).join("\n            ");
  const clientData = {
    sizes: SIZE_PRESETS,
    brands: BRANDS,
    layouts: Object.fromEntries(
      Object.entries(LAYOUTS).map(([id, l]) => [id, { id: l.id, name: l.name, categories: l.categories, params: l.params }])
    )
  };
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapKit - Thumbnail Builder</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>\u{1F4F8}</text></svg>">
  <script src="https://unpkg.com/@zumer/snapdom@2.0.2/dist/snapdom.js"><\/script>
  ${fontFaceCSS()}
  ${appCSS()}
</head>
<body>
  <div class="app">
    <header class="app-header">
      <h1>SnapKit</h1>
      <select id="brand-select" class="brand-select">
        ${brandOptions}
      </select>
    </header>
    <main class="app-main">
      <aside class="controls">
        <div class="control-group">
          <label for="size-select">Size Preset</label>
          <select id="size-select">
            ${sizeOptions}
          </select>
        </div>
        <div class="control-group">
          <label for="layout-select">Layout</label>
          <select id="layout-select">
            ${layoutOptions}
          </select>
        </div>
        <div class="control-group">
          <label for="title-input">Title</label>
          <input type="text" id="title-input" placeholder="Nh\u1EADp ti\xEAu \u0111\u1EC1..." maxlength="100" />
        </div>
        <div class="control-group">
          <label for="subtitle-input">Subtitle</label>
          <input type="text" id="subtitle-input" placeholder="Nh\u1EADp ph\u1EE5 \u0111\u1EC1..." maxlength="150" />
        </div>
        <div class="control-group">
          <label>Background</label>
          <div class="bg-tabs">
            <button class="bg-tab active" data-tab="color">Color</button>
            <button class="bg-tab" data-tab="image">Image</button>
          </div>
          <div class="bg-panel" id="bg-color-panel">
            <input type="color" id="bg-color" value="#1a1a3e" />
            <div class="color-swatches" id="bg-swatches"></div>
          </div>
          <div class="bg-panel hidden" id="bg-image-panel">
            <input type="text" id="bg-image-url" placeholder="Image URL or search..." />
            <button id="bg-search-btn" class="btn-secondary">Search</button>
          </div>
        </div>
        <div class="control-row">
          <div class="control-group">
            <label for="title-color">Title</label>
            <input type="color" id="title-color" value="#FFD700" />
          </div>
          <div class="control-group">
            <label for="sub-color">Subtitle</label>
            <input type="color" id="sub-color" value="#FFFFFF" />
          </div>
        </div>
        <div class="control-group">
          <label for="overlay-select">Overlay</label>
          <select id="overlay-select">
            <option value="none">None</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="dark" selected>Dark</option>
          </select>
        </div>
        <div class="control-group checkbox-group">
          <label><input type="checkbox" id="logo-toggle" checked /> Show Logo</label>
        </div>
        <div class="button-group">
          <button id="download-btn" class="btn-primary">Download PNG</button>
          <button id="save-btn" class="btn-secondary">Save Design</button>
        </div>
      </aside>
      <section class="preview">
        <div class="preview-frame" id="preview-frame"></div>
        <div class="preview-info" id="preview-info">1200 \xD7 630</div>
      </section>
    </main>
  </div>
  <script type="module">
    ${clientScript(clientData)}
  <\/script>
</body>
</html>`;
}
__name(builderHTML, "builderHTML");
function fontFaceCSS() {
  return `<style>
    @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
    @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-ExtraBold.woff2') format('woff2'); font-weight: 800; font-display: swap; }
    @font-face { font-family: 'Be Vietnam Pro'; src: url('/fonts/BeVietnamPro-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
    @font-face { font-family: 'Be Vietnam Pro'; src: url('/fonts/BeVietnamPro-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: swap; }
  </style>`;
}
__name(fontFaceCSS, "fontFaceCSS");
function appCSS() {
  return `<style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: 'Be Vietnam Pro', -apple-system, sans-serif; background: #0f0f1a; color: #e0e0e0; min-height: 100vh; }
    .app { display: flex; flex-direction: column; min-height: 100vh; }
    .app-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; background: #1a1a2e; border-bottom: 1px solid #2a2a4a; }
    .app-header h1 { margin: 0; font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 1.5rem; color: #FFD700; }
    .brand-select { background: #1a1a3e; color: #FFD700; border: 1px solid #3a3a5a; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; }
    .app-main { display: grid; grid-template-columns: 340px 1fr; flex: 1; }
    .controls { background: #1a1a2e; padding: 1.5rem; overflow-y: auto; border-right: 1px solid #2a2a4a; }
    .control-group { margin-bottom: 1.25rem; }
    .control-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.85rem; color: #a0a0b0; }
    .control-group input[type="text"], .control-group select { width: 100%; padding: 0.625rem 0.75rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; color: #e0e0e0; font-family: inherit; font-size: 0.95rem; }
    .control-group input:focus, .control-group select:focus { outline: none; border-color: #FFD700; }
    .control-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }
    .control-row .control-group { margin-bottom: 0; }
    .control-group input[type="color"] { width: 100%; height: 40px; padding: 2px; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; cursor: pointer; }
    .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #e0e0e0; }
    .checkbox-group input[type="checkbox"] { width: 18px; height: 18px; accent-color: #FFD700; }
    .bg-tabs { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
    .bg-tab { flex: 1; padding: 0.5rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; color: #a0a0b0; cursor: pointer; font-size: 0.85rem; }
    .bg-tab.active { background: #2a2a4a; color: #FFD700; border-color: #FFD700; }
    .bg-panel { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .bg-panel.hidden { display: none; }
    .color-swatches { display: flex; gap: 0.25rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .color-swatch { width: 28px; height: 28px; border-radius: 4px; border: 2px solid transparent; cursor: pointer; }
    .color-swatch:hover { border-color: #fff; }
    .button-group { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    .btn-primary { flex: 1; padding: 0.875rem 1rem; background: linear-gradient(135deg, #FFD700, #FF6B35); border: none; border-radius: 8px; color: #1a1a3e; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1rem; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-secondary { flex: 1; padding: 0.875rem 1rem; background: #2a2a4a; border: 1px solid #3a3a5a; border-radius: 8px; color: #e0e0e0; font-family: 'Montserrat', sans-serif; font-weight: 600; cursor: pointer; }
    .btn-secondary:hover { background: #3a3a5a; }
    .preview { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; background: #12121f; }
    .preview-frame { display: flex; align-items: flex-start; justify-content: center; max-width: 100%; overflow: hidden; border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); }
    .preview-info { margin-top: 1rem; color: #6a6a7a; font-size: 0.85rem; font-weight: 600; }
    @media (max-width: 900px) { .app-main { grid-template-columns: 1fr; } .controls { border-right: none; border-bottom: 1px solid #2a2a4a; max-height: 50vh; } }
  </style>`;
}
__name(appCSS, "appCSS");
function clientScript(data) {
  return `
    const DATA = ${JSON.stringify(data)};

    // Layout render functions (must match server-side)
    const esc = s => s ? s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : '';
    const safeColor = (c, fallback) => (c && /^#[0-9a-fA-F]{3,8}$|^rgb/.test(c)) ? c : fallback;
    const logoHtml = (p, pos) => p.logo ? \`<img src="\${p.logo}" alt="logo" style="position:absolute;\${pos};height:8%;max-width:25%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />\` : '';

    const RENDERERS = {
      'overlay-center': (p) => {
        const overlay = { none: '', light: 'linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2)),', medium: 'linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),', dark: 'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),' }[p.overlay || 'none'] || '';
        const bgStyle = p.bg_image ? \`background:\${overlay}url('\${p.bg_image}') center/cover no-repeat\` : \`background:\${safeColor(p.bg_color,'#1a1a3e')}\`;
        const titleColor = safeColor(p.title_color, '#FFD700');
        const subColor = safeColor(p.subtitle_color, '#FFFFFF');
        const sub = p.subtitle ? \`<p style="color:\${subColor};font-weight:500;font-size:clamp(0.9rem,2.5vw,1.8rem);margin-top:0.5em;padding:0 10%;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">\${logoHtml(p,'top:5%;right:5%')}<h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.5rem,5vw,4rem);line-height:1.2;margin:0;padding:0 8%;font-family:'Montserrat',sans-serif;">\${esc(p.title)}</h1>\${sub}</div>\`;
      },
      'split-left': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const accentColor = safeColor(p.accent_color, '#FFD700');
        const sub = p.subtitle ? \`<p style="color:\${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;"><div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:50%;height:100%;background:\${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;right:5%')}<div style="width:3em;height:4px;background:\${accentColor};margin-bottom:1em;border-radius:2px;"></div><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div></div>\`;
      },
      'split-right': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const accentColor = safeColor(p.accent_color, '#FFD700');
        const sub = p.subtitle ? \`<p style="color:\${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;"><div style="width:50%;height:100%;background:\${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;left:5%')}<div style="width:3em;height:4px;background:\${accentColor};margin-bottom:1em;border-radius:2px;"></div><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div><div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div></div>\`;
      },
      'overlay-bottom': (p) => {
        const fallbackBg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const barColor = safeColor(p.bar_color, '#000000');
        const bgStyle = p.bg_image ? \`background:url('\${p.bg_image}') center/cover no-repeat\` : \`background:\${fallbackBg}\`;
        const sub = p.subtitle ? \`<p style="position:relative;color:\${titleColor};font-weight:400;font-size:clamp(0.7rem,2vw,1.2rem);margin:0.4em 0 0;opacity:0.85;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">\${logoHtml(p,'top:5%;right:5%;z-index:2')}<div style="position:absolute;bottom:0;left:0;right:0;height:30%;padding:0 6%;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;"><div style="position:absolute;inset:0;background:\${barColor};opacity:0.88;"></div><h1 style="position:relative;color:\${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.2;margin:0;">\${esc(p.title)}</h1>\${sub}</div></div>\`;
      },
      'card-center': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const sub = p.subtitle ? \`<p style="color:\${titleColor};font-weight:400;font-size:clamp(0.75rem,2vw,1.2rem);margin:0.5em 0 0;opacity:0.8;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;"><div style="width:100%;height:60%;position:relative;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:100%;height:40%;background:\${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6% 8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;left:5%;height:12%;max-width:35%')}<h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div></div>\`;
      },
      'text-only': (p) => {
        const bgStart = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const subColor = safeColor(p.subtitle_color, '#FFD700');
        const bgStyle = p.gradient_end ? \`background:linear-gradient(135deg,\${bgStart} 0%,\${safeColor(p.gradient_end,bgStart)} 100%)\` : \`background:\${bgStart}\`;
        const sub = p.subtitle ? \`<p style="color:\${subColor};font-weight:500;font-size:clamp(0.85rem,2.5vw,1.6rem);margin:0.6em 0 0;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;padding:8%;box-sizing:border-box;">\${logoHtml(p,'bottom:5%;right:5%')}<h1 style="color:\${titleColor};font-weight:900;font-size:clamp(1.5rem,6vw,4.5rem);line-height:1.15;margin:0;letter-spacing:-0.02em;">\${esc(p.title)}</h1>\${sub}</div>\`;
      },
      'collage-2': (p) => {
        const bg = safeColor(p.bg_color, '#111111');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;background:\${bg};display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">\${logoHtml(p,'top:5%;right:5%;z-index:2')}<div style="flex:1;display:flex;align-items:center;justify-content:center;gap:2%;padding:3% 5%;box-sizing:border-box;overflow:hidden;"><div style="width:46%;height:100%;overflow:hidden;border-radius:4px;"><img src="\${p.image_1||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:46%;height:100%;overflow:hidden;border-radius:4px;"><img src="\${p.image_2||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div></div><div style="height:22%;display:flex;align-items:center;justify-content:center;padding:0 6%;box-sizing:border-box;border-top:2px solid rgba(255,255,255,0.1);"><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(0.9rem,3vw,2rem);line-height:1.2;margin:0;text-align:center;">\${esc(p.title)}</h1></div></div>\`;
      },
      'frame': (p) => {
        const frameColor = safeColor(p.frame_color, '#FFD700');
        const inset = Math.round(Math.min(p.width, p.height) * 0.03);
        const posMap = { 'top-left':'top:calc(3% + 1em);left:calc(3% + 1em)', 'top-right':'top:calc(3% + 1em);right:calc(3% + 1em)', 'bottom-left':'bottom:calc(3% + 1em);left:calc(3% + 1em)', 'bottom-right':'bottom:calc(3% + 1em);right:calc(3% + 1em)' };
        const logoPos = posMap[p.logo_position] || posMap['bottom-right'];
        const logo = p.logo ? \`<img src="\${p.logo}" alt="logo" style="position:absolute;\${logoPos};height:8%;max-width:25%;object-fit:contain;z-index:3;" crossorigin="anonymous" onerror="this.style.display='none'" />\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;background:#000;"><img src="\${p.feature_image||''}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /><div style="position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 \${inset}px \${frameColor};z-index:2;"></div>\${logo}</div>\`;
      },
    };

    // State
    const state = {
      size: DATA.sizes[0],
      layout: 'overlay-center',
      brand: DATA.brands.goha,
      title: 'T\u1ED1i \u01B0u content B2B cho AI',
      subtitle: 'Cu\u1ED9c c\xE1ch m\u1EA1ng t\xECm ki\u1EBFm \u0111a b\u01B0\u1EDBc',
      bg_color: '#1a1a3e',
      bg_image: '',
      title_color: '#FFD700',
      subtitle_color: '#FFFFFF',
      overlay: 'dark',
      showLogo: true,
    };

    function render() {
      const renderer = RENDERERS[state.layout];
      if (!renderer) return;
      const html = renderer({
        width: state.size.w,
        height: state.size.h,
        title: state.title,
        subtitle: state.subtitle,
        bg_color: state.bg_color,
        bg_image: state.bg_image,
        title_color: state.title_color,
        subtitle_color: state.subtitle_color,
        overlay: state.overlay,
        logo: state.showLogo && state.brand.logos[0] ? state.brand.logos[0].url : null,
      });
      document.getElementById('preview-frame').innerHTML = html;
      updateScale();
      document.getElementById('preview-info').textContent = \`\${state.size.w} \xD7 \${state.size.h}\`;
    }

    function updateScale() {
      const frame = document.getElementById('preview-frame');
      const thumb = document.getElementById('thumbnail');
      if (!thumb) return;
      const maxW = frame.parentElement.clientWidth - 64;
      const maxH = window.innerHeight - 250;
      const scale = Math.min(maxW / state.size.w, maxH / state.size.h, 1);
      thumb.style.transform = \`scale(\${scale})\`;
      thumb.style.transformOrigin = 'top left';
      frame.style.width = \`\${state.size.w * scale}px\`;
      frame.style.height = \`\${state.size.h * scale}px\`;
    }

    function applyBrand(brand) {
      state.brand = brand;
      state.bg_color = brand.colors.primary;
      state.title_color = brand.colors.secondary;
      state.subtitle_color = brand.colors.text_light;
      document.getElementById('bg-color').value = brand.colors.primary;
      document.getElementById('title-color').value = brand.colors.secondary;
      document.getElementById('sub-color').value = brand.colors.text_light;
      renderSwatches(brand);
      render();
    }

    function renderSwatches(brand) {
      const container = document.getElementById('bg-swatches');
      container.innerHTML = Object.values(brand.colors).map(c => \`<div class="color-swatch" style="background:\${c}" data-color="\${c}"></div>\`).join('');
      container.querySelectorAll('.color-swatch').forEach(el => {
        el.addEventListener('click', () => { state.bg_color = el.dataset.color; document.getElementById('bg-color').value = el.dataset.color; render(); });
      });
    }

    function debounce(fn, ms = 100) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

    function bind() {
      document.getElementById('size-select').addEventListener('change', e => { state.size = DATA.sizes.find(s => s.id === e.target.value); render(); });
      document.getElementById('layout-select').addEventListener('change', e => { state.layout = e.target.value; render(); });
      document.getElementById('brand-select').addEventListener('change', e => { applyBrand(DATA.brands[e.target.value]); });
      document.getElementById('title-input').addEventListener('input', debounce(e => { state.title = e.target.value; render(); }));
      document.getElementById('subtitle-input').addEventListener('input', debounce(e => { state.subtitle = e.target.value; render(); }));
      document.getElementById('bg-color').addEventListener('input', e => { state.bg_color = e.target.value; state.bg_image = ''; render(); });
      document.getElementById('title-color').addEventListener('input', e => { state.title_color = e.target.value; render(); });
      document.getElementById('sub-color').addEventListener('input', e => { state.subtitle_color = e.target.value; render(); });
      document.getElementById('overlay-select').addEventListener('change', e => { state.overlay = e.target.value; render(); });
      document.getElementById('logo-toggle').addEventListener('change', e => { state.showLogo = e.target.checked; render(); });
      document.getElementById('bg-image-url').addEventListener('input', debounce(e => { if (e.target.value) { state.bg_image = e.target.value; render(); } }));
      document.querySelectorAll('.bg-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.bg-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById('bg-color-panel').classList.toggle('hidden', tab.dataset.tab !== 'color');
          document.getElementById('bg-image-panel').classList.toggle('hidden', tab.dataset.tab !== 'image');
        });
      });
      window.addEventListener('resize', debounce(updateScale, 150));
    }

    async function downloadPNG() {
      const btn = document.getElementById('download-btn');
      btn.disabled = true; btn.textContent = 'Capturing...';
      try {
        await document.fonts.ready;
        const thumb = document.getElementById('thumbnail');
        const origT = thumb.style.transform, origO = thumb.style.transformOrigin;
        thumb.style.transform = 'none'; thumb.style.transformOrigin = '';
        const result = await window.snapdom(thumb);
        const blob = await result.toBlob({ type: 'image/png', scale: 2 });
        thumb.style.transform = origT; thumb.style.transformOrigin = origO;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = \`snapkit-\${state.size.id}-\${Date.now()}.png\`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        btn.textContent = 'Downloaded!'; setTimeout(() => { btn.textContent = 'Download PNG'; }, 2000);
      } catch (e) { console.error(e); btn.textContent = 'Error'; setTimeout(() => { btn.textContent = 'Download PNG'; }, 2000); }
      finally { btn.disabled = false; }
    }

    async function saveDesign() {
      const btn = document.getElementById('save-btn');
      btn.disabled = true; btn.textContent = 'Saving...';
      try {
        const design = { size: { preset: state.size.id, width: state.size.w, height: state.size.h }, layout: state.layout, brand: state.brand.id, params: { title: state.title, subtitle: state.subtitle, bg_color: state.bg_color, bg_image: state.bg_image, title_color: state.title_color, subtitle_color: state.subtitle_color, overlay: state.overlay, showLogo: state.showLogo } };
        const res = await fetch('/api/designs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(design) });
        if (!res.ok) throw new Error('Save failed');
        const { id } = await res.json();
        const shareUrl = \`\${location.origin}/d/\${id}\`;
        await navigator.clipboard.writeText(shareUrl);
        btn.textContent = 'Copied URL!'; setTimeout(() => { btn.textContent = 'Save Design'; }, 2000);
      } catch (e) { console.error(e); btn.textContent = 'Error'; setTimeout(() => { btn.textContent = 'Save Design'; }, 2000); }
      finally { btn.disabled = false; }
    }

    document.getElementById('download-btn').addEventListener('click', downloadPNG);
    document.getElementById('save-btn').addEventListener('click', saveDesign);

    document.addEventListener('DOMContentLoaded', async () => {
      if (typeof window.snapdom === 'undefined') { document.getElementById('download-btn').disabled = true; }
      document.getElementById('title-input').value = state.title;
      document.getElementById('subtitle-input').value = state.subtitle;
      await document.fonts.ready;
      renderSwatches(state.brand);
      bind();
      render();
    });
  `;
}
__name(clientScript, "clientScript");

// src/lib/r2-helpers.ts
async function r2GetJson(env, key) {
  const obj = await env.R2_BUCKET.get(key);
  if (!obj) return null;
  return obj.json();
}
__name(r2GetJson, "r2GetJson");
async function r2Put(env, key, body, options) {
  return env.R2_BUCKET.put(key, body, options);
}
__name(r2Put, "r2Put");
async function r2PutJson(env, key, data, customMetadata) {
  return env.R2_BUCKET.put(key, JSON.stringify(data), {
    httpMetadata: { contentType: "application/json" },
    customMetadata
  });
}
__name(r2PutJson, "r2PutJson");
function generateId(prefix = "") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = prefix;
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
__name(generateId, "generateId");

// src/routes/brands.ts
async function resolveBrand(id, env) {
  try {
    const r2Kit = await r2GetJson(env, `brands/${id}/kit.json`);
    if (r2Kit) return r2Kit;
  } catch {
  }
  return BRANDS[id] ?? null;
}
__name(resolveBrand, "resolveBrand");
async function handleBrandsList(_req, env) {
  const brands = BRAND_IDS.map((id) => {
    const b = BRANDS[id];
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logos[0]?.url ?? null,
      colors: {
        primary: b.colors.primary,
        secondary: b.colors.secondary
      }
    };
  });
  return jsonResponse({ brands });
}
__name(handleBrandsList, "handleBrandsList");
async function handleBrandGet(req, env, id) {
  if (!id) return notFoundResponse("Brand ID required");
  const brand = await resolveBrand(id, env);
  if (!brand) return notFoundResponse(`Brand "${id}" not found`);
  return jsonResponse(brand);
}
__name(handleBrandGet, "handleBrandGet");
async function handleBrandAssets(req, env, id) {
  if (!id) return notFoundResponse("Brand ID required");
  const brand = await resolveBrand(id, env);
  if (!brand) return notFoundResponse(`Brand "${id}" not found`);
  return jsonResponse({
    logos: brand.logos,
    backgrounds: brand.backgrounds,
    watermark: brand.watermark ?? null
  });
}
__name(handleBrandAssets, "handleBrandAssets");
async function handleBrandsRoute(req, env, pathname) {
  if (pathname === "/api/brands") {
    return handleBrandsList(req, env);
  }
  const assetsMatch = pathname.match(/^\/api\/brands\/([^/]+)\/assets$/);
  if (assetsMatch) {
    return handleBrandAssets(req, env, assetsMatch[1]);
  }
  const brandMatch = pathname.match(/^\/api\/brands\/([^/]+)$/);
  if (brandMatch) {
    return handleBrandGet(req, env, brandMatch[1]);
  }
  return null;
}
__name(handleBrandsRoute, "handleBrandsRoute");

// src/routes/backgrounds.ts
var MANIFEST_KEY = "backgrounds/_index.json";
var UPLOAD_PREFIX = "uploads/";
var MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
async function loadManifest(env) {
  const manifest = await r2GetJson(env, MANIFEST_KEY);
  return manifest ?? [];
}
__name(loadManifest, "loadManifest");
function filterEntries(entries, { brand, tag, q }) {
  let result = entries;
  if (brand) {
    const brandEntries = result.filter((e) => e.brand === brand);
    const globalEntries = result.filter((e) => !e.brand);
    result = [...brandEntries, ...globalEntries];
  }
  if (tag) {
    result = result.filter(
      (e) => e.category === tag || e.tags.includes(tag)
    );
  }
  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(
      (e) => e.name.toLowerCase().includes(lower) || e.tags.some((t) => t.toLowerCase().includes(lower)) || e.category.toLowerCase().includes(lower)
    );
  }
  return result;
}
__name(filterEntries, "filterEntries");
function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
__name(pickRandom, "pickRandom");
async function hashBytes(buf) {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).slice(0, 4).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashBytes, "hashBytes");
async function handleBackgrounds(url, env) {
  const brand = url.searchParams.get("brand");
  const tag = url.searchParams.get("tag");
  const q = url.searchParams.get("q");
  const random = url.searchParams.get("random") === "true";
  const limit = parseInt(url.searchParams.get("limit") || "0", 10);
  try {
    let entries = await loadManifest(env);
    entries = filterEntries(entries, { brand, tag, q });
    if (random) {
      entries = pickRandom(entries, limit > 0 ? limit : entries.length);
    } else if (limit > 0) {
      entries = entries.slice(0, limit);
    }
    return jsonResponse({ backgrounds: entries, total: entries.length });
  } catch (err) {
    console.error("Backgrounds fetch error:", err);
    return errorResponse("Failed to load backgrounds", 500);
  }
}
__name(handleBackgrounds, "handleBackgrounds");
async function handleBackgroundUpload(request, env) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid multipart form data");
  }
  const file = formData.get("file");
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return errorResponse("Missing file field in form data");
  }
  const fileEntry = file;
  if (!fileEntry.type.startsWith("image/")) {
    return errorResponse("Only image files are accepted");
  }
  const buffer = await fileEntry.arrayBuffer();
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return errorResponse("File exceeds 5MB limit");
  }
  const ext = fileEntry.name.split(".").pop()?.toLowerCase() || mimeToExt(fileEntry.type);
  const hash = await hashBytes(buffer);
  const key = `${UPLOAD_PREFIX}${hash}.${ext}`;
  try {
    await r2Put(env, key, buffer, {
      httpMetadata: { contentType: fileEntry.type }
    });
    return jsonResponse({ url: `/${key}` }, 201);
  } catch (err) {
    console.error("Upload error:", err);
    return errorResponse("Upload failed", 500);
  }
}
__name(handleBackgroundUpload, "handleBackgroundUpload");
function mimeToExt(mime) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif"
  };
  return map[mime] ?? "jpg";
}
__name(mimeToExt, "mimeToExt");

// src/lib/unsplash.ts
async function searchUnsplash(query, perPage, env) {
  if (!env.UNSPLASH_ACCESS_KEY) {
    throw new Error("UNSPLASH_ACCESS_KEY not configured");
  }
  const clampedPerPage = Math.min(Math.max(1, perPage), 30);
  const apiUrl = new URL("https://api.unsplash.com/search/photos");
  apiUrl.searchParams.set("query", query);
  apiUrl.searchParams.set("per_page", String(clampedPerPage));
  apiUrl.searchParams.set("orientation", "landscape");
  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1"
    }
  });
  if (res.status === 429) {
    throw new Error("Unsplash rate limit exceeded. Try again later.");
  }
  if (!res.ok) {
    throw new Error(`Unsplash API error: ${res.status}`);
  }
  const data = await res.json();
  return (data.results || []).map((photo) => ({
    id: photo.id,
    url_thumb: photo.urls.small,
    url_full: photo.urls.regular,
    author: photo.user.name,
    author_url: photo.user.links.html,
    color: photo.color
  }));
}
__name(searchUnsplash, "searchUnsplash");

// src/routes/image-search.ts
var CACHE_TTL_MS = 60 * 60 * 1e3;
function cacheKey(query, perPage) {
  return `search-cache/unsplash/${encodeURIComponent(query.toLowerCase())}-${perPage}.json`;
}
__name(cacheKey, "cacheKey");
async function handleImageSearch(url, env) {
  const query = url.searchParams.get("q")?.trim();
  if (!query) {
    return errorResponse("Missing required parameter: q");
  }
  const perPage = Math.min(Math.max(1, parseInt(url.searchParams.get("per_page") || "9", 10)), 30);
  if (!env.UNSPLASH_ACCESS_KEY) {
    return errorResponse("Image search not configured", 501);
  }
  try {
    const cached = await r2GetJson(env, cacheKey(query, perPage));
    if (cached && Date.now() - cached.cached_at < CACHE_TTL_MS) {
      return jsonResponse({ results: cached.results, cached: true });
    }
  } catch {
  }
  try {
    const results = await searchUnsplash(query, perPage, env);
    r2PutJson(env, cacheKey(query, perPage), { results, cached_at: Date.now() }).catch(
      () => {
      }
    );
    return jsonResponse({ results, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image search failed";
    const status = message.includes("rate limit") ? 429 : 500;
    return errorResponse(message, status);
  }
}
__name(handleImageSearch, "handleImageSearch");

// src/lib/design-store.ts
function nanoid(size = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b & 63]).join("");
}
__name(nanoid, "nanoid");
function designKey(id) {
  return `designs/${id}.json`;
}
__name(designKey, "designKey");
async function saveDesign(input, env) {
  const id = `d_${nanoid(8)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const design = {
    id,
    created_at: now,
    updated_at: now,
    ...input
  };
  await r2PutJson(env, designKey(id), design, {
    created_at: now,
    brand: design.brand || "none",
    layout: design.layout
  });
  return design;
}
__name(saveDesign, "saveDesign");
async function getDesign(id, env) {
  return r2GetJson(env, designKey(id));
}
__name(getDesign, "getDesign");
async function updateDesign(id, updates, env) {
  const existing = await getDesign(id, env);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...updates,
    id,
    // id never changes
    created_at: existing.created_at,
    // preserve original
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await r2PutJson(env, designKey(id), updated, {
    created_at: updated.created_at,
    brand: updated.brand || "none",
    layout: updated.layout
  });
  return updated;
}
__name(updateDesign, "updateDesign");

// src/routes/designs.ts
function validateDesignBody(body) {
  if (!body || typeof body !== "object") return "Request body must be a JSON object";
  if (!body.layout || typeof body.layout !== "string") return "Missing required field: layout";
  if (!getLayoutById(body.layout)) return `Unknown layout: ${body.layout}`;
  if (!body.size || typeof body.size !== "object") return "Missing required field: size";
  if (typeof body.size.preset !== "string") return "size.preset must be a string";
  if (body.size.preset === "custom") {
    if (typeof body.size.width !== "number" || typeof body.size.height !== "number") {
      return "Custom size requires numeric size.width and size.height";
    }
  } else {
    const preset = getSizeById(body.size.preset);
    if (!preset) return `Unknown size preset: ${body.size.preset}`;
  }
  if (body.params !== void 0 && typeof body.params !== "object") {
    return "params must be an object";
  }
  return null;
}
__name(validateDesignBody, "validateDesignBody");
function resolveSize(body) {
  if (body.size.preset === "custom") {
    return { preset: "custom", width: body.size.width, height: body.size.height };
  }
  const preset = getSizeById(body.size.preset);
  return { preset: preset.id, width: preset.w, height: preset.h };
}
__name(resolveSize, "resolveSize");
async function handleDesignCreate(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }
  const validationError = validateDesignBody(body);
  if (validationError) return errorResponse(validationError, 400);
  try {
    const design = await saveDesign(
      {
        size: resolveSize(body),
        layout: body.layout,
        brand: body.brand ?? null,
        params: body.params ?? {}
      },
      env
    );
    const host = new URL(request.url).origin;
    return jsonResponse(
      { id: design.id, url: `${host}/d/${design.id}`, created_at: design.created_at },
      201
    );
  } catch (e) {
    console.error("Design create error:", e);
    return errorResponse("Failed to save design", 500);
  }
}
__name(handleDesignCreate, "handleDesignCreate");
async function handleDesignGet(designId, env) {
  try {
    const design = await getDesign(designId, env);
    if (!design) return notFoundResponse("Design not found");
    return jsonResponse(design);
  } catch (e) {
    console.error("Design get error:", e);
    return errorResponse("Failed to retrieve design", 500);
  }
}
__name(handleDesignGet, "handleDesignGet");
async function handleDesignUpdate(designId, request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }
  const validationError = validateDesignBody(body);
  if (validationError) return errorResponse(validationError, 400);
  try {
    const updated = await updateDesign(
      designId,
      {
        size: resolveSize(body),
        layout: body.layout,
        brand: body.brand ?? null,
        params: body.params ?? {}
      },
      env
    );
    if (!updated) return notFoundResponse("Design not found");
    return jsonResponse(updated);
  } catch (e) {
    console.error("Design update error:", e);
    return errorResponse("Failed to update design", 500);
  }
}
__name(handleDesignUpdate, "handleDesignUpdate");

// src/lib/template-renderer.ts
function pageShell(thumbnailHtml) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  ${thumbnailHtml}
</body>
</html>`;
}
__name(pageShell, "pageShell");
async function renderDesignToHTML(design, _env) {
  const layout = getLayoutById(design.layout);
  if (!layout) throw new Error(`Unknown layout: ${design.layout}`);
  const preset = getSizeById(design.size.preset);
  const width = preset?.w ?? design.size.width;
  const height = preset?.h ?? design.size.height;
  const brand = design.brand ? getBrandById(design.brand) : void 0;
  const params = design.params;
  const bg_color = params.bg_color || brand?.colors.primary;
  const title_color = params.title_color || brand?.colors.secondary;
  const subtitle_color = params.subtitle_color || brand?.colors.text_light;
  const showLogo = params.showLogo === "true" || params.showLogo === "1";
  const logo = showLogo && brand?.logos[0]?.url ? brand.logos[0].url : void 0;
  const thumbnailHtml = layout.render({
    width,
    height,
    title: params.title,
    subtitle: params.subtitle,
    bg_color,
    bg_image: params.bg_image,
    title_color,
    subtitle_color,
    overlay: params.overlay,
    logo,
    feature_image: params.feature_image
  });
  return pageShell(thumbnailHtml);
}
__name(renderDesignToHTML, "renderDesignToHTML");
function renderInlineToHTML(layoutId, sizeId, params) {
  const layout = getLayoutById(layoutId);
  if (!layout) throw new Error(`Unknown layout: ${layoutId}`);
  const preset = getSizeById(sizeId);
  if (!preset) throw new Error(`Unknown size preset: ${sizeId}`);
  const thumbnailHtml = layout.render({
    width: preset.w,
    height: preset.h,
    title: params.title,
    subtitle: params.subtitle,
    bg_color: params.bg_color,
    bg_image: params.bg_image,
    title_color: params.title_color,
    subtitle_color: params.subtitle_color,
    overlay: params.overlay,
    logo: params.logo,
    feature_image: params.feature_image
  });
  return pageShell(thumbnailHtml);
}
__name(renderInlineToHTML, "renderInlineToHTML");

// src/routes/render.ts
function htmlResponse2(html) {
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(htmlResponse2, "htmlResponse");
async function handleRender(url, env) {
  const designId = url.searchParams.get("d");
  if (designId) {
    try {
      const design = await getDesign(designId, env);
      if (!design) return notFoundResponse("Design not found");
      const html = await renderDesignToHTML(design, env);
      return htmlResponse2(html);
    } catch (e) {
      console.error("Render design error:", e);
      return errorResponse(`Render failed: ${e.message}`, 500);
    }
  }
  const layoutId = url.searchParams.get("layout");
  const sizeId = url.searchParams.get("size");
  if (!layoutId) return errorResponse("Missing required param: layout (or d for saved design)");
  if (!sizeId) return errorResponse("Missing required param: size");
  const params = {};
  url.searchParams.forEach((value, key) => {
    if (key !== "layout" && key !== "size") {
      params[key] = value;
    }
  });
  try {
    const html = renderInlineToHTML(layoutId, sizeId, params);
    return htmlResponse2(html);
  } catch (e) {
    console.error("Render inline error:", e);
    return errorResponse(`Render failed: ${e.message}`, 400);
  }
}
__name(handleRender, "handleRender");

// src/routes/design-viewer.ts
function designViewerHTML(design) {
  const designJson = JSON.stringify(design).replace(/<\/script>/gi, "<\\/script>");
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapKit \u2014 ${escapeAttr(design.id)}</title>
  <meta name="snapkit:design-id" content="${escapeAttr(design.id)}">
  <style>
    body { margin: 0; font-family: sans-serif; background: #0f0f1a; color: #e0e0e0;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .loading { text-align: center; }
    .loading p { margin-top: 1rem; opacity: 0.6; font-size: 0.9rem; }
    .spinner { width: 48px; height: 48px; border: 3px solid #3a3a5a;
               border-top-color: #FFD700; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <!-- Pre-injected design state for client hydration -->
  <script id="snapkit-design-data" type="application/json">${designJson}<\/script>

  <!-- Loading indicator shown until builder JS redirects/hydrates -->
  <div class="loading" id="loading-indicator">
    <div class="spinner"></div>
    <p>Loading design...</p>
  </div>

  <script>
    // Read pre-injected design and redirect to builder with state in query
    (function () {
      try {
        const raw = document.getElementById('snapkit-design-data').textContent;
        const design = JSON.parse(raw);
        // Navigate to builder with design ID so builder can load it
        const dest = new URL('/', location.href);
        dest.searchParams.set('d', design.id);
        location.replace(dest.toString());
      } catch (e) {
        document.getElementById('loading-indicator').innerHTML =
          '<p style="color:#f66">Failed to load design. <a href="/" style="color:#FFD700">Go to builder</a></p>';
      }
    })();
  <\/script>
</body>
</html>`;
}
__name(designViewerHTML, "designViewerHTML");
function escapeAttr(str) {
  return str.replace(/[&"<>]/g, (c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[c] || c);
}
__name(escapeAttr, "escapeAttr");
async function handleDesignView(designId, env) {
  if (!designId || designId.length < 3) {
    return notFoundResponse("Invalid design ID");
  }
  try {
    const design = await getDesign(designId, env);
    if (!design) return notFoundResponse("Design not found");
    return htmlResponse(designViewerHTML(design));
  } catch (e) {
    console.error("Design viewer error:", e);
    return errorResponse("Failed to load design", 500);
  }
}
__name(handleDesignView, "handleDesignView");

// src/lib/windmill-client.ts
async function runWindmillScreenshot(params, env) {
  const wEnv = env;
  if (!wEnv.WINDMILL_BASE || !wEnv.WINDMILL_TOKEN) {
    throw new Error("Windmill not configured: missing WINDMILL_BASE or WINDMILL_TOKEN");
  }
  const workspace = wEnv.WINDMILL_WORKSPACE ?? "main";
  const scriptPath = "u/admin/thumbnail-screenshot";
  const endpoint = `${wEnv.WINDMILL_BASE}/api/w/${workspace}/jobs/run_wait_result/p/${scriptPath}`;
  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wEnv.WINDMILL_TOKEN}`
      },
      body: JSON.stringify(params)
      // CF Workers fetch supports signal but not timeout option directly
      // Windmill server handles 30s timeout on its side
    });
  } catch (err) {
    throw new Error(`Windmill network error: ${err.message}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Windmill API error ${res.status}: ${text}`);
  }
  const result = await res.json();
  let base64Str;
  if (typeof result === "string") {
    base64Str = result;
  } else if (result && typeof result["result"] === "string") {
    base64Str = result["result"];
  } else {
    throw new Error(`Unexpected Windmill response shape: ${JSON.stringify(result).slice(0, 200)}`);
  }
  return base64ToUint8Array(base64Str);
}
__name(runWindmillScreenshot, "runWindmillScreenshot");
function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(base64ToUint8Array, "base64ToUint8Array");

// src/lib/export-cache.ts
var EXPORTS_PREFIX = "exports/";
var BASE_URL = "https://snap.vibery.app";
async function computeExportHash(designId, updatedAt, scale, format) {
  const input = `${designId}:${updatedAt}:${scale}:${format}`;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return fullHex.slice(0, 16);
}
__name(computeExportHash, "computeExportHash");
async function computeInlineExportHash(bodyJson, scale, format) {
  const input = `inline:${bodyJson}:${scale}:${format}`;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return fullHex.slice(0, 16);
}
__name(computeInlineExportHash, "computeInlineExportHash");
async function getCachedExport(hash, format, env) {
  const key = `${EXPORTS_PREFIX}${hash}.${format}`;
  return env.R2_BUCKET.get(key);
}
__name(getCachedExport, "getCachedExport");
async function cacheExport(hash, format, data, env) {
  const key = `${EXPORTS_PREFIX}${hash}.${format}`;
  const contentType = format === "jpeg" ? "image/jpeg" : "image/png";
  await env.R2_BUCKET.put(key, data, {
    httpMetadata: { contentType }
  });
  return `${BASE_URL}/${key}`;
}
__name(cacheExport, "cacheExport");
function buildExportUrl(hash, format) {
  return `${BASE_URL}/${EXPORTS_PREFIX}${hash}.${format}`;
}
__name(buildExportUrl, "buildExportUrl");

// src/routes/generate.ts
var VI_STOP_WORDS = /* @__PURE__ */ new Set([
  "cho",
  "cua",
  "va",
  "la",
  "trong",
  "den",
  "voi",
  "mot",
  "nhung",
  "cac",
  "se",
  "da",
  "dang",
  "duoc"
]);
var DESIGN_ID_RE = /^d_[a-zA-Z0-9]+$/;
var ALLOWED_FORMATS = /* @__PURE__ */ new Set(["png", "jpeg"]);
async function handleGenerate(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }
  if (!body.design_id && !body.inline_design) {
    return errorResponse("Either design_id or inline_design is required");
  }
  if (body.design_id && !DESIGN_ID_RE.test(body.design_id)) {
    return errorResponse("Invalid design_id format");
  }
  const format = ALLOWED_FORMATS.has(body.format ?? "") ? body.format : "png";
  const scale = Math.min(Math.max(1, Math.round(body.scale ?? 2)), 4);
  const direct = body.direct === true;
  const autoImage = body.auto_image === true;
  try {
    let design;
    let tempDesignId = null;
    if (body.design_id) {
      const loaded = await r2GetJson(env, `designs/${body.design_id}.json`);
      if (!loaded) return errorResponse("Design not found", 404);
      design = loaded;
    } else {
      const inlineData = body.inline_design;
      tempDesignId = generateId("d_tmp_");
      const now = (/* @__PURE__ */ new Date()).toISOString();
      design = {
        id: tempDesignId,
        created_at: now,
        updated_at: now,
        size: inlineData.size ?? { preset: "fb-post", width: 1200, height: 630 },
        layout: inlineData.layout ?? "overlay-center",
        brand: inlineData.brand ?? "goha",
        params: inlineData.params ?? {}
      };
      await r2PutJson(env, `designs/${tempDesignId}.json`, design);
    }
    let renderWidth = design.size.width;
    let renderHeight = design.size.height;
    if (body.size_override) {
      const overrideSize = getSizeById(body.size_override);
      if (!overrideSize) {
        return errorResponse(`Unknown size_override: ${body.size_override}`);
      }
      renderWidth = overrideSize.w;
      renderHeight = overrideSize.h;
    }
    if (autoImage) {
      design = await fillAutoImages(design, env);
      await r2PutJson(env, `designs/${design.id}.json`, design);
    }
    let hash;
    if (body.design_id) {
      hash = await computeExportHash(design.id, design.updated_at, scale, format);
    } else {
      const hashInput = JSON.stringify({
        design,
        size_override: body.size_override ?? null,
        scale,
        format
      });
      hash = await computeInlineExportHash(hashInput, scale, format);
    }
    const cached = await getCachedExport(hash, format, env);
    if (cached) {
      const url = buildExportUrl(hash, format);
      if (direct) {
        const bytes = await cached.arrayBuffer();
        return new Response(bytes, {
          headers: {
            "Content-Type": format === "jpeg" ? "image/jpeg" : "image/png",
            "X-Cache": "HIT"
          }
        });
      }
      const result2 = {
        url,
        width: renderWidth * scale,
        height: renderHeight * scale,
        format,
        cached: true
      };
      return jsonResponse(result2);
    }
    const renderUrl = buildRenderUrl(request, design.id);
    const pngBytes = await runWindmillScreenshot(
      {
        url: renderUrl,
        width: renderWidth,
        height: renderHeight,
        selector: "#thumbnail",
        scale
      },
      env
    );
    const exportUrl = await cacheExport(hash, format, pngBytes, env);
    if (tempDesignId) {
      env.R2_BUCKET.delete(`designs/${tempDesignId}.json`).catch(() => {
      });
    }
    if (direct) {
      return new Response(pngBytes, {
        headers: {
          "Content-Type": format === "jpeg" ? "image/jpeg" : "image/png",
          "X-Cache": "MISS"
        }
      });
    }
    const result = {
      url: exportUrl,
      width: renderWidth * scale,
      height: renderHeight * scale,
      format,
      cached: false
    };
    return jsonResponse(result, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Generate error:", message);
    if (message.startsWith("Windmill")) {
      return errorResponse(`Screenshot failed: ${message}`, 502);
    }
    return errorResponse(`Generation failed: ${message}`, 500);
  }
}
__name(handleGenerate, "handleGenerate");
function extractKeywords(title) {
  return title.toLowerCase().split(/\s+/).filter((word) => word.length > 2 && !VI_STOP_WORDS.has(word)).slice(0, 4).join(" ");
}
__name(extractKeywords, "extractKeywords");
async function fillAutoImages(design, env) {
  if (!env.UNSPLASH_ACCESS_KEY) return design;
  const title = String(design.params.title ?? "");
  if (!title) return design;
  const keywords = extractKeywords(title);
  if (!keywords) return design;
  const imageKeys = ["feature_image", "image_1", "image_2", "image_3", "image_4"];
  const emptySlots = imageKeys.filter((k) => !design.params[k]);
  if (emptySlots.length === 0) return design;
  try {
    const results = await searchUnsplash(keywords, emptySlots.length, env);
    if (results.length === 0) return design;
    const updatedParams = { ...design.params };
    results.forEach((img, i) => {
      if (emptySlots[i]) {
        updatedParams[emptySlots[i]] = img.url_full;
      }
    });
    return {
      ...design,
      params: updatedParams,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (err) {
    console.warn("auto_image Unsplash error:", err.message);
    return design;
  }
}
__name(fillAutoImages, "fillAutoImages");
function buildRenderUrl(request, designId) {
  const origin = new URL(request.url).origin;
  return `${origin}/api/render?d=${encodeURIComponent(designId)}`;
}
__name(buildRenderUrl, "buildRenderUrl");

// src/routes/sizes.ts
function buildCategories() {
  const map = {};
  for (const preset of SIZE_PRESETS) {
    if (!map[preset.category]) map[preset.category] = [];
    map[preset.category].push(preset.id);
  }
  return map;
}
__name(buildCategories, "buildCategories");
function handleSizes() {
  return jsonResponse({
    sizes: SIZE_PRESETS.map((s) => ({
      id: s.id,
      name: s.name,
      width: s.w,
      height: s.h,
      category: s.category
    })),
    categories: buildCategories()
  });
}
__name(handleSizes, "handleSizes");

// src/index.ts
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return corsResponse();
    }
    if (path === "/" || path === "") {
      return handleBuilder();
    }
    if (path.startsWith("/d/")) {
      const designId = path.slice(3);
      return handleDesignView(designId, env);
    }
    if (path === "/api/sizes" && method === "GET") {
      return handleSizes();
    }
    if (path === "/api/layouts" && method === "GET") {
      const category = url.searchParams.get("category");
      const layouts = Object.values(LAYOUTS).map((l) => ({
        id: l.id,
        name: l.name,
        categories: l.categories,
        params: l.params
      }));
      if (category) {
        return jsonResponse(layouts.filter((l) => l.categories.includes(category)));
      }
      return jsonResponse(layouts);
    }
    if (path.startsWith("/api/brands") && method === "GET") {
      const brandsResponse = await handleBrandsRoute(request, env, path);
      if (brandsResponse) return brandsResponse;
    }
    if (path === "/api/designs" && method === "POST") {
      return handleDesignCreate(request, env);
    }
    if (path.startsWith("/api/designs/") && method === "GET") {
      const designId = path.split("/")[3];
      return handleDesignGet(designId, env);
    }
    if (path.startsWith("/api/designs/") && method === "PUT") {
      const designId = path.split("/")[3];
      return handleDesignUpdate(designId, request, env);
    }
    if (path === "/api/render" && method === "GET") {
      return handleRender(url, env);
    }
    if (path === "/api/generate" && method === "POST") {
      return handleGenerate(request, env);
    }
    if (path === "/api/backgrounds" && method === "GET") {
      return handleBackgrounds(url, env);
    }
    if (path === "/api/backgrounds/upload" && method === "POST") {
      return handleBackgroundUpload(request, env);
    }
    if (path === "/api/search/images" && method === "GET") {
      return handleImageSearch(url, env);
    }
    if (path.startsWith("/api/")) {
      return notFoundResponse("API endpoint not found");
    }
    return notFoundResponse();
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-m0q4Lf/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-m0q4Lf/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
