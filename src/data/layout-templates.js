// Layout templates with render functions
// MVP: overlay-center layout only

export const LAYOUTS = {
  'overlay-center': {
    id: 'overlay-center',
    name: 'Overlay Center',
    categories: ['landscape', 'square'],
    params: [
      { key: 'title', type: 'text', label: 'Title', required: true },
      { key: 'subtitle', type: 'text', label: 'Subtitle' },
      { key: 'bg_color', type: 'color', label: 'Background Color' },
      { key: 'title_color', type: 'color', label: 'Title Color' },
      { key: 'subtitle_color', type: 'color', label: 'Subtitle Color' },
    ],

    // Render thumbnail HTML with inline styles for capture reliability
    render({ width, height, title, subtitle, bg_color, title_color, subtitle_color, logo }) {
      const logoHtml = logo
        ? `<img src="${logo}" alt="logo" style="position:absolute;top:5%;right:5%;height:8%;object-fit:contain;" crossorigin="anonymous" />`
        : '';

      const subtitleHtml = subtitle
        ? `<p style="color:${subtitle_color};font-weight:500;font-size:clamp(0.9rem,2.5vw,1.8rem);margin-top:0.5em;padding:0 10%;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">${subtitle}</p>`
        : '';

      return `<div id="thumbnail" style="width:${width}px;height:${height}px;background:${bg_color};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">
  ${logoHtml}
  <h1 style="color:${title_color};font-weight:800;font-size:clamp(1.5rem,5vw,4rem);line-height:1.2;margin:0;padding:0 8%;font-family:'Montserrat',sans-serif;">${title || ''}</h1>
  ${subtitleHtml}
</div>`;
    },
  },
};

export function getLayoutById(id) {
  return LAYOUTS[id] || null;
}

export function getLayoutsForCategory(category) {
  return Object.values(LAYOUTS).filter(l => l.categories.includes(category));
}
