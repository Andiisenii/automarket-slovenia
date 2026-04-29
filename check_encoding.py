# -*- coding: utf-8 -*-
with open(r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js', 'rb') as f:
    data = f.read()

# Find avtodom section
idx = data.find(b"'avtodom':")
if idx >= 0:
    print("avtodom section:")
    print(data[idx:idx+400])
