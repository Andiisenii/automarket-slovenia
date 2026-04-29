# -*- coding: utf-8 -*-
import re

path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix garbled Slovenian characters throughout the file
# These are common corruption patterns:

# po??itni??ka -> počitniška
content = re.sub(r"po[A-Z?\[]+\[A-Z?\[]+ka", "počitniška", content)
content = re.sub(r"Po[A-Z?\[]+\[A-Z?\[]+ka", "Počitniška", content)

# hi??ica -> hišica
content = re.sub(r"hi[A-Z?\[]+\[A-Z?\[]+ica", "hišica", content)

# ?otorska / ?otorske -> šotorska / šotorske
content = re.sub(r"[A-Z?]+\s*otorska", "šotorska", content)
content = re.sub(r"[A-Z?]+\s*otorske", "šotorske", content)

# vilicar -> viličar
content = re.sub(r"vilicar", "viličar", content)
content = re.sub(r"Vilicar", "Viličar", content)

# kmetijske -> kmetijske (correct already but check for corruption)
content = re.sub(r"kmetij[A-Z?\[]+\[A-Z?\[]+ke", "kmetijske", content)

# 5 let ali ve? -> 5 let ali več
content = content.replace("5 let ali ve\u0080?", "5 let ali več")
content = content.replace("5 let ali več", "5 let ali več")

# NEpo??kodovano -> NEpoškodovano
content = re.sub(r"NEpo[A-Z?\[]+\[A-Z?\[]+dovano", "NEpoškodovano", content)
content = re.sub(r"po[A-Z?\[]+\[A-Z?\[]+dovano", "poškodovano", content)

# karambolirano -> karambolirano (check if garbled)
content = re.sub(r"karambolirano", "karambolirano", content)

# vozilo je bilo poplavijeno -> poplavljeno
content = content.replace("poplavijeno", "poplavljeno")

# dirkalno -> dirkalno (correct)
# Ni karambolirano -> NI karambolirano
content = content.replace("Ni karambolirano", "NI karambolirano")

# Also fix any remaining UTF-8 corruption patterns
# Common multi-byte corruption of č, ć, š, ž, đ
content = re.sub(r"Ã\u008d", "Č", content)
content = re.sub(r"Ã¨", "è", content)
content = re.sub(r"Ã¡", "á", content)
content = re.sub(r"Ã¢", "â", content)
content = re.sub(r"Ã£", "ã", content)
content = re.sub(r"Ã¶", "ö", content)
content = re.sub(r"Ã¼", "ü", content)
content = re.sub(r"Ã©", "é", content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed all encoding issues in data.js')
