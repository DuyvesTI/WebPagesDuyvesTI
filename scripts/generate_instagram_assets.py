#!/usr/bin/env python3
"""
generate_instagram_assets.py
Generates pixel-perfect, high-resolution branding assets for DuyvesTI optimized for Instagram.
Includes:
1. instagram-avatar-monogram-dark.png (1080x1080) - Foto de Perfil Principal
2. instagram-avatar-monogram-light.png (1080x1080) - Foto de Perfil Modo Claro
3. instagram-avatar-full-logo.png (1080x1080) - Foto de Perfil con Monograma + Nombre
4. instagram-post-feed.png (1080x1080) - Post Cuadrado de Lanzamiento / Presentación
5. instagram-story-cover.png (1080x1920) - Portada de Historias / Reel / Destacadas
6. instagram-profile-mockup.png (1080x1080) - Mockup de visualización en la App de Instagram
7. duyvesti-monogram-transparent.png (1080x1080) - Monograma con fondo transparente
8. duyvesti-logo-horizontal-transparent.png (1920x600) - Logo completo horizontal transparente
9. instagram-avatar-monogram.svg - Vector escalable para perfil
10. duyvesti-logo-completo.svg - Vector escalable horizontal
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../assets/branding'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
FONT_REGULAR = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'

# DuyvesTI Brand Palette
COLOR_ORANGE = (255, 106, 19)        # #FF6A13
COLOR_ORANGE_LIGHT = (255, 162, 76)  # #FFA24C
COLOR_NAVY_CANVAS = (10, 13, 20)     # #0A0D14
COLOR_NAVY_SURFACE = (18, 23, 34)    # #121722
COLOR_NAVY_ELEVATED = (26, 34, 52)   # #1A2234
COLOR_TEXT_PRIMARY = (241, 245, 249) # #F1F5F9
COLOR_TEXT_SECONDARY = (148, 163, 184) # #94A3B8
COLOR_BORDER_GLASS = (255, 255, 255, 30)
COLOR_WHITE = (255, 255, 255)
COLOR_GREEN = (16, 185, 129)         # #10B981


def create_radial_gradient(width, height, center_color, outer_color, glow_color=None, glow_intensity=0.0):
    """Creates a smooth radial gradient background with optional center ambient glow."""
    base = Image.new('RGB', (width, height), outer_color)
    draw = ImageDraw.Draw(base)
    cx, cy = width / 2.0, height / 2.0
    max_radius = math.sqrt(cx**2 + cy**2)

    steps = 140
    for i in range(steps, 0, -1):
        r = max_radius * (i / steps)
        t = i / steps
        red = int(center_color[0] + (outer_color[0] - center_color[0]) * (t**0.8))
        green = int(center_color[1] + (outer_color[1] - center_color[1]) * (t**0.8))
        blue = int(center_color[2] + (outer_color[2] - center_color[2]) * (t**0.8))

        if glow_color and glow_intensity > 0 and t < 0.6:
            glow_factor = (1.0 - (t / 0.6)) * glow_intensity
            red = min(255, int(red + glow_color[0] * glow_factor))
            green = min(255, int(green + glow_color[1] * glow_factor))
            blue = min(255, int(blue + glow_color[2] * glow_factor))

        box = [cx - r, cy - r, cx + r, cy + r]
        draw.ellipse(box, fill=(red, green, blue))
    return base


def render_gradient_text(canvas, pos, text, font, color_start, color_end):
    """Renders text with a smooth linear gradient."""
    # Measure text
    dummy = ImageDraw.Draw(canvas)
    bbox = dummy.textbbox(pos, text, font=font)
    tw = max(1, bbox[2] - bbox[0])
    th = max(1, bbox[3] - bbox[1])

    # Create mask
    mask = Image.new('L', (tw, th), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.text((-bbox[0] + pos[0], -bbox[1] + pos[1]), text, font=font, fill=255)

    # Create gradient
    grad = Image.new('RGBA', (tw, th))
    for y in range(th):
        factor = y / max(1, th - 1)
        r = int(color_start[0] + (color_end[0] - color_start[0]) * factor)
        g = int(color_start[1] + (color_end[1] - color_start[1]) * factor)
        b = int(color_start[2] + (color_end[2] - color_start[2]) * factor)
        for x in range(tw):
            grad.putpixel((x, y), (r, g, b, 255))

    canvas.paste(grad, (bbox[0], bbox[1]), mask)


def render_monogram_badge(size, radius, border_width=4, is_dark=True):
    """
    Renders the iconic squircle monogram badge at given size with shadow and border.
    Returns RGBA Image of dimension (size, size).
    """
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw rounded rect base
    bg_color = (20, 26, 38, 252) if is_dark else (255, 255, 255, 255)
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=bg_color)

    # Draw subtle glass border
    if border_width > 0:
        border_col = (255, 255, 255, 38) if is_dark else (226, 232, 240, 255)
        draw.rounded_rectangle([0, 0, size, size], radius=radius, outline=border_col, width=border_width)

    # Typography: "D" in Orange Gradient, "TI" in Crisp White
    font_size = int(size * 0.52)
    font = ImageFont.truetype(FONT_BOLD, font_size)

    d_bbox = draw.textbbox((0, 0), "D", font=font)
    ti_bbox = draw.textbbox((0, 0), "TI", font=font)

    d_w = d_bbox[2] - d_bbox[0]
    ti_w = ti_bbox[2] - ti_bbox[0]
    h = max(d_bbox[3] - d_bbox[1], ti_bbox[3] - ti_bbox[1])

    kerning = int(font_size * -0.04)
    total_w = d_w + kerning + ti_w

    start_x = (size - total_w) / 2.0
    start_y = (size - h) / 2.0 - (d_bbox[1])

    # Draw "D" with vibrant gradient
    render_gradient_text(img, (int(start_x), int(start_y)), "D", font, COLOR_ORANGE_LIGHT, COLOR_ORANGE)

    # Draw "TI"
    ti_color = COLOR_TEXT_PRIMARY if is_dark else (15, 23, 42)
    draw.text((int(start_x + d_w + kerning), int(start_y)), "TI", font=font, fill=ti_color)

    return img


def generate_avatar_dark():
    """Generates the primary Instagram Profile Picture (1080x1080) with 2x supersampling."""
    SCALE = 2
    CANVAS_SIZE = 1080 * SCALE
    bg = create_radial_gradient(
        CANVAS_SIZE,
        CANVAS_SIZE,
        center_color=(18, 24, 36),
        outer_color=(8, 10, 16),
        glow_color=COLOR_ORANGE,
        glow_intensity=0.12
    ).convert('RGBA')

    # Add soft ambient glow circle behind the badge
    glow = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    gcx, gcy = CANVAS_SIZE / 2, CANVAS_SIZE / 2
    glow_r = int(380 * SCALE)
    glow_draw.ellipse([gcx - glow_r, gcy - glow_r, gcx + glow_r, gcy + glow_r], fill=(255, 106, 19, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80 * SCALE))
    bg.alpha_composite(glow)

    # Badge (580px at 1x => 1160px at 2x)
    badge_size = 580 * SCALE
    badge_radius = int(badge_size * 0.285)
    badge = render_monogram_badge(badge_size, badge_radius, border_width=4 * SCALE, is_dark=True)

    # Drop shadow
    shadow = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    bx = (CANVAS_SIZE - badge_size) // 2
    by = (CANVAS_SIZE - badge_size) // 2
    shadow_draw.rounded_rectangle([bx, by + int(12 * SCALE), bx + badge_size, by + badge_size + int(12 * SCALE)],
                                 radius=badge_radius, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=24 * SCALE))
    bg.alpha_composite(shadow)
    bg.alpha_composite(badge, (bx, by))

    final = bg.resize((1080, 1080), Image.Resampling.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, 'instagram-avatar-monogram-dark.png')
    final.save(output_path, 'PNG', quality=95, optimize=True)
    print(f"Generated: {output_path}")


def generate_avatar_light():
    """Generates the clean light version for Instagram Profile Picture (1080x1080)."""
    SCALE = 2
    CANVAS_SIZE = 1080 * SCALE
    bg = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (248, 250, 252, 255))

    badge_size = 580 * SCALE
    badge_radius = int(badge_size * 0.285)
    badge = render_monogram_badge(badge_size, badge_radius, border_width=0, is_dark=True)

    shadow = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    bx = (CANVAS_SIZE - badge_size) // 2
    by = (CANVAS_SIZE - badge_size) // 2
    shadow_draw.rounded_rectangle([bx, by + int(10 * SCALE), bx + badge_size, by + badge_size + int(10 * SCALE)],
                                 radius=badge_radius, fill=(15, 23, 42, 40))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=20 * SCALE))
    bg.alpha_composite(shadow)
    bg.alpha_composite(badge, (bx, by))

    final = bg.resize((1080, 1080), Image.Resampling.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, 'instagram-avatar-monogram-light.png')
    final.save(output_path, 'PNG', quality=95, optimize=True)
    print(f"Generated: {output_path}")


def generate_avatar_full_logo():
    """Generates an Instagram Profile Picture that includes the Monogram + DuyvesTI + Desarrollo Web."""
    SCALE = 2
    CANVAS_SIZE = 1080 * SCALE
    bg = create_radial_gradient(
        CANVAS_SIZE,
        CANVAS_SIZE,
        center_color=(18, 24, 36),
        outer_color=(8, 10, 16),
        glow_color=COLOR_ORANGE,
        glow_intensity=0.08
    ).convert('RGBA')

    badge_size = 350 * SCALE
    badge_radius = int(badge_size * 0.285)
    badge = render_monogram_badge(badge_size, badge_radius, border_width=3 * SCALE, is_dark=True)

    total_content_height = badge_size + int(32 * SCALE) + int(76 * SCALE) + int(14 * SCALE) + int(24 * SCALE)
    start_y = (CANVAS_SIZE - total_content_height) // 2 - int(10 * SCALE)
    bx = (CANVAS_SIZE - badge_size) // 2

    shadow = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle([bx, start_y + int(8 * SCALE), bx + badge_size, start_y + badge_size + int(8 * SCALE)],
                                 radius=badge_radius, fill=(0, 0, 0, 100))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=16 * SCALE))
    bg.alpha_composite(shadow)
    bg.alpha_composite(badge, (bx, start_y))

    draw = ImageDraw.Draw(bg)

    # Title: DuyvesTI
    font_title = ImageFont.truetype(FONT_BOLD, int(76 * SCALE))
    title_text = "DuyvesTI"
    t_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    t_x = (CANVAS_SIZE - t_w) // 2
    t_y = start_y + badge_size + int(28 * SCALE)
    draw.text((t_x, t_y), title_text, font=font_title, fill=COLOR_TEXT_PRIMARY)

    # Subtitle: DESARROLLO WEB
    font_sub = ImageFont.truetype(FONT_BOLD, int(24 * SCALE))
    sub_text = "D E S A R R O L L O   W E B"
    s_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    s_w = s_bbox[2] - s_bbox[0]
    s_x = (CANVAS_SIZE - s_w) // 2
    s_y = t_y + int(76 * SCALE) + int(14 * SCALE)
    draw.text((s_x, s_y), sub_text, font=font_sub, fill=COLOR_TEXT_SECONDARY)

    final = bg.resize((1080, 1080), Image.Resampling.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, 'instagram-avatar-full-logo.png')
    final.save(output_path, 'PNG', quality=95, optimize=True)
    print(f"Generated: {output_path}")


def generate_feed_post():
    """Generates an Instagram Post (1080x1080) for brand presentation."""
    SCALE = 2
    CANVAS_SIZE = 1080 * SCALE
    bg = create_radial_gradient(
        CANVAS_SIZE,
        CANVAS_SIZE,
        center_color=(18, 24, 38),
        outer_color=(10, 13, 20),
        glow_color=COLOR_ORANGE,
        glow_intensity=0.10
    ).convert('RGBA')

    draw = ImageDraw.Draw(bg)

    # Top brand badge: "• DUYVESTI CHILE"
    badge_font = ImageFont.truetype(FONT_BOLD, int(22 * SCALE))
    badge_text = "DuyvesTI  •  Desarrollo Web Profesional"
    b_bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    b_w = b_bbox[2] - b_bbox[0]
    b_h = b_bbox[3] - b_bbox[1]

    top_badge_y = int(110 * SCALE)
    pad_x = int(24 * SCALE)
    pad_y = int(12 * SCALE)
    rect_box = [
        (CANVAS_SIZE - b_w) // 2 - pad_x,
        top_badge_y - pad_y,
        (CANVAS_SIZE + b_w) // 2 + pad_x,
        top_badge_y + b_h + pad_y
    ]
    draw.rounded_rectangle(rect_box, radius=int(20 * SCALE), fill=(255, 106, 19, 25), outline=(255, 106, 19, 80), width=2 * SCALE)
    draw.text(((CANVAS_SIZE - b_w) // 2, top_badge_y), badge_text, font=badge_font, fill=COLOR_ORANGE_LIGHT)

    # Central Monogram Badge
    badge_size = 400 * SCALE
    badge_radius = int(badge_size * 0.285)
    badge = render_monogram_badge(badge_size, badge_radius, border_width=4 * SCALE, is_dark=True)

    by = int(220 * SCALE)
    bx = (CANVAS_SIZE - badge_size) // 2

    glow = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    gcx, gcy = CANVAS_SIZE // 2, by + badge_size // 2
    glow_r = int(260 * SCALE)
    glow_draw.ellipse([gcx - glow_r, gcy - glow_r, gcx + glow_r, gcy + glow_r], fill=(255, 106, 19, 50))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=60 * SCALE))
    bg.alpha_composite(glow)

    shadow = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle([bx, by + int(10 * SCALE), bx + badge_size, by + badge_size + int(10 * SCALE)],
                                 radius=badge_radius, fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=20 * SCALE))
    bg.alpha_composite(shadow)
    bg.alpha_composite(badge, (bx, by))

    # Headline: "Ingeniería Web para PyMEs y Startups"
    font_h1 = ImageFont.truetype(FONT_BOLD, int(46 * SCALE))
    h1_text = "Ingeniería Web para PyMEs y Startups"
    h1_bbox = draw.textbbox((0, 0), h1_text, font=font_h1)
    h1_w = h1_bbox[2] - h1_bbox[0]
    h1_y = by + badge_size + int(46 * SCALE)
    draw.text(((CANVAS_SIZE - h1_w) // 2, h1_y), h1_text, font=font_h1, fill=COLOR_TEXT_PRIMARY)

    # Value props pills
    pills = [
        "100% Dueño de tu Web",
        "Sin Arriendos Mensuales",
        "Paga en 2 Cuotas 50/50"
    ]
    font_pill = ImageFont.truetype(FONT_BOLD, int(22 * SCALE))
    pill_y = h1_y + int(70 * SCALE)

    total_pills_w = 0
    pill_widths = []
    pill_padding = int(20 * SCALE)
    gap = int(16 * SCALE)
    for p in pills:
        p_bbox = draw.textbbox((0, 0), p, font=font_pill)
        pw = (p_bbox[2] - p_bbox[0]) + pill_padding * 2
        pill_widths.append(pw)
        total_pills_w += pw
    total_pills_w += gap * (len(pills) - 1)

    curr_x = (CANVAS_SIZE - total_pills_w) // 2
    for i, p in enumerate(pills):
        pw = pill_widths[i]
        draw.rounded_rectangle([curr_x, pill_y, curr_x + pw, pill_y + int(46 * SCALE)],
                               radius=int(23 * SCALE), fill=(255, 255, 255, 15), outline=(255, 255, 255, 35), width=2 * SCALE)
        p_bbox = draw.textbbox((0, 0), p, font=font_pill)
        text_w = p_bbox[2] - p_bbox[0]
        draw.text((curr_x + (pw - text_w) // 2, pill_y + int(11 * SCALE)), p, font=font_pill, fill=COLOR_TEXT_SECONDARY)
        curr_x += pw + gap

    # Bottom domain bar
    font_url = ImageFont.truetype(FONT_BOLD, int(30 * SCALE))
    url_text = "duyvesti.cl"
    u_bbox = draw.textbbox((0, 0), url_text, font=font_url)
    u_w = u_bbox[2] - u_bbox[0]
    u_y = int(930 * SCALE)
    draw.text(((CANVAS_SIZE - u_w) // 2, u_y), url_text, font=font_url, fill=COLOR_ORANGE)

    final = bg.resize((1080, 1080), Image.Resampling.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, 'instagram-post-feed.png')
    final.save(output_path, 'PNG', quality=95, optimize=True)
    print(f"Generated: {output_path}")


def generate_story_cover():
    """Generates an Instagram Story / Highlight Cover (1080x1920) 9:16 aspect ratio."""
    SCALE = 2
    WIDTH = 1080 * SCALE
    HEIGHT = 1920 * SCALE
    bg = create_radial_gradient(
        WIDTH,
        HEIGHT,
        center_color=(18, 24, 38),
        outer_color=(8, 10, 16),
        glow_color=COLOR_ORANGE,
        glow_intensity=0.10
    ).convert('RGBA')

    badge_size = 480 * SCALE
    badge_radius = int(badge_size * 0.285)
    badge = render_monogram_badge(badge_size, badge_radius, border_width=4 * SCALE, is_dark=True)

    bx = (WIDTH - badge_size) // 2
    by = (HEIGHT - badge_size) // 2 - int(80 * SCALE)

    glow = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    gcx, gcy = WIDTH // 2, by + badge_size // 2
    glow_r = int(320 * SCALE)
    glow_draw.ellipse([gcx - glow_r, gcy - glow_r, gcx + glow_r, gcy + glow_r], fill=(255, 106, 19, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80 * SCALE))
    bg.alpha_composite(glow)

    shadow = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle([bx, by + int(12 * SCALE), bx + badge_size, by + badge_size + int(12 * SCALE)],
                                 radius=badge_radius, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=24 * SCALE))
    bg.alpha_composite(shadow)
    bg.alpha_composite(badge, (bx, by))

    draw = ImageDraw.Draw(bg)
    font_title = ImageFont.truetype(FONT_BOLD, int(64 * SCALE))
    title_text = "DuyvesTI"
    t_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    t_y = by + badge_size + int(40 * SCALE)
    draw.text(((WIDTH - t_w) // 2, t_y), title_text, font=font_title, fill=COLOR_TEXT_PRIMARY)

    font_sub = ImageFont.truetype(FONT_BOLD, int(26 * SCALE))
    sub_text = "D E S A R R O L L O   W E B"
    s_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    s_w = s_bbox[2] - s_bbox[0]
    s_y = t_y + int(74 * SCALE)
    draw.text(((WIDTH - s_w) // 2, s_y), sub_text, font=font_sub, fill=COLOR_TEXT_SECONDARY)

    final = bg.resize((1080, 1920), Image.Resampling.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, 'instagram-story-cover.png')
    final.save(output_path, 'PNG', quality=95, optimize=True)
    print(f"Generated: {output_path}")


def generate_profile_mockup():
    """
    Generates a visual mockup showing how the logo appears cropped as a circle
    in the Instagram app profile header.
    """
    SCALE = 2
    CANVAS_SIZE = 1080 * SCALE
    bg = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 255))
    draw = ImageDraw.Draw(bg)

    # Header bar
    font_header = ImageFont.truetype(FONT_BOLD, int(36 * SCALE))
    draw.text((int(50 * SCALE), int(60 * SCALE)), "duyvesti.cl", font=font_header, fill=COLOR_TEXT_PRIMARY)

    # Load avatar dark
    avatar_path = os.path.join(OUTPUT_DIR, 'instagram-avatar-monogram-dark.png')
    avatar_img = Image.open(avatar_path).convert('RGBA').resize((240 * SCALE, 240 * SCALE), Image.Resampling.LANCZOS)

    # Circular mask for avatar
    mask = Image.new('L', (240 * SCALE, 240 * SCALE), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([0, 0, 240 * SCALE, 240 * SCALE], fill=255)

    # Instagram story rainbow ring
    ring_size = int(246 * SCALE)
    ring_img = Image.new('RGBA', (ring_size, ring_size), (0, 0, 0, 0))
    ring_draw = ImageDraw.Draw(ring_img)
    ring_draw.ellipse([0, 0, ring_size, ring_size], outline=(255, 106, 19, 255), width=int(6 * SCALE))
    bg.alpha_composite(ring_img, (int(47 * SCALE), int(147 * SCALE)))

    # Paste circular cropped avatar
    bg.paste(avatar_img, (int(50 * SCALE), int(150 * SCALE)), mask)

    # Stats: Posts, Followers, Following
    stats = [("12", "Publicaciones"), ("1.4k", "Seguidores"), ("84", "Siguiendo")]
    stat_x = int(420 * SCALE)
    stat_spacing = int(220 * SCALE)
    font_stat_num = ImageFont.truetype(FONT_BOLD, int(34 * SCALE))
    font_stat_lbl = ImageFont.truetype(FONT_REGULAR, int(22 * SCALE))

    for i, (num, lbl) in enumerate(stats):
        cx = stat_x + i * stat_spacing
        n_box = draw.textbbox((0, 0), num, font=font_stat_num)
        nw = n_box[2] - n_box[0]
        draw.text((cx - nw // 2, int(190 * SCALE)), num, font=font_stat_num, fill=COLOR_WHITE)

        l_box = draw.textbbox((0, 0), lbl, font=font_stat_lbl)
        lw = l_box[2] - l_box[0]
        draw.text((cx - lw // 2, int(240 * SCALE)), lbl, font=font_stat_lbl, fill=COLOR_TEXT_SECONDARY)

    # Bio section
    font_bio_title = ImageFont.truetype(FONT_BOLD, int(30 * SCALE))
    font_bio_body = ImageFont.truetype(FONT_REGULAR, int(23 * SCALE))
    font_bio_link = ImageFont.truetype(FONT_BOLD, int(24 * SCALE))

    draw.text((int(50 * SCALE), int(420 * SCALE)), "DuyvesTI  |  Desarrollo Web & Software", font=font_bio_title, fill=COLOR_WHITE)
    draw.text((int(50 * SCALE), int(465 * SCALE)), "• Sitios web de alto rendimiento para PyMEs y Startups en Chile", font=font_bio_body, fill=COLOR_TEXT_PRIMARY)
    draw.text((int(50 * SCALE), int(505 * SCALE)), "• 100% dueno de tu codigo fuente — Sin arriendos mensuales", font=font_bio_body, fill=COLOR_TEXT_PRIMARY)
    draw.text((int(50 * SCALE), int(545 * SCALE)), "• Entrega rapida llave en mano — Webpay + SEO Local", font=font_bio_body, fill=COLOR_TEXT_PRIMARY)
    draw.text((int(50 * SCALE), int(590 * SCALE)), "duyvesti.cl", font=font_bio_link, fill=COLOR_ORANGE_LIGHT)

    # Buttons: "Seguir", "Enviar mensaje", "Contactar"
    btn_y = int(640 * SCALE)
    btn_h = int(60 * SCALE)
    btn_r = int(14 * SCALE)

    # Button 1: Seguir
    draw.rounded_rectangle([int(50 * SCALE), btn_y, int(470 * SCALE), btn_y + btn_h], radius=btn_r, fill=COLOR_ORANGE)
    b1_box = draw.textbbox((0, 0), "Seguir", font=font_bio_title)
    b1_w = b1_box[2] - b1_box[0]
    draw.text((int(50 * SCALE) + (int(420 * SCALE) - b1_w) // 2, btn_y + int(14 * SCALE)), "Seguir", font=font_bio_title, fill=COLOR_WHITE)

    # Button 2: Mensaje
    draw.rounded_rectangle([int(490 * SCALE), btn_y, int(910 * SCALE), btn_y + btn_h], radius=btn_r, fill=(38, 38, 38, 255))
    b2_box = draw.textbbox((0, 0), "Mensaje", font=font_bio_title)
    b2_w = b2_box[2] - b2_box[0]
    draw.text((int(490 * SCALE) + (int(420 * SCALE) - b2_w) // 2, btn_y + int(14 * SCALE)), "Mensaje", font=font_bio_title, fill=COLOR_WHITE)

    # Highlights (Historias destacadas)
    hl_y = int(740 * SCALE)
    highlights = ["Precios", "Proceso", "Clientes", "FAQ", "Cotizar"]
    hl_gap = int(200 * SCALE)
    for i, name in enumerate(highlights):
        hx = int(80 * SCALE) + i * hl_gap
        # Circle
        draw.ellipse([hx, hl_y, hx + int(130 * SCALE), hl_y + int(130 * SCALE)], fill=(20, 26, 38, 255), outline=(50, 50, 50, 255), width=int(3 * SCALE))
        # Inner mini monogram
        mini_d = ImageFont.truetype(FONT_BOLD, int(44 * SCALE))
        d_box = draw.textbbox((0, 0), "DTI", font=mini_d)
        dw = d_box[2] - d_box[0]
        draw.text((hx + (int(130 * SCALE) - dw) // 2, hl_y + int(42 * SCALE)), "DTI", font=mini_d, fill=COLOR_ORANGE)
        # Label
        lbl_box = draw.textbbox((0, 0), name, font=font_stat_lbl)
        lw = lbl_box[2] - lbl_box[0]
        draw.text((hx + (int(130 * SCALE) - lw) // 2, hl_y + int(145 * SCALE)), name, font=font_stat_lbl, fill=COLOR_TEXT_SECONDARY)

    # Grid preview separator
    sep_y = int(950 * SCALE)
    draw.line([0, sep_y, CANVAS_SIZE, sep_y], fill=(40, 40, 40, 255), width=int(2 * SCALE))

    # Grid icon tab
    draw.text((int(250 * SCALE), sep_y + int(30 * SCALE)), "PUBLICACIONES", font=font_stat_lbl, fill=COLOR_WHITE)

    final = bg.resize((1080, 1080), Image.Resampling.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, 'instagram-profile-mockup.png')
    final.save(output_path, 'PNG', quality=95, optimize=True)
    print(f"Generated: {output_path}")


def generate_transparent_pngs():
    """Generates transparent PNGs of the monogram and full horizontal logo."""
    SCALE = 2

    # 1. Monogram Transparent (1080x1080)
    canvas = Image.new('RGBA', (1080 * SCALE, 1080 * SCALE), (0, 0, 0, 0))
    badge_size = 720 * SCALE
    badge_radius = int(badge_size * 0.285)
    badge = render_monogram_badge(badge_size, badge_radius, border_width=4 * SCALE, is_dark=True)
    bx = (1080 * SCALE - badge_size) // 2
    by = (1080 * SCALE - badge_size) // 2
    canvas.alpha_composite(badge, (bx, by))
    final = canvas.resize((1080, 1080), Image.Resampling.LANCZOS)
    out1 = os.path.join(OUTPUT_DIR, 'duyvesti-monogram-transparent.png')
    final.save(out1, 'PNG', optimize=True)
    print(f"Generated: {out1}")

    # 2. Horizontal Full Logo Transparent (1920x600)
    w = 1920 * SCALE
    h = 600 * SCALE
    canvas2 = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    badge_size2 = 360 * SCALE
    badge_radius2 = int(badge_size2 * 0.285)
    badge2 = render_monogram_badge(badge_size2, badge_radius2, border_width=3 * SCALE, is_dark=True)

    draw2 = ImageDraw.Draw(canvas2)
    font_title = ImageFont.truetype(FONT_BOLD, int(150 * SCALE))
    font_sub = ImageFont.truetype(FONT_BOLD, int(46 * SCALE))

    t_bbox = draw2.textbbox((0, 0), "DuyvesTI", font=font_title)
    s_bbox = draw2.textbbox((0, 0), "DESARROLLO WEB", font=font_sub)

    text_w = max(t_bbox[2] - t_bbox[0], s_bbox[2] - s_bbox[0])
    gap = int(60 * SCALE)
    total_group_w = badge_size2 + gap + text_w

    start_x = (w - total_group_w) // 2
    badge_y = (h - badge_size2) // 2

    canvas2.alpha_composite(badge2, (start_x, badge_y))

    tx = start_x + badge_size2 + gap
    ty = badge_y + int(30 * SCALE)
    draw2.text((tx, ty), "DuyvesTI", font=font_title, fill=COLOR_TEXT_PRIMARY)

    sy = ty + int(150 * SCALE) + int(10 * SCALE)
    draw2.text((tx, sy), "DESARROLLO WEB", font=font_sub, fill=COLOR_TEXT_SECONDARY)

    final2 = canvas2.resize((1920, 600), Image.Resampling.LANCZOS)
    out2 = os.path.join(OUTPUT_DIR, 'duyvesti-logo-horizontal-transparent.png')
    final2.save(out2, 'PNG', optimize=True)
    print(f"Generated: {out2}")


def generate_svg_files():
    """Generates clean, scalable SVG vector representations."""

    # 1. Instagram Avatar Monogram SVG (1080x1080)
    svg_avatar = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#121722"/>
      <stop offset="100%" stop-color="#080A10"/>
    </radialGradient>

    <!-- Warm Ambient Glow -->
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF6A13" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#FF6A13" stop-opacity="0"/>
    </radialGradient>

    <!-- Squircle Badge Gradient -->
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#171F2F"/>
      <stop offset="100%" stop-color="#0E131D"/>
    </linearGradient>

    <!-- Orange Letter Gradient -->
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFA24C"/>
      <stop offset="100%" stop-color="#FF6A13"/>
    </linearGradient>

    <!-- Badge Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#FF6A13" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.08"/>
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1080" height="1080" fill="url(#bgGrad)" />

  <!-- Ambient Glow -->
  <circle cx="540" cy="540" r="420" fill="url(#glowGrad)" />

  <!-- Monogram Box (580x580, corner radius 165) -->
  <rect x="250" y="250" width="580" height="580" rx="165" ry="165"
        fill="url(#badgeGrad)" stroke="url(#borderGrad)" stroke-width="4"
        filter="url(#badgeShadow)" />

  <!-- Monogram Letters -->
  <g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="300" letter-spacing="-12">
    <!-- Letter D in Brand Orange Gradient -->
    <text x="360" y="645" fill="url(#orangeGrad)">D</text>
    <!-- Letters TI in White -->
    <text x="548" y="645" fill="#F1F5F9">TI</text>
  </g>
</svg>
"""
    svg_avatar_path = os.path.join(OUTPUT_DIR, 'instagram-avatar-monogram.svg')
    with open(svg_avatar_path, 'w', encoding='utf-8') as f:
        f.write(svg_avatar)
    print(f"Generated: {svg_avatar_path}")

    # 2. Horizontal Full Logo SVG
    svg_full = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" width="800" height="240">
  <defs>
    <linearGradient id="badgeGradH" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1A2234"/>
      <stop offset="100%" stop-color="#0E131D"/>
    </linearGradient>
    <linearGradient id="orangeGradH" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFA24C"/>
      <stop offset="100%" stop-color="#FF6A13"/>
    </linearGradient>
    <linearGradient id="borderGradH" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.08"/>
    </linearGradient>
  </defs>

  <!-- Monogram Icon -->
  <rect x="20" y="20" width="200" height="200" rx="57" ry="57"
        fill="url(#badgeGradH)" stroke="url(#borderGradH)" stroke-width="2.5" />
  <g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="105" letter-spacing="-4">
    <text x="58" y="156" fill="url(#orangeGradH)">D</text>
    <text x="122" y="156" fill="#F1F5F9">TI</text>
  </g>

  <!-- Typography -->
  <text x="256" y="132" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="78" letter-spacing="-2" fill="#F1F5F9">DuyvesTI</text>
  <text x="258" y="178" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="24" letter-spacing="4" fill="#94A3B8">DESARROLLO WEB</text>
</svg>
"""
    svg_full_path = os.path.join(OUTPUT_DIR, 'duyvesti-logo-completo.svg')
    with open(svg_full_path, 'w', encoding='utf-8') as f:
        f.write(svg_full)
    print(f"Generated: {svg_full_path}")


def main():
    print("Generating DuyvesTI Instagram branding suite...")
    generate_avatar_dark()
    generate_avatar_light()
    generate_avatar_full_logo()
    generate_feed_post()
    generate_story_cover()
    generate_transparent_pngs()
    generate_svg_files()
    generate_profile_mockup()
    print("All branding assets generated successfully!")


if __name__ == '__main__':
    main()
