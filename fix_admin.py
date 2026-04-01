import re

with open('C:/Users/andii/OneDrive/Desktop/car-marketplace/src/pages/AdminPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the fetch URLs - add backticks around the URLs
content = content.replace("fetch(/automarket/admin.php?action=users)", "fetch(`/automarket/admin.php?action=users`)")
content = content.replace("fetch(/automarket/admin.php?action=cars&status=${status}&search=${search})", "fetch(`/automarket/admin.php?action=cars&status=${status}&search=${search}`)")
content = content.replace("fetch(/automarket/admin.php?action=purchases&status=${status})", "fetch(`/automarket/admin.php?action=purchases&status=${status}`)")
content = content.replace("fetch('/automarket/admin.php?action=messages')", "fetch(`/automarket/admin.php?action=messages`)")

with open('C:/Users/andii/OneDrive/Desktop/car-marketplace/src/pages/AdminPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed')