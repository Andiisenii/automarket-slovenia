# -*- coding: utf-8 -*-
path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'rb') as f:
    data = f.read()

# Direct byte replacements for double-encoded UTF-8
# The corruption pattern: č -> \xc3\x84\xc2\x8d, š -> \xc3\x85\xc2\xa1

# Replace all occurrences of these double-encoded sequences
data = data.replace(b'\xc3\x84\xc2\x8d', b'\xc4\x8d')  # č
data = data.replace(b'\xc3\x84\xc2\x8c', b'\xc4\x87')  # ć
data = data.replace(b'\xc3\x85\xc2\xa1', b'\xc5\xa1')  # š
data = data.replace(b'\xc3\x85\xc2\xa0', b'\xc5\xa0')  # Š
data = data.replace(b'\xc3\x90', b'\xc4\x90')  # Đ
data = data.replace(b'\xc3\x84\xc2\x94', b'\xc4\x94')  # Ĕ

# Also fix single-byte Latin1 remnants that got encoded
data = data.replace(b'vilicar', b'vilicar')  # keep as-is for now

with open(path, 'wb') as f:
    f.write(data)

print('Fixed double-encoded bytes')

# Now let's check the result
with open(path, 'rb') as f:
    data = f.read()
i = data.find(b'Vrsta po')
print("After fix:", repr(data[i:i+60]))
