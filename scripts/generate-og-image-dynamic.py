#!/usr/bin/env python3
"""
Generate Open Graph image with the latest comic strip
"""
from PIL import Image, ImageDraw, ImageFont
import json
import os
from datetime import datetime

# Rutas
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
public_dir = os.path.join(project_dir, 'public')
strips_json_path = os.path.join(public_dir, 'data', 'strips.json')
output_path = os.path.join(public_dir, 'og-image.png')

# Cargar datos de strips
try:
    with open(strips_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        strips = data.get('strips', [])
except Exception as e:
    print(f"⚠ No se pudo cargar strips.json, usando imagen por defecto")
    strips = []

# Obtener la última tira (más reciente)
latest_strip = None
if strips:
    # Ordenar por fecha descendente
    sorted_strips = sorted(strips, key=lambda x: x.get('publish_date', ''), reverse=True)
    latest_strip = sorted_strips[0]

# Dimensiones Open Graph
width = 1200
height = 630

if latest_strip and latest_strip.get('image_url'):
    # Usar la imagen de la última tira
    strip_image_path = latest_strip['image_url']
    
    # Convertir URL a path local
    if strip_image_path.startswith('/Porterias/'):
        strip_image_path = strip_image_path.replace('/Porterias/', '')
    strip_image_path = os.path.join(public_dir, strip_image_path)
    
    try:
        # Cargar la imagen de la tira
        strip_img = Image.open(strip_image_path)
        
        # Crear imagen base con fondo oscuro
        img = Image.new('RGB', (width, height), color='#0f172a')
        
        # Calcular tamaño para centrar la tira (dejar espacio para título)
        header_height = 120
        footer_height = 80
        available_height = height - header_height - footer_height
        available_width = width - 80  # 40px padding a cada lado
        
        # Redimensionar la tira manteniendo aspecto
        strip_ratio = strip_img.width / strip_img.height
        if strip_ratio > (available_width / available_height):
            # Limitar por ancho
            new_width = available_width
            new_height = int(available_width / strip_ratio)
        else:
            # Limitar por alto
            new_height = available_height
            new_width = int(available_height * strip_ratio)
        
        strip_img = strip_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Centrar la imagen de la tira
        x_offset = (width - new_width) // 2
        y_offset = header_height + (available_height - new_height) // 2
        img.paste(strip_img, (x_offset, y_offset))
        
        # Añadir overlay semitransparente en header y footer
        overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.rectangle([0, 0, width, header_height], fill=(15, 23, 42, 230))
        overlay_draw.rectangle([0, height - footer_height, width, height], fill=(15, 23, 42, 230))
        img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
        
        draw = ImageDraw.Draw(img)
        
        # Borde superior
        draw.rectangle([0, 0, width, 6], fill='#f59e0b')
        
        # Fuentes
        try:
            font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 48)
            font_subtitle = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 22)
            font_date = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
        except:
            font_title = ImageFont.load_default()
            font_subtitle = ImageFont.load_default()
            font_date = ImageFont.load_default()
        
        # Título en header
        title_text = "PAPERBOY - LA PORTERÍA"
        bbox = draw.textbbox((0, 0), title_text, font=font_title)
        text_width = bbox[2] - bbox[0]
        draw.text(((width - text_width) / 2, 35), title_text, fill='#ffffff', font=font_title)
        
        # Información de la tira en footer
        strip_title = latest_strip.get('title', 'Última tira')
        bbox = draw.textbbox((0, 0), strip_title, font=font_subtitle)
        text_width = bbox[2] - bbox[0]
        draw.text(((width - text_width) / 2, height - footer_height + 15), strip_title, fill='#ffffff', font=font_subtitle)
        
        # Fecha
        try:
            pub_date = datetime.strptime(latest_strip.get('publish_date', ''), '%Y-%m-%d')
            date_text = pub_date.strftime('%d de %B, %Y')
            # Traducir mes a español
            meses = {
                'January': 'enero', 'February': 'febrero', 'March': 'marzo',
                'April': 'abril', 'May': 'mayo', 'June': 'junio',
                'July': 'julio', 'August': 'agosto', 'September': 'septiembre',
                'October': 'octubre', 'November': 'noviembre', 'December': 'diciembre'
            }
            for en, es in meses.items():
                date_text = date_text.replace(en, es)
        except:
            date_text = latest_strip.get('publish_date', '')
        
        bbox = draw.textbbox((0, 0), date_text, font=font_date)
        text_width = bbox[2] - bbox[0]
        draw.text(((width - text_width) / 2, height - footer_height + 50), date_text, fill='#94a3b8', font=font_date)
        
        print(f'✓ Imagen Open Graph generada con la tira: {strip_title}')
        
    except Exception as e:
        print(f"⚠ Error al cargar imagen de tira: {e}")
        print("  Generando imagen por defecto...")
        # Fallback a imagen por defecto
        latest_strip = None

# Si no hay tira o falla, crear imagen por defecto
if not latest_strip or not latest_strip.get('image_url'):
    img = Image.new('RGB', (width, height), color='#0f172a')
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([0, 0, width, 8], fill='#f59e0b')
    
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
    
    text = "PAPERBOY"
    bbox = draw.textbbox((0, 0), text, font=font_title)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) / 2, 150), text, fill='#ffffff', font=font_title)
    
    text = "LA PORTERÍA"
    bbox = draw.textbbox((0, 0), text, font=font_subtitle)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) / 2, 280), text, fill='#94a3b8', font=font_subtitle)
    
    text = "Tiras cómicas diarias"
    bbox = draw.textbbox((0, 0), text, font=font_desc)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) / 2, 360), text, fill='#cbd5e1', font=font_desc)
    
    text = "con estilo minimalista tipo periódico"
    bbox = draw.textbbox((0, 0), text, font=font_desc)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) / 2, 400), text, fill='#cbd5e1', font=font_desc)
    
    draw.line([(width/2 - 200, 460), (width/2 + 200, 460)], fill='#f59e0b', width=3)
    
    text = "albertomaydayjhondoe.github.io/Porterias"
    bbox = draw.textbbox((0, 0), text, font=font_url)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) / 2, 530), text, fill='#64748b', font=font_url)
    
    print('✓ Imagen Open Graph por defecto generada')

# Guardar
img.save(output_path, 'PNG', optimize=True)
print(f'✓ Guardada en: {output_path}')
