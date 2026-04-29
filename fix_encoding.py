# -*- coding: utf-8 -*-
import re

path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix traktor - Viličarji
content = re.sub(r"'Vili[A-Z\u0080-\u00FF]+arji'", "'Viličarji'", content)
content = re.sub(r"'Vrsta vili[A-Z\u0080-\u00FF]+arja'", "'Vrsta viličarja'", content)

# Fix avtodom - Počitniška prikolica
content = re.sub(r"'Po[A-Z\u0080-\u00FF]+[A-Za-z\u0080-\u00FF]+ka prikolica'", "'Počitniška prikolica'", content)

# Fix avtodom - Mobilna hišica  
content = re.sub(r"'Mobilna hi[A-Z\u0080-\u00FF]+ica'", "'Mobilna hišica'", content)

# Fix avtodom - Šotorska prikolica
content = re.sub(r"'[A-Z\u0080-\u00FF]\s*otorska prikolica'", "'Šotorska prikolica'", content)

# Also fix in comments
content = re.sub(r'// Traktor - Vili[A-Z\u0080-\u00FF]+', '// Traktor - Viličarji', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
