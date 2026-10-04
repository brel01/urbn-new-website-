"""
Builds the web image set in public/images from the raw brand files in
`figma/` and `design assets/`. Re-run whenever the source designs change.

    pip install pillow opencv-python-headless numpy
    python3 scripts/build-assets.py

Hero frames have their baked-in headline / search UI inpainted away so the
site can render real, crawlable HTML text on top of the artwork.
"""
from pathlib import Path
import cv2, numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
OUT.mkdir(parents=True, exist_ok=True)
FIG = ROOT / "figma"
DA = ROOT / "design assets"


def load(p):
    return Image.open(p).convert("RGB")


def save(im, name, widths=(None,), q=82):
    for w in widths:
        out = im if not w or im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        suffix = "" if w is None else f"-{w}"
        out.save(OUT / f"{name}{suffix}.webp", "WEBP", quality=q, method=6)


def inpaint(im, text_boxes, solid_boxes):
    a = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
    mask = np.zeros(a.shape[:2], np.uint8)
    for x0, y0, x1, y1, t in text_boxes:
        g = cv2.cvtColor(a[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY)
        mask[y0:y1, x0:x1] = cv2.dilate(((g < t) * 255).astype(np.uint8), np.ones((7, 7), np.uint8))
    for x0, y0, x1, y1 in solid_boxes:
        cv2.rectangle(mask, (x0, y0), (x1, y1), 255, -1)
    a = cv2.inpaint(a, mask, 9, cv2.INPAINT_TELEA)
    return Image.fromarray(cv2.cvtColor(a, cv2.COLOR_BGR2RGB))


home = load(FIG / "Homepage.png")
dpi = load(FIG / "DPI.png")
verify = load(FIG / "Verify a Property.png")
feat = load(FIG / "Features.png")

# --- Heroes
hero = inpaint(home.crop((0, 77, 1440, 784)), [(405, 135, 1035, 285, 75)], [(402, 312, 1040, 386)])
save(hero, "hero-lagos", (None, 768))
vh = inpaint(verify.crop((0, 77, 1440, 690)), [(405, 125, 1050, 270, 90), (450, 285, 995, 345, 140)], [(398, 354, 1042, 498)])
save(vh, "hero-verify", (None, 768))
# Portrait art for the phone hero: the clean right side of the verify scene
# (house + DPI plaque), clear of the inpainted area.
save(verify.crop((1050, 77, 1440, 690)), "hero-mobile")
save(feat.crop((448, 77, 1440, 605)), "hero-billboard", (None, 640))
save(dpi.crop((648, 144, 1440, 672)), "house-plaque", (None, 640))

# --- Homepage pieces
save(home.crop((630, 1600, 1440, 2088)), "house-identity", (None, 640))
save(home.crop((170, 1251, 525, 1432)), "stat-sunset")
save(home.crop((546, 1258, 900, 1432)), "stat-skyline")
save(home.crop((920, 1251, 1276, 1432)), "stat-phone")
save(home.crop((544, 2320, 896, 2568)), "property-card-scene")
save(home.crop((920, 2320, 1272, 2755)), "app-in-hand")
save(home.crop((160, 3345, 490, 3490)), "illus-owners")
save(home.crop((540, 3395, 900, 3505)), "illus-agents")
save(home.crop((960, 3345, 1290, 3490)), "illus-renters")
for name, x in (("story-latunde", 145), ("story-plaque", 556), ("story-ibadan", 967)):
    save(home.crop((x, 4800 + 26, x + 330, 4800 + 240)), name)

# --- DPI page pieces
save(dpi.crop((280, 2216, 704, 2584)), "illus-submit")
save(dpi.crop((741, 3048, 1264, 3520)), "property-card", (None,))
save(dpi.crop((280, 4971, 698, 5270)), "plaque-scene")
save(dpi.crop((1075, 7133, 1380, 7291)), "skyline-blue")

# --- Verify page pieces
save(verify.crop((64, 1592, 880, 2093)), "house-modern", (None, 640))
save(inpaint(verify.crop((360, 765, 646, 1011)), [], [(6, 6, 40, 40)]), "house-result")

# --- Brand pattern + logos
# White pattern -> alpha mask PNG, tinted in CSS (mask-image) for any background.
patw = Image.open(DA / "BRAND PATTERN WHITE.png").convert("L").resize((480, 480), Image.LANCZOS)
mask = Image.new("LA", patw.size); mask.putdata([(255, v) for v in patw.getdata()])
mask.save(OUT / "pattern-u.png", optimize=True)
print("done ->", OUT)
