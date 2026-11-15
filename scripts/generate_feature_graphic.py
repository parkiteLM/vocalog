import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 2x supersampling for ultra crisp typography and graphics
SCALE = 2
WIDTH, HEIGHT = 1024 * SCALE, 500 * SCALE

# Colors (Hex to RGB)
BG_DARK = (11, 15, 25)       # #0B0F19
BG_SLATE = (15, 23, 42)      # #0F172A
BG_SURFACE = (30, 41, 59)    # #1E293B
TEAL_PRIMARY = (45, 212, 191)# #2DD4BF
TEAL_DARK = (13, 148, 136)   # #0D9488
CYAN_ACCENT = (56, 189, 248) # #38BDF8
TEXT_WHITE = (248, 250, 252) # #F8FAFC
TEXT_MUTED = (148, 163, 184) # #94A3B8
BORDER_COLOR = (51, 65, 85)  # #334155

# 1. Base Gradient Canvas
base = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
draw = ImageDraw.Draw(base)

# Horizontal + diagonal rich gradient
for x in range(WIDTH):
    factor = x / WIDTH
    r = int(BG_DARK[0] + (BG_SLATE[0] - BG_DARK[0]) * factor)
    g = int(BG_DARK[1] + (BG_SLATE[1] - BG_DARK[1]) * factor)
    b = int(BG_DARK[2] + (BG_SLATE[2] - BG_DARK[2]) * factor)
    draw.line([(x, 0), (x, HEIGHT)], fill=(r, g, b))

# Ambient Teal & Cyan Radial Glows
glow_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)

# Glow 1: Under Logo on the left
cx1, cy1 = int(240 * SCALE), int(250 * SCALE)
r1 = int(220 * SCALE)
glow_draw.ellipse([cx1 - r1, cy1 - r1, cx1 + r1, cy1 + r1], fill=(45, 212, 191, 40))

# Glow 2: Accent near top right
cx2, cy2 = int(880 * SCALE), int(100 * SCALE)
r2 = int(180 * SCALE)
glow_draw.ellipse([cx2 - r2, cy2 - r2, cx2 + r2, cy2 + r2], fill=(56, 189, 248, 25))

glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=60 * SCALE))
base.paste(Image.alpha_composite(Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0)), glow_layer), (0, 0), glow_layer)

# Re-acquire draw
draw = ImageDraw.Draw(base)

# Subtle decorative grid dots in background
dot_spacing = int(32 * SCALE)
for dx in range(int(30 * SCALE), WIDTH, dot_spacing):
    for dy in range(int(30 * SCALE), HEIGHT, dot_spacing):
        draw.ellipse([dx, dy, dx + 2 * SCALE, dy + 2 * SCALE], fill=(51, 65, 85, 80))

# 2. Render VocaLog Logo Emblem
logo_path = "assets/logo/CleanedLogoOnly.png"
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert("RGBA")
    logo_size = int(290 * SCALE)
    logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Shadow under logo
    shadow = Image.new("RGBA", (logo_size + 40 * SCALE, logo_size + 40 * SCALE), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.ellipse([10 * SCALE, 15 * SCALE, logo_size + 20 * SCALE, logo_size + 25 * SCALE], fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=15 * SCALE))
    
    logo_x = int(75 * SCALE)
    logo_y = int((HEIGHT - logo_size) // 2)
    base.paste(shadow, (logo_x - int(10 * SCALE), logo_y - int(5 * SCALE)), shadow)
    base.paste(logo, (logo_x, logo_y), logo)

# 3. Typography & Badges
font_bold = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf"
font_reg = "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"

f_badge = ImageFont.truetype(font_bold, int(15 * SCALE))
f_title = ImageFont.truetype(font_bold, int(64 * SCALE))
f_sub = ImageFont.truetype(font_bold, int(22 * SCALE))
f_desc = ImageFont.truetype(font_reg, int(17 * SCALE))
f_pill = ImageFont.truetype(font_bold, int(14 * SCALE))

text_x = int(410 * SCALE)
curr_y = int(72 * SCALE)

# Category pill: "✦ 100% PRIVATE • ON-DEVICE AI"
badge_text = "✦  100% PRIVATE • ON-DEVICE AI"
badge_bbox = f_badge.getbbox(badge_text)
badge_w = badge_bbox[2] - badge_bbox[0] + int(24 * SCALE)
badge_h = badge_bbox[3] - badge_bbox[1] + int(14 * SCALE)

draw.rounded_rectangle(
    [text_x, curr_y, text_x + badge_w, curr_y + badge_h],
    radius=int(12 * SCALE),
    fill=(45, 212, 191, 30),
    outline=TEAL_PRIMARY,
    width=int(1.5 * SCALE)
)
draw.text((text_x + int(12 * SCALE), curr_y + int(6 * SCALE)), badge_text, font=f_badge, fill=TEAL_PRIMARY)

curr_y += badge_h + int(14 * SCALE)

# Title: VocaLog
draw.text((text_x, curr_y), "VocaLog", font=f_title, fill=TEXT_WHITE)

curr_y += int(82 * SCALE)

# Subtitle: Voice to Bullet Journal in Seconds
draw.text((text_x, curr_y), "Voice to Bullet Journal in Seconds", font=f_sub, fill=CYAN_ACCENT)

curr_y += int(38 * SCALE)

# Description line
desc = "Speak naturally. Offline Whisper AI transcribes, cleans verbal"
desc2 = "fillers, and organizes your thoughts into clean bullet logs."
draw.text((text_x, curr_y), desc, font=f_desc, fill=TEXT_MUTED)
curr_y += int(26 * SCALE)
draw.text((text_x, curr_y), desc2, font=f_desc, fill=TEXT_MUTED)

curr_y += int(46 * SCALE)

# Feature Badges Row
pills = [
    ("🔒 Zero Cloud Tracking", TEAL_PRIMARY),
    ("⚡ Offline Whisper AI", CYAN_ACCENT),
    ("• Task ○ Event ✦ Note", TEXT_WHITE),
]

pill_x = text_x
for label, col in pills:
    p_bbox = f_pill.getbbox(label)
    pw = p_bbox[2] - p_bbox[0] + int(22 * SCALE)
    ph = p_bbox[3] - p_bbox[1] + int(16 * SCALE)
    
    draw.rounded_rectangle(
        [pill_x, curr_y, pill_x + pw, curr_y + ph],
        radius=int(8 * SCALE),
        fill=BG_SURFACE,
        outline=BORDER_COLOR,
        width=int(1.5 * SCALE)
    )
    draw.text((pill_x + int(11 * SCALE), curr_y + int(6 * SCALE)), label, font=f_pill, fill=col)
    pill_x += pw + int(12 * SCALE)

# 4. Downscale with high quality Lanczos filter to exact 1024x500 RGB (no alpha)
final_img = base.resize((1024, 500), Image.Resampling.LANCZOS).convert("RGB")

out_path = "assets/logo/google_play_feature_graphic_1024x500.png"
final_img.save(out_path, format="PNG", optimize=True)
print(f"Generated successfully: {out_path} ({final_img.size[0]}x{final_img.size[1]} {final_img.mode})")
