"""
Windmill script: thumbnail-screenshot
Deploy as: u/admin/thumbnail-screenshot

Captures a DOM element screenshot using CamoFox (Firefox-based anti-detect browser).
Returns base64-encoded PNG string.

Requirements (Windmill environment):
  pip install playwright camofox
  playwright install firefox
"""

import base64
from playwright.async_api import async_playwright


async def main(
    url: str,
    width: int = 1200,
    height: int = 630,
    selector: str = "#thumbnail",
    scale: int = 2,
) -> str:
    """
    Capture screenshot of a specific DOM element.

    Args:
        url: Full URL of the render page (e.g. https://snap.vibery.app/api/render?d=d_abc123)
        width: Design width in logical pixels
        height: Design height in logical pixels
        selector: CSS selector of the element to capture
        scale: Device pixel ratio multiplier (2 = 2x retina)

    Returns:
        Base64-encoded PNG string
    """
    async with async_playwright() as p:
        # Use Firefox for CamoFox-compatible rendering
        # CamoFox is a patched Firefox build — swap p.firefox for CamoFox launcher
        # when running in production Windmill environment
        browser = await p.firefox.launch(headless=True)

        try:
            page = await browser.new_page(
                viewport={"width": width * scale, "height": height * scale},
                device_scale_factor=scale,
            )

            # Navigate and wait for full render
            await page.goto(url, wait_until="networkidle", timeout=30000)

            # Wait for fonts to finish loading
            await page.wait_for_function("document.fonts.ready", timeout=10000)

            # Extra wait for any CSS animations or image loads
            await page.wait_for_timeout(500)

            # Locate target element
            el = await page.query_selector(selector)
            if not el:
                raise Exception(f"Element '{selector}' not found on page: {url}")

            # Capture element screenshot (returns PNG bytes)
            png_bytes = await el.screenshot(type="png")

        finally:
            await browser.close()

    return base64.b64encode(png_bytes).decode("utf-8")
