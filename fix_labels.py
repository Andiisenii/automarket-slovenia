# -*- coding: utf-8 -*-
path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'rb') as f:
    data = f.read()

# Fix double-encoded UTF-8 sequences
# These are: original UTF-8 bytes got re-encoded as UTF-8
# For example: č (UTF-8: \xc4\x8d) became \xc3\x84\xc2\x8d

replacements = [
    # č - \xc4\x8d
    (b'\xc3\x84\xc2\x8d', b'\xc4\x8d'),  # č
    # ć - \xc4\x87
    (b'\xc3\x84\xc2\x8c', b'\xc4\x87'),  # ć
    # š - \xc5\xa1
    (b'\xc3\x85\xc2\xa1', b'\xc5\xa1'),  # š
    # Š - \xc5\xa0
    (b'\xc3\x85\xc2\xa0', b'\xc5\xa0'),  # Š
    # ž - \xc5\xbe
    (b'\xc3\x85\xc2\xbe', b'\xc5\xbe'),  # ž
    # đ - \xc4\x91
    (b'\xc3\x84\xc2\x90', b'\xc4\x91'),  # đ
]

for old, new in replacements:
    if old in data:
        count = data.count(old)
        data = data.replace(old, new)
        print(f"Replaced {count}x: {old} -> {new}")

with open(path, 'wb') as f:
    f.write(data)

print("Done")
