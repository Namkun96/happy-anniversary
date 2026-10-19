import sys, os
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_rose_qr(target_url, output_path='Hoa_Hong_QR_Ky_Niem_5_Nam.png'):
    card_w, card_h = 1080, 1350
    bg = Image.new('RGB', (card_w, card_h), (8, 2, 18))
    draw = ImageDraw.Draw(bg)

    # Cosmic radial background
    for r in range(700, 0, -10):
        alpha = int(35 * (1 - r / 700))
        draw.ellipse([card_w//2 - r, 620 - r, card_w//2 + r, 620 + r], fill=(22 + alpha, 6 + alpha//2, 38 + alpha))

    # Top-down rose from roses-sheet.jpg
    rose_sheet = Image.open('roses-sheet.jpg').convert('RGBA')
    top_left_rose = rose_sheet.crop((0, 0, 512, 512))
    rose_big = top_left_rose.resize((780, 780), Image.Resampling.LANCZOS)

    # Circular feathered mask
    mask = Image.new('L', (780, 780), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([10, 10, 770, 770], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(15))

    rose_pos = (card_w//2 - 390, 260)
    bg.paste(rose_big, rose_pos, mask)

    # Generate QR Code
    qr = qrcode.QRCode(
        version=3,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(target_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color='#1a0524', back_color='white').convert('RGBA')
    qr_w, qr_h = 320, 320
    qr_img = qr_img.resize((qr_w, qr_h), Image.Resampling.LANCZOS)

    # Golden glowing medallion
    medallion_size = 360
    medallion = Image.new('RGBA', (medallion_size, medallion_size), (0, 0, 0, 0))
    m_draw = ImageDraw.Draw(medallion)
    m_draw.ellipse([0, 0, medallion_size, medallion_size], fill=(255, 209, 102, 140))
    m_draw.ellipse([8, 8, medallion_size - 8, medallion_size - 8], fill=(255, 77, 141, 200))
    m_draw.ellipse([16, 16, medallion_size - 16, medallion_size - 16], fill=(255, 255, 255, 255))

    medallion.paste(qr_img, (medallion_size//2 - qr_w//2, medallion_size//2 - qr_h//2), qr_img)
    bg.paste(medallion, (card_w//2 - medallion_size//2, 650 - medallion_size//2), medallion)

    draw = ImageDraw.Draw(bg)
    try:
        font_title = ImageFont.truetype('arialbd.ttf', 44)
        font_sub = ImageFont.truetype('arial.ttf', 28)
        font_hint = ImageFont.truetype('arialbd.ttf', 32)
        font_note = ImageFont.truetype('arial.ttf', 24)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_hint = font_title
        font_note = font_title

    # Header texts
    draw.text((card_w//2, 90), '✨ HAPPY ANNIVERSARY 5 NĂM ✨', fill='#ffd166', font=font_title, anchor='mm')
    draw.text((card_w//2, 145), '20.10.2021 — 20.10.2026 • Ck Yêu Vk ❤️', fill='#ffb3c6', font=font_sub, anchor='mm')
    draw.text((card_w//2, 195), 'Chúc mừng nửa thập kỷ chúng mình bên nhau', fill='#fff0f5', font=font_sub, anchor='mm')

    # Footer texts
    draw.text((card_w//2, 1100), '🌹 Chạm / Mở Camera hoặc Zalo quét mã QR 🌹', fill='#ffd166', font=font_hint, anchor='mm')
    draw.text((card_w//2, 1150), 'Để khám phá món quà bí mật & hành trình vũ trụ 3D của chúng mình', fill='#ffccd5', font=font_sub, anchor='mm')
    draw.text((card_w//2, 1220), 'Mãi bên nhau & Yêu vk thật nhiều! ❤️', fill='#ffffff', font=font_note, anchor='mm')

    bg.save(output_path, 'PNG')
    print(f'Saved {output_path} for {target_url}')

if __name__ == '__main__':
    url = sys.argv[1] if len(sys.argv) > 1 else 'http://192.168.0.114:5500/index.html'
    create_rose_qr(url)
