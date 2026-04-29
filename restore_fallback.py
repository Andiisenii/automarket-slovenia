# -*- coding: utf-8 -*-
import re

path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace FALLBACKBRANDS array
match = re.search(r"export const FALLBACKBRANDS = \[.*?\];", content, re.DOTALL)
if match:
    print(f"Found FALLBACKBRANDS, length: {len(match.group())}")
    content = content.replace(match.group(), "export const FALLBACKBRANDS = [];")
else:
    print("FALLBACKBRANDS not found or already empty")

# Restore brands to empty
content = content.replace("export const brands = FALLBACKBRANDS", "export const brands = []")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done - FALLBACKBRANDS restored to empty")
