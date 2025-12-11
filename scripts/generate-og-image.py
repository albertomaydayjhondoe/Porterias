#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Crear imagen de 1200x630 (tamaño recomendado para Open Graph)
width = 1200
height = 630
img = Image.new('RGB', (width, height), color='#0f172a')
draw = ImageDraw.Draw(img)

# Borde superior con color primary
draw.rectangle([0, 0, width, 8], fill='#f59e0b')

# Intentar cargar fuentes del sistema, si no usar default
try:
    font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 100)
    font_subtitle = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 28)
    font_desc = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 24)
    font_url = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 20)
except:
    font_title = ImageFont.load_default()
    font_subtitle = ImageFont.load_default()
    font_desc = ImageFont.load_default()
    font_url = ImageFont.load_default()

# Título "PAPERBOY"
text = "PAPERBOY"
bbox = draw.textbbox((0, 0), text, font=font_title)
text_width = bbox[2] - bbox[0]
x = (width - text_width) / 2
draw.text((x, 150), text, fill='#ffffff', font=font_title)

# Subtítulo "LA PORTERÍA"
text = "LA PORTERÍA"
bbox = draw.textbbox((0, 0), text, font=font_subtitle)
text_width = bbox[2] - bbox[0]
x = (width - text_width) / 2
draw.text((x, 280), text, fill='#94a3b8', font=font_subtitle)

# Descripción línea 1
text = "Tiras cómicas diarias"
bbox = draw.textbbox((0, 0), text, font=font_desc)
text_width = bbox[2] - bbox[0]
x = (width - text_width) / 2
draw.text((x, 360), text, fill='#cbd5e1', font=font_desc)

# Descripción línea 2
text = "con estilo minimalista tipo periódico"
bbox = draw.textbbox((0, 0), text, font=font_desc)
text_width = bbox[2] - bbox[0]
x = (width - text_width) / 2
draw.text((x, 400), text, fill='#cbd5e1', font=font_desc)

# Línea decorativa
line_y = 460
draw.line([(width/2 - 200, line_y), (width/2 + 200, line_y)], fill='#f59e0b', width=3)

# URL
text = "albertomaydayjhondoe.github.io/Porterias"
bbox = draw.textbbox((0, 0), text, font=font_url)
text_width = bbox[2] - bbox[0]
x = (width - text_width) / 2
draw.text((x, 530), text, fill='#64748b', font=font_url)

# Guardar la imagen
output_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'og-image.png')
img.save(output_path, 'PNG')
print(f'✓ Imagen Open Graph generada: {output_path}')
