const fs = require('fs');
const path = 'C:/Users/andii/OneDrive/Desktop/car-marketplace/src/lib/data.js';

let content = fs.readFileSync(path, 'utf8');

// Fix corrupted Slovenian characters
// Vili[A-Z][A-Z][A-Z]arji -> Viličarji
content = content.replace(/Vili[A-Z]+arji/g, 'Viličarji');

// Po[A-Z][A-Z]itni[A-Z][A-Z][A-Z]ka -> Počitniška
content = content.replace(/Po[A-Z]+itni[A-Z]+ka prikolica/g, 'Počitniška prikolica');

// Mobilna hi[A-Z][A-Z]ica -> Mobilna hišica
content = content.replace(/Mobilna hi[A-Z]+ica/g, 'Mobilna hišica');

// [A-Z] otorska -> Šotorska
content = content.replace(/[A-Z] otorska prikolica/g, 'Šotorska prikolica');

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
