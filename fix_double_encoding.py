# -*- coding: utf-8 -*-
import re

path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix double-encoded UTF-8 (MozJPEG-style corruption)
# These appear as: č → Ã„Æ’ or similar patterns

# Replace garbled patterns with correct Slovenian characters
replacements = {
    "poÃ„Â\xc2\x8ditniÃ…Â\xa1ka": "počitniška",
    "PoÃ„Â\xc2\x8ditniÃ…Â\xa1ka": "Počitniška", 
    "hiÃ…Â\xa1ica": "hišica",
    "Ã…Â\xa0otorska": "šotorska",
    "Ã…Â\xa0otorske": "šotorske",
    "ViliÃ„Â\xc2\x8dar": "Viličar",
    "vilicar": "viličar",
    "kmetijÃ„Â\xc2\x8dske": "kmetijske",
    "Ã„Â\xc2\x8d": "Č",
    "Ã…Â\xa1": "š",
    "Ã…Â\xa0": "Š",
    "Ã\u0084Ã\u0082Ãempo": "č",
}

# First, fix the specific double-encoded sequences
# č in double encoding: Ã„Â\xc2\x8d or Ã„Æ’
content = content.replace('\xc3\x84\xc2\x8d', 'č')
content = content.replace('\xc3\x84\xc2\x8c', 'ć')
content = content.replace('\xc3\x85\xc2\xa1', 'š')
content = content.replace('\xc3\x85\xc2\xa0', 'Š')
content = content.replace('\xc3\x84Ã', 'Ä')  # clean up
content = content.replace('\xc3\x85Â', 'Å')  # clean up

# Fix specific garbled patterns by searching bytes
byte_content = open(path, 'rb').read()

# Find and fix patterns like "poÃ...Ã...itniÃ...Ã...ka"
# Replace with "počitniška"
patterns_to_fix = [
    (b'po\xc3\x84\xc2\x8ditni\xc3\x85\xc2\xa1ka', b'pocitniska'),
    (b'Po\xc3\x84\xc2\x8ditni\xc3\x85\xc2\xa1ka', b'Pocitniska'),
    (b'hi\xc3\x85\xc2\xa1ica', b'hisica'),
    (b'\xc3\x85\xc2\xa0otorska', b'sotorska'),
    (b'\xc3\x85\xc2\xa0otorske', b'sotorske'),
    (b'Vili\xc3\x84\xc2\x8dar', b'Vilicar'),
    (b'vilicar', b'vilicar'),
]

for old, new in patterns_to_fix:
    if old in byte_content:
        byte_content = byte_content.replace(old, new)
        print(f"Fixed: {old}")

# Write back
with open(path, 'wb') as f:
    f.write(byte_content)

# Also fix any remaining single-byte Latin1 characters that should be UTF-8
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix common garbled sequences
content = content.replace('Ã§', 'ç')
content = content.replace('Ã©', 'é')
content = content.replace('Ã¨', 'è')
content = content.replace('Ã ', 'à')
content = content.replace('Ã¡', 'á')
content = content.replace('Ã¢', 'â')
content = content.replace('Ã£', 'ã')
content = content.replace('Ã¶', 'ö')
content = content.replace('Ã¼', 'ü')
content = content.replace('Ã™', 'Ù')
content = content.replace('Ã´', 'ô')
content = content.replace('Ã±', 'ñ')
content = content.replace('Ã', 'I')
content = content.replace('Â', '')
content = content.replace('Ãł', 'ł')

# Fix remaining specific patterns
content = re.sub(r'vilicar', 'viličar', content)
content = re.sub(r'Vilicar', 'Viličar', content)
content = re.sub(r'po[A-Za-z]*ni[A-Za-z]*ka', 'počitniška', content)
content = re.sub(r'Po[A-Za-z]*ni[A-Za-z]*ka', 'Počitniška', content)
content = re.sub(r'hi[A-Za-z]*ica', 'hišica', content)
content = re.sub(r'[A-Z]\s*otorska', 'šotorska', content)
content = re.sub(r'[A-Z]\s*otorske', 'šotorske', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done fixing encoding')
