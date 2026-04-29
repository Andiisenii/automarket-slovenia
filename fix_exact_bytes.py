# -*- coding: utf-8 -*-
path = r'C:\Users\andii\OneDrive\Desktop\car-marketplace\src\lib\data.js'

with open(path, 'rb') as f:
    data = f.read()

# Fix specific double-encoded UTF-8 sequences
# poÃ„Â\xc2\x8ditniÃ…Â\xa1ka -> počitniška
data = data.replace(b'po\xc3\x84\xc2\x8ditni\xc3\x85\xc2\xa1ke', b'pocitniska')
data = data.replace(b'Po\xc3\x84\xc2\x8ditni\xc3\x85\xc2\xa1ka', b'Pocitniska')

# hiÃ…Â\xc2\xa1ica -> hišica (already looks correct based on earlier check)
# Let's check
i = data.find(b'hi')
print("hi bytes:", repr(data[i:i+20]))

# \xc3\x85\xc2\xa1 = š (double encoded)
data = data.replace(b'\xc3\x85\xc2\xa1', b'\\xc5\\xa1'.decode('unicode_escape').encode('latin1'))
# wait that's wrong

# Let's try a different approach - decode as latin1 then encode as utf8
data_latin1 = data.decode('latin1')
data_latin1 = data_latin1.replace('Ã§', 'ç')
data_latin1 = data_latin1.replace('Ã©', 'é')
data_latin1 = data_latin1.replace('Ã¨', 'è')
data_latin1 = data_latin1.replace('Ã ', 'à')
data_latin1 = data_latin1.replace('Ã¡', 'á')
data_latin1 = data_latin1.replace('Ã¢', 'â')
data_latin1 = data_latin1.replace('Ã£', 'ã')
data_latin1 = data_latin1.replace('Ã¶', 'ö')
data_latin1 = data_latin1.replace('Ã¼', 'ü')
data_latin1 = data_latin1.replace('Ã™', 'Ù')
data_latin1 = data_latin1.replace('Ã´', 'ô')
data_latin1 = data_latin1.replace('Ã±', 'ñ')
data_latin1 = data_latin1.replace('Ã', 'I')
data_latin1 = data_latin1.replace('Â', '')
data_latin1 = data_latin1.replace('Ãł', 'ł')

# Fix specific Slovenian characters that got double-encoded
# The pattern is: UTF-8 bytes interpreted as Latin1, then re-encoded as UTF-8
# For example: č (UTF-8: \xc4\x8d) -> \xc3\x84\xc2\x8d (when each byte gets UTF-8 encoded)

# Replace the double-encoded sequences
data_latin1 = data_latin1.replace('\xc3\x84\xc2\x8d', 'č')  # č
data_latin1 = data_latin1.replace('\xc3\x84\xc2\x8c', 'ć')  # ć
data_latin1 = data_latin1.replace('\xc3\x85\xc2\xa1', 'š')  # š
data_latin1 = data_latin1.replace('\xc3\x85\xc2\xa0', 'Š')  # Š
data_latin1 = data_latin1.replace('\xc4\x8d', 'd')  # leftover

# Fix vilicar -> viličar
data_latin1 = data_latin1.replace('vilicar', 'viličar')
data_latin1 = data_latin1.replace('Vilicar', 'Viličar')

with open(path, 'w', encoding='utf-8') as f:
    f.write(data_latin1)

print('Done')
