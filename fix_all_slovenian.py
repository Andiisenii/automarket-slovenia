# -*- coding: utf-8 -*-
path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'rb') as f:
    data = f.read()

# Fix double-encoded UTF-8 sequences
data = data.replace(b'\xc2\x84\xc2\x8d', b'\xc4\x8d')  # č
data = data.replace(b'\xc2\x84\xc2\x8c', b'\xc4\x87')  # ć
data = data.replace(b'\xc3\x84\xc2\x8d', b'\xc4\x8d')  # č
data = data.replace(b'\xc3\x84\xc2\x8c', b'\xc4\x87')  # ć
data = data.replace(b'\xc2\x85\xc2\xa1', b'\xc5\xa1')  # š
data = data.replace(b'\xc3\x85\xc2\xa1', b'\xc5\xa1')  # š
data = data.replace(b'\xc2\x85\xc2\xbe', b'\xc5\xbe')  # ž
data = data.replace(b'\xc3\x85\xc2\xbe', b'\xc5\xbe')  # ž
data = data.replace(b'\xc2\x84\xc2\x90', b'\xc4\x91')  # đ
data = data.replace(b'\xc3\x84\xc2\x90', b'\xc4\x91')  # đ
data = data.replace(b'\xc2\x85\xc2\xa0', b'\xc5\xa0')  # Š
data = data.replace(b'\xc3\x85\xc2\xa0', b'\xc5\xa0')  # Š

# Decode and fix remaining issues
text = data.decode('latin1')

# Remove control/garbled characters
import re
# Remove leftover UTF-8 overlong encodings
text = re.sub(r'[\xc2\xc3][\x80-\xbf]', '', text)
# Remove remaining control characters
text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)

# Fix specific known words
fixes = [
    ('vilicar', 'viličar'),
    ('Vilicar', 'Viličar'),
    ('pocitniska', 'počitniška'),
    ('hisica', 'hišica'),
    ('sotorska', 'šotorska'),
    ('sotorske', 'šotorske'),
    ('ElektriIni', 'Električni'),
    ('RoIani', 'Ročni'),
    ('Irna', 'Črna'),
    ('RdeI', 'Rdeča'),
    ('Orani', 'Oranžna'),
    ('BeI', 'Bež'),
    ('NEpoIkodovano', 'NEpoškodovano'),
    ('poIkodovano', 'poškodovano'),
    ('karamIbolirano', 'karambolirano'),
    ('5 let ali veI', '5 let ali več'),
]

for garbled, correct in fixes:
    text = text.replace(garbled, correct)

# Clean up any remaining I that followed by non-letter
text = re.sub(r'I([\s,\'\]\[]|$)', r'\1', text)
text = re.sub(r'^I', '', text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed encoding issues')
