"""Generates app icons, the web manifest and Open Graph images.
    python3 scripts/build-social.py   (needs pillow + scripts/.fonts/*.ttf)"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DA = ROOT / "design assets"
PUB = ROOT / "public"
BLUE = (37, 61, 226)
FONT = ROOT / "scripts" / ".fonts" / "creato-bold.ttf"

def ink_crop(path):
    im = Image.open(path).convert("RGBA")
    return im.crop(im.getchannel("A").point(lambda a: 255 if a > 40 else 0).getbbox())

symbol_white = ink_crop(DA / "Urbn logo Icon white.png")
word_white = ink_crop(DA / "Urbn logo White.png")

def icon(size, pad=0.22, rounded=False):
    im = Image.new("RGBA", (size, size), BLUE + (255,))
    s = symbol_white.copy()
    s.thumbnail((int(size * (1 - 2 * pad)),) * 2, Image.LANCZOS)
    im.alpha_composite(s, ((size - s.width) // 2, (size - s.height) // 2))
    if rounded:
        m = Image.new("L", (size, size), 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, size, size), radius=size // 5, fill=255)
        im.putalpha(m)
    return im

(PUB / "icons").mkdir(exist_ok=True)
icon(32, 0.18, True).save(PUB / "icons/favicon-32.png")
icon(180, 0.22).convert("RGB").save(PUB / "icons/apple-touch-icon.png")
icon(192).save(PUB / "icons/icon-192.png")
icon(512).save(PUB / "icons/icon-512.png")
icon(512, 0.3).save(PUB / "icons/icon-maskable-512.png")

manifest = {
    "name": "Urbn: Digital Property Identity",
    "short_name": "Urbn",
    "description": "The digital infrastructure for housing.",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#000000",
    "theme_color": "#253DE2",
    "icons": [
        {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}
(PUB / "site.webmanifest").write_text(json.dumps(manifest, indent=2))

# --- Open Graph 1200x630, centre-weighted so WhatsApp's square crop keeps the logo
def og(name, tagline):
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), BLUE)
    pat = Image.open(DA / "BRAND PATTERN WHITE.png").convert("L").resize((300, 300))
    tile = Image.new("RGB", pat.size, BLUE)
    tile.paste((52, 76, 232), mask=pat)
    for x in range(0, W, 300):
        for y in range(0, H, 300):
            im.paste(tile, (x, y))
    # soft vignette towards the centre so the logo reads cleanly
    glow = Image.radial_gradient("L").resize((W, H)).point(lambda v: max(0, 255 - int(v * 1.4)))
    im = Image.composite(Image.new("RGB", (W, H), BLUE), im, glow)
    w = word_white.copy(); w.thumbnail((440, 200), Image.LANCZOS)
    im.paste(w, ((W - w.width) // 2, 175), w)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(str(FONT), 46)
    tw = d.textlength(tagline, font=f)
    d.text(((W - tw) / 2, 395), tagline, font=f, fill="white")
    small = ImageFont.truetype(str(FONT), 28)
    t2 = "Digital Property Identity — urbn.ng"
    d.text(((W - d.textlength(t2, font=small)) / 2, 470), t2, font=small, fill=(200, 208, 255))
    im.save(PUB / "og" / f"{name}.png", optimize=True)

og("default", "The digital infrastructure for housing")
print("ok")
