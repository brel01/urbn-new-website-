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
    "description": "Verify any property in Nigeria and find verified homes.",
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

# --- Open Graph 1200x630
def og(name, line1, line2, bg_img=None):
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (0, 0, 0))
    pat = Image.open(DA / "BRAND PATTERN WHITE.png").convert("L").resize((360, 360))
    tile = Image.new("RGB", pat.size, (0, 0, 0))
    tile.paste((22, 22, 26), mask=pat)
    for x in range(0, W, 360):
        for y in range(0, H, 360):
            im.paste(tile, (x, y))
    if bg_img:
        b = Image.open(bg_img).convert("RGB")
        b = b.crop((1010, 0, b.width, b.height))
        b = b.resize((int(b.width * H / b.height), H), Image.LANCZOS)
        fade = Image.linear_gradient("L").rotate(90).resize((b.width, H))
        fade = fade.point(lambda v: min(255, int(v * 2.2)))
        im.paste(b, (W - b.width, 0), fade)
    d = ImageDraw.Draw(im)
    w = word_white.copy(); w.thumbnail((210, 90), Image.LANCZOS)
    im.paste(w, (72, 70), w)
    f = ImageFont.truetype(str(FONT), 84)
    d.text((72, 300), line1, font=f, fill="white")
    d.text((72, 395), line2, font=f, fill=BLUE)
    d.text((72, 540), "urbn.ng", font=ImageFont.truetype(str(FONT), 30), fill=(160, 160, 170))
    im.save(PUB / "og" / f"{name}.png", optimize=True)

og("default", "Can you trust", "this property?", PUB / "images/hero-verify.webp")
print("ok")
