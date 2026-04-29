# -*- coding: utf-8 -*-
path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\pages\AddCarPage.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'KamUTV'", "'UTV Vozila'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed KamUTV -> UTV Vozila in AddCarPage.jsx')
