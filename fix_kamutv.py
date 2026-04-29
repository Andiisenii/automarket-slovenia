# -*- coding: utf-8 -*-
path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix kamUTV references in kamionSubCategoryEquipmentMap
# Only replace 'KamUTV' as a key/value, not in variable names
content = content.replace("'KamUTV':", "'UTV Vozila':")

# Also fix references in AddCarPage.jsx that might use 'KamUTV'
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed KamUTV -> UTV Vozila')
