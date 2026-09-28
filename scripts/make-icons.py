"""Genera los iconos de la app (volante blanco sobre fondo negro). Uso: python3 scripts/make-icons.py"""
from PIL import Image, ImageDraw


def icon(size: int, path: str) -> None:
    img = Image.new("RGB", (size, size), (11, 11, 15))
    d = ImageDraw.Draw(img)
    s = size / 512
    # Faldón en abanico y base de corcho del volante.
    d.polygon([(206 * s, 352 * s), (306 * s, 352 * s), (392 * s, 92 * s), (120 * s, 92 * s)], fill=(233, 237, 247))
    for x in (150, 214, 298, 362):
        d.line([(256 * s, 352 * s), (x * s, 96 * s)], fill=(47, 107, 255), width=max(2, int(8 * s)))
    d.line([(132 * s, 170 * s), (380 * s, 170 * s)], fill=(47, 107, 255), width=max(2, int(6 * s)))
    d.ellipse([196 * s, 330 * s, 316 * s, 450 * s], fill=(255, 255, 255))
    img.save(path)


icon(192, "public/icon-192.png")
icon(512, "public/icon-512.png")
icon(180, "public/apple-touch-icon.png")
