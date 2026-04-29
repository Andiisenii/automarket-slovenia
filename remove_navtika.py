# -*- coding: utf-8 -*-
path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove Navtika from avtodom options (keep the trailing comma before E-kolo)
content = content.replace("'Navtika',\n      ", "")
content = content.replace("'Navtika',", "")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done - Navtika removed')
