// Data helpers - fetches from MySQL API
import { API_URL } from './api'

// Cache for API data
let brandsCache = null
let citiesCache = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// ============ FALLBACK DATA (when API fails) ============
export const FALLBACK_BRANDS = [
  'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Bentley', 'Bugatti', 'Buick', 'Cadillac',
  'Chevrolet', 'Chrysler', 'Citroën', 'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'Ferrari',
  'Fiat', 'Ford', 'Geely', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Isuzu', 'Iveco',
  'Jaguar', 'Jeep', 'Kia', 'Koenigsegg', 'Lamborghini', 'Lancia', 'Land Rover',
  'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Maybach', 'Mazda', 'McLaren',
  'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche',
  'Ram', 'Renault', 'Rolls-Royce', 'Saab', 'Seat', 'Skoda', 'Smart', 'SsangYong',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
  // Buses
  'MAN', 'Mercedes-Benz Bus', 'Setra', 'Van Hool', 'Iveco Bus', 'Solaris',
  // Trucks
  'DAF', 'Scania', 'Volvo Trucks', 'Renault Trucks',
  // Vans
  'Mercedes-Benz Sprinter', 'Volkswagen Transporter', 'Ford Transit', 'Renault Master',
  'Iveco Daily', 'Fiat Ducato', 'Peugeot Boxer', 'Citroen Jumper'
]

export const FALLBACK_MODELS = {
  'Audi': [
    // A1
    'A1 1.0 TFSI', 'A1 1.4 TFSI', 'A1 1.8 TFSI', 'A1 2.0 TFSI', 'S1 2.0 TFSI',
    // A3
    'A3 1.0 TFSI', 'A3 1.4 TFSI', 'A3 1.5 TFSI', 'A3 1.6 TDI', 'A3 2.0 TDI', 'A3 2.0 TFSI', 'A3 Sportback e-tron', 'S3 2.0 TFSI', 'S3 Sportback', 'RS3 2.5 TFSI',
    // A4
    'A4 1.4 TFSI', 'A4 1.8 TFSI', 'A4 2.0 TFSI', 'A4 2.0 TDI', 'A4 3.0 TDI', 'A4 allroad 2.0 TFSI', 'A4 allroad 3.0 TDI', 'S4 3.0 TFSI', 'RS4 2.9 TFSI',
    // A5
    'A5 1.4 TFSI', 'A5 2.0 TFSI', 'A5 2.0 TDI', 'A5 3.0 TDI', 'A5 Sportback 1.4 TFSI', 'A5 Sportback 2.0 TFSI', 'A5 Sportback 2.0 TDI', 'S5 3.0 TFSI', 'RS5 2.9 TFSI', 'RS5 Sportback',
    // A6
    'A6 1.8 TFSI', 'A6 2.0 TFSI', 'A6 2.0 TDI', 'A6 3.0 TFSI', 'A6 3.0 TDI', 'A6 4.0 TFSI', 'A6 allroad 3.0 TFSI', 'A6 allroad 3.0 TDI', 'A6 L 2.0 TFSI', 'S6 2.9 TFSI', 'RS6 4.0 TFSI',
    // A7
    'A7 2.0 TFSI', 'A7 3.0 TFSI', 'A7 3.0 TDI', 'A7 Sportback 2.0 TFSI', 'A7 Sportback 3.0 TFSI', 'S7 2.9 TFSI', 'RS7 4.0 TFSI',
    // A8
    'A8 2.0 TFSI', 'A8 3.0 TFSI', 'A8 3.0 TDI', 'A8 4.0 TFSI', 'A8 4.2 TDI', 'A8 L 3.0 TFSI', 'A8 L 4.0 TFSI', 'S8 4.0 TFSI', 'S8 plus',
    // Q2
    'Q2 1.0 TFSI', 'Q2 1.4 TFSI', 'Q2 1.6 TDI', 'Q2 2.0 TFSI', 'SQ2 2.0 TFSI',
    // Q3
    'Q3 1.4 TFSI', 'Q3 1.5 TFSI', 'Q3 2.0 TFSI', 'Q3 2.0 TDI', 'Q3 RS 2.5 TFSI',
    // Q5
    'Q5 2.0 TFSI', 'Q5 2.0 TDI', 'Q5 3.0 TDI', 'Q5 2.0 TFSI e', 'Q5 2.0 TDI e', 'Q5 Sportback 2.0 TFSI', 'SQ5 3.0 TDI',
    // Q7
    'Q7 2.0 TFSI', 'Q7 3.0 TFSI', 'Q7 3.0 TDI', 'Q7 4.0 TDI', 'Q7 e-tron 3.0 TDI',
    // Q8
    'Q8 3.0 TFSI', 'Q8 3.0 TDI', 'Q8 4.0 TDI', 'Q8 e-tron', 'SQ8 4.0 TFSI', 'RSQ8 4.0 TFSI',
    // e-tron
    'e-tron 50', 'e-tron 55', 'e-tron 55 quattro', 'e-tron Sportback 50', 'e-tron Sportback 55', 'e-tron GT', 'e-tron GT quattro', 'RS e-tron GT',
    // TT
    'TT 1.8 TFSI', 'TT 2.0 TFSI', 'TT 2.0 TDI', 'TTS 2.0 TFSI', 'TT RS 2.5 TFSI',
    // R8
    'R8 4.2 FSI', 'R8 5.2 FSI', 'R8 Spyder 4.2 FSI', 'R8 Spyder 5.2 FSI', 'R8 LMS', 'R8 GT',
  ],
  'BMW': [
    // Serija 1
    '118i', '120i', '125i', 'M135i', '118d', '120d', '125d', 'M135d',
    // Serija 2
    '218i', '220i', '230i', 'M235i', '240i', '218d', '220d', '225d', 'M235d', 'M2 Competition', 'M2 CS',
    // Serija 3
    '318i', '320i', '330i', '340i', 'M340i', '318d', '320d', '325d', '330d', '340d', 'M340d', 'M3 Competition', 'M3 CS',
    // Serija 4
    '418i', '420i', '430i', '440i', 'M440i', '418d', '420d', '425d', '430d', '440d', 'M440d', 'M4 Competition', 'M4 CS', 'M4 GTS',
    // Serija 5
    '518i', '520i', '530i', '540i', 'M550i', '518d', '520d', '525d', '530d', '535d', '540d', 'M550d', 'M5 Competition',
    // Serija 6
    '620d', '630i', '640i', '650i', 'M650i', '635d', '640d', 'M6 Gran Coupe',
    // Serija 7
    '730i', '735i', '740i', '745i', '750i', '760i', 'M760i', '730d', '735d', '740d', '745d', '750d', 'M750d', '745Le', '745Le xDrive',
    // Serija 8
    '830i', '840i', '850i', 'M850i', 'M8 Competition', '830d', '840d', 'M850d',
    // X1
    'X1 sDrive18i', 'X1 sDrive20i', 'X1 xDrive20i', 'X1 sDrive18d', 'X1 sDrive20d', 'X1 xDrive20d', 'X1 xDrive25d', 'X1 M35i',
    // X2
    'X2 sDrive18i', 'X2 sDrive20i', 'X2 xDrive20i', 'X2 xDrive25i', 'X2 sDrive18d', 'X2 sDrive20d', 'X2 xDrive20d', 'X2 M35i',
    // X3
    'X3 xDrive20i', 'X3 xDrive30i', 'X3 xDrive40i', 'X3 M40i', 'X3 sDrive18d', 'X3 sDrive20d', 'X3 xDrive20d', 'X3 xDrive25d', 'X3 xDrive30d', 'X3 xDrive40d', 'X3 M',
    // X4
    'X4 xDrive20i', 'X4 xDrive30i', 'X4 xDrive40i', 'X4 M40i', 'X4 xDrive20d', 'X4 xDrive25d', 'X4 xDrive30d', 'X4 xDrive40d', 'X4 M',
    // X5
    'X5 xDrive30d', 'X5 xDrive40d', 'X5 xDrive50i', 'X5 M50d', 'X5 M', 'X5 xDrive45e',
    // X6
    'X6 xDrive30d', 'X6 xDrive40d', 'X6 xDrive50i', 'X6 M50d', 'X6 M', 'X6 xDrive40e',
    // X7
    'X7 xDrive30d', 'X7 xDrive40d', 'X7 xDrive50i', 'X7 M50d', 'X7 M',
    // Z4
    'Z4 sDrive20i', 'Z4 sDrive30i', 'Z4 M40i', 'Z4 M40i First Edition', 'Z4 M',
    // i3
    'i3s', 'i3 Range Extender',
    // i4
    'i4 eDrive35', 'i4 eDrive40', 'i4 xDrive40', 'i4 M50',
    // i7
    'i7 xDrive60', 'i7 M70', 'i7 eDrive50',
    // iX
    'iX xDrive40', 'iX xDrive50', 'iX xDrive60', 'iX xDrive70', 'iX M60',
    // iX3
    'iX3 xDrive30',
  ],
  'Mercedes-Benz': [
    'A 180', 'A 200', 'A 250 AMG', 'A 350', 'A 45 AMG',
    'B 180', 'B 200', 'B 250 AMG',
    'C 180', 'C 200', 'C 220d', 'C 300 AMG', 'C 350', 'C 63 AMG',
    'E 200', 'E 220d', 'E 300', 'E 350 AMG', 'E 400', 'E 450', 'E 53 AMG', 'E 63 AMG',
    'S 350', 'S 400', 'S 450', 'S 500 AMG', 'S 580', 'S 680 Maybach', 'S 63 AMG',
    'CLA 180', 'CLA 200', 'CLA 250 AMG', 'CLA 45 AMG',
    'CLS 300', 'CLS 350', 'CLS 450 AMG', 'CLS 53 AMG',
    'GLA 180', 'GLA 200', 'GLA 250 AMG', 'GLA 45 AMG',
    'GLB 180', 'GLB 200', 'GLB 250 AMG', 'GLB 35 AMG',
    'GLC 220d', 'GLC 300', 'GLC 350de', 'GLC 400', 'GLC 450 AMG',
    'GLE 300d', 'GLE 350de', 'GLE 400', 'GLE 450 AMG', 'GLE 53 AMG', 'GLE 63 AMG',
    'GLS 400d', 'GLS 450', 'GLS 580', 'GLS 600 Maybach', 'GLS 63 AMG',
    'G-Class G 350d', 'G-Class G 400', 'G-Class G 500', 'G 55 AMG', 'G 63 AMG',
    'AMG GT 63', 'AMG GT 63 S', 'AMG GT 53',
    'SL 350', 'SL 400', 'SL 450 AMG', 'SL 55 AMG', 'SL 63 AMG',
    'SLC 180', 'SLC 200', 'SLC 300', 'SLC 43 AMG',
    'EQS 350', 'EQS 450', 'EQS 580', 'EQS 600 Maybach',
    'EQC 400',
    'EQA 250', 'EQA 300', 'EQA 350',
    'EQB 250', 'EQB 300', 'EQB 350',
    'EQE 350', 'EQE 400', 'EQE 500',
    'V-Class 200', 'V-Class 220d', 'V-Class 300', 'V-Class 350',
    'Sprinter 314 CDI', 'Sprinter 316 CDI', 'Sprinter 319 CDI', 'Sprinter 516 CDI', 'Sprinter 519 CDI', 'eSprinter'
  ],
  'Volkswagen': [
    // Polo series
    'Polo 1.0', 'Polo 1.2 TSI', 'Polo 1.4 TDI', 'Polo 1.5 TSI', 'Polo 1.6 TDI', 'Polo GTI', 'Polo R-Line',
    // Golf series
    'Golf 1.0', 'Golf 1.4 TSI', 'Golf 1.5 TSI', 'Golf 1.6 TDI', 'Golf 2.0 TDI', 'Golf 2.0 TSI', 'Golf GTI', 'Golf GTE', 'Golf R', 'Golf eHybrid', 'Golf Variant 1.4 TSI', 'Golf Variant 1.6 TDI', 'Golf Variant 2.0 TDI', 'Golf Alltrack',
    // Passat series
    'Passat 1.4 TSI', 'Passat 1.5 TSI', 'Passat 1.8 TSI', 'Passat 2.0 TSI', 'Passat 2.0 TDI', 'Passat 2.5 V6', 'Passat GTE', 'Passat Variant 1.4 TSI', 'Passat Variant 2.0 TDI', 'Passat Alltrack',
    // Arteon
    'Arteon 1.5 TSI', 'Arteon 2.0 TSI', 'Arteon 2.0 TDI', 'Arteon R-Line',
    // T-Roc
    'T-Roc 1.0 TSI', 'T-Roc 1.5 TSI', 'T-Roc 2.0 TSI', 'T-Roc Cabriolet', 'T-Roc R',
    // T-Cross
    'T-Cross 1.0 TSI', 'T-Cross 1.5 TSI', 'T-Cross 1.6 TDI',
    // Tiguan
    'Tiguan 1.4 TSI', 'Tiguan 1.5 TSI', 'Tiguan 2.0 TSI', 'Tiguan 2.0 TDI', 'Tiguan Allspace', 'Tiguan R',
    // Touareg
    'Touareg 3.0 V6 TDI', 'Touareg 3.0 V6 TSI', 'Touareg 4.0 V8 TDI', 'Touareg R',
    // Teramont
    'Teramont 2.0 TSI', 'Teramont 3.6 V6',
    // Up!
    'Up! 1.0', 'Up! Move', 'e-Up!',
    // Fox
    'Fox 1.4',
    // Lupo
    'Lupo 1.0', 'Lupo GTI',
    // ID.3
    'ID.3 Pure', 'ID.3 Business', 'ID.3 Style', 'ID.3 Pro', 'ID.3 Pro S', 'ID.3 Max', 'ID.3 GTX',
    // ID.4
    'ID.4 Pure', 'ID.4 Business', 'ID.4 Style', 'ID.4 Pro', 'ID.4 Pro S', 'ID.4 GTX',
    // ID.5
    'ID.5 Pure', 'ID.5 Pro', 'ID.5 Pro S', 'ID.5 GTX',
    // ID.Buzz
    'ID.Buzz Pure', 'ID.Buzz Life', 'ID.Buzz Cargo', 'ID.Buzz GTX',
    // Transporter
    'Transporter T1', 'Transporter T2', 'Transporter T3', 'Transporter T4', 'Transporter T5', 'Transporter T6', 'Transporter T6.1', 'Transporter T7',
    // Multivan
    'Multivan 1.4 TSI', 'Multivan 2.0 TDI', 'Multivan 2.0 TSI', 'Multivan eHybrid',
    // Caravelle
    'Caravelle 2.0 TDI', 'Caravelle 2.0 TSI', 'Caravelle eHybrid',
    // California
    'California 2.0 TDI', 'California 2.0 TSI', 'California Beach', 'California Ocean', 'California Touring',
  ],
  'Opel': [
    // Corsa
    'Corsa 1.2', 'Corsa 1.4', 'Corsa 1.0 Turbo', 'Corsa 1.4 Turbo', 'Corsa 1.6 Turbo', 'Corsa 1.5 CDI', 'Corsa 1.3 CDTI', 'Corsa-e', 'Corsa GSi', 'Corsa RS',
    // Astra
    'Astra 1.2', 'Astra 1.4', 'Astra 1.0 Turbo', 'Astra 1.4 Turbo', 'Astra 1.6 Turbo', 'Astra 1.5 CDTI', 'Astra 1.6 CDTI', 'Astra 2.0 CDTI', 'Astra Sports Tourer', 'Astra GSe', 'Astra RS',
    // Insignia
    'Insignia 1.4 Turbo', 'Insignia 1.5 Turbo', 'Insignia 1.6 Turbo', 'Insignia 1.6 CDTI', 'Insignia 2.0 CDTI', 'Insignia 2.0 Turbo', 'Insignia Grand Sport', 'Insignia Sports Tourer', 'Insignia Country Tourer', 'Insignia GSi',
    // Grandland
    'Grandland 1.2 Turbo', 'Grandland 1.5 Turbo', 'Grandland 1.6 Hybrid', 'Grandland 2.0 CDTI', 'Grandland X Hybrid',
    // Crossland
    'Crossland 1.2', 'Crossland 1.4', 'Crossland 1.2 Turbo', 'Crossland 1.5 CDTI',
    // Mokka
    'Mokka 1.2', 'Mokka 1.4', 'Mokka 1.0 Turbo', 'Mokka 1.4 Turbo', 'Mokka 1.6 CDTI', 'Mokka-e', 'Mokka X 1.4 Turbo', 'Mokka X 1.6 CDTI',
    // Combo
    'Combo 1.4', 'Combo 1.6 CDTI', 'Combo Life 1.2', 'Combo Life 1.5 CDTI', 'Combo Cargo',
    // Movano
    'Movano 2.2 CDTI', 'Movano 2.3 CDTI', 'Movano 3.0 CDTI',
    // Zafira
    'Zafira 1.4 Turbo', 'Zafira 1.6 CDTI', 'Zafira 2.0 CDTI', 'Zafira Life', 'Zafira Tourer',
    // Vivaro
    'Vivaro 1.6 CDTI', 'Vivaro 2.0 CDTI', 'Vivaro-e', 'Vivaro Life', 'Vivaro Cargo',
    // Zafira Life
    'Zafira Life 1.5 CDTI', 'Zafira Life 2.0 CDTI', 'Zafira Life 1.5 BlueHDi',
  ],
  'Renault': ['Twingo', 'Clio', 'Megane', 'Talisman', 'Laguna', 'Captur', 'Kadjar', 'Koleos', 'Arkana', 'ZOE', 'Megane E-Tech', 'Austral', 'Espace', 'Master', 'Trafic', 'Kangoo'],
  'Peugeot': ['108', '208', '308', '408', '508', '2008', '3008', '5008', 'e-208', 'e-2008', 'e-308', 'Rifter', 'Partner', 'Expert', 'Boxer', '508 PSE', '508 SW'],
  'Ford': [
    // Fiesta
    'Fiesta 1.0 EcoBoost', 'Fiesta 1.1', 'Fiesta 1.5 TDCi', 'Fiesta ST 1.6 EcoBoost', 'Fiesta ST-Line', 'Fiesta Titanium', 'Fiesta Vignale',
    // Focus
    'Focus 1.0 EcoBoost', 'Focus 1.5 EcoBoost', 'Focus 1.5 EcoBlue', 'Focus 2.0 EcoBlue', 'Focus 2.3 EcoBoost ST', 'Focus RS', 'Focus Active', 'Focus ST-Line', 'Focus Titanium', 'Focus Vignale', 'Focus Estate 1.0 EcoBoost', 'Focus Estate 1.5 EcoBlue',
    // Mondeo
    'Mondeo 1.0 EcoBoost', 'Mondeo 1.5 EcoBoost', 'Mondeo 1.5 EcoBlue', 'Mondeo 2.0 EcoBlue', 'Mondeo 2.0 HEV', 'Mondeo 2.0 EcoBoost ST-Line', 'Mondeo Vignale',
    // Mustang
    'Mustang 2.3 EcoBoost', 'Mustang 5.0 V8', 'Mustang Mach-E', 'Mustang Mach-E GT', 'Mustang Bullitt', 'Mustang Dark Horse', 'Mustang GT Fastback', 'Mustang Convertible',
    // Puma
    'Puma 1.0 EcoBoost', 'Puma 1.5 EcoBlue', 'Puma ST 1.5 EcoBoost', 'Puma Titanium', 'Puma ST-Line',
    // Kuga
    'Kuga 1.5 EcoBoost', 'Kuga 2.0 EcoBoost', 'Kuga 1.5 EcoBlue', 'Kuga 2.0 EcoBlue', 'Kuga 2.5 HEV', 'Kuga PHEV', 'Kuga ST-Line',
    // Explorer
    'Explorer 2.3 EcoBoost', 'Explorer 3.0 V6 EcoBoost', 'Explorer 3.0 V6 Hybrid', 'Explorer ST 3.0 V6 EcoBoost', 'Explorer Platinum',
    // Edge
    'Edge 2.0 EcoBoost', 'Edge 2.0 EcoBlue', 'Edge 2.0 TDCi', 'Edge ST 2.7 V6 EcoBoost',
    // Bronco
    'Bronco 2.3 EcoBoost', 'Bronco 2.7 V6 EcoBoost', 'Bronco Sport 1.5 EcoBoost', 'Bronco Sport 2.0 EcoBoost', 'Bronco Raptor',
    // Transit
    'Transit 2.0 EcoBlue', 'Transit 2.2 TDCi', 'Transit 2.4 TDCi', 'Transit 3.2 TDCi', 'Transit Custom 2.0 EcoBlue', 'Transit Connect 1.5 TDCi', 'Transit Courier 1.5 TDCi', 'Transit Trail', 'Transit ST-Line',
    // Tourneo
    'Tourneo Custom 2.0 EcoBlue', 'Tourneo Connect 1.5 EcoBlue', 'Tourneo Courier 1.5 TDCi', 'Tourneo Grand Custom',
    // S-Max
    'S-Max 1.5 EcoBoost', 'S-Max 2.0 EcoBoost', 'S-Max 2.0 EcoBlue', 'S-Max 2.5 HEV', 'S-Max ST-Line',
    // Galaxy
    'Galaxy 1.5 EcoBoost', 'Galaxy 2.0 EcoBoost', 'Galaxy 2.0 EcoBlue', 'Galaxy 2.5 HEV', 'Galaxy ST-Line',
    // Ranger
    'Ranger 2.0 EcoBlue', 'Ranger 2.2 TDCi', 'Ranger 3.2 TDCi', 'Ranger 3.0 V6 Power Stroke', 'Ranger Raptor 2.0 EcoBoost', 'Ranger Raptor 3.0 V6 EcoBoost', 'Ranger Tremor', 'Ranger Wildtrak',
    // F-150
    'F-150 XL', 'F-150 XLT', 'F-150 Lariat', 'F-150 Platinum', 'F-150 King Ranch', 'F-150 Raptor', 'F-150 Lightning',
    // Maverick
    'Maverick 2.0 EcoBoost', 'Maverick 2.5 Hybrid',
  ],
  'Toyota': ['Aygo', 'Yaris', 'Corolla', 'Camry', 'Prius', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Sequoia', 'Hilux', 'Tacoma', 'Tundra', 'Proace', 'Proace City', 'Sienna', 'GR Supra', 'GR86', 'GR Yaris', 'Mirai', 'bZ4X', 'Urban Cruiser'],
  'Hyundai': ['i10', 'i20', 'i30', 'i40', 'IONIQ', 'Kona', 'Tucson', 'Santa Fe', 'Palisade', 'Bayon', 'Nexo', 'Staria', 'IONIQ 5', 'IONIQ 6', 'Kona Electric'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'K5', 'Stinger', 'XCeed', 'Niro', 'Sportage', 'Sorento', 'Telluride', 'Soul', 'EV6', 'EV9', 'e-Soul', 'Niro EV', 'Carens', 'Carnival'],
  'Skoda': ['Citigo', 'Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Rapid', 'Yeti'],
  'Seat': ['Mii', 'Ibiza', 'Leon', 'Ateca', 'Tarraco', 'Ateca FR', 'Cupra Formentor', 'Cupra Leon', 'Born'],
  'Fiat': ['500', '500L', '500X', '500e', 'Panda', 'Tipo', 'Punto', 'Doblo', 'Ducato', 'Talento', 'Scudo', '124 Spider', '595 Abarth'],
  'Honda': ['Jazz', 'Civic', 'Accord', 'HR-V', 'CR-V', 'Pilot', 'Ridgeline', 'Passport', 'Odyssey', 'e:Ny1', 'Civic Type R', 'ZR-V'],
  'Nissan': ['Micra', 'Note', 'Leaf', 'Juke', 'Qashqai', 'X-Trail', 'Ariya', 'Navara', 'Pathfinder', 'Patrol', 'Armada', '370Z', 'GT-R', 'Z', 'Townstar'],
  'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'MX-30', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-90', 'MX-5', 'MX-5 RF'],
  'Porsche': ['911', '718 Cayman', '718 Boxster', 'Panamera', 'Cayenne', 'Macan', 'Taycan', '911 GT3', '911 Turbo'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'XC40 Recharge', 'S60', 'S90', 'V60', 'V90', 'V60 Cross Country', 'C40', 'EX30', 'EX90'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Semi'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Giulietta', 'Giulia Quadrifoglio', 'Stelvio Quadrifoglio', 'Tonale', 'Giulietta', 'MiTo', 'Giulia Veloce'],
  'Jaguar': ['XE', 'XF', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Defender 90', 'Defender 110', 'Defender 130'],
  'Mini': ['Cooper', 'Cooper S', 'Clubman', 'Countryman', 'Electric', 'John Cooper Works', 'Clubman JCW', 'Countryman JCW', 'Convertible', 'Paceman'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'Solterra', 'WRX', 'WRX STI', 'BRZ', 'Levorg'],
  'Suzuki': ['Swift', 'Baleno', 'Liana', 'Ciaz', 'Alto', 'Vitara', 'S-Cross', 'Across', 'Swace', 'Jimny', 'Ignis', 'e Vitara'],
  'Mitsubishi': ['Space Star', 'Mirage', 'Attrage', 'Lancer', 'Galant', 'ASX', 'Eclipse Cross', 'Outlander', 'Pajero', 'Pajero Sport', 'L200', 'Triton', 'i-MiEV'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Wagoneer', 'Grand Wagoneer', 'Avenger'],
  'Lexus': ['CT', 'IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'GX', 'LX', 'RZ', 'LFA', 'RC', 'LC', 'NX PHEV'],
  'Chevrolet': ['Spark', 'Beat', 'Sonic', 'Cruze', 'Malibu', 'Trax', 'Equinox', 'Blazer', 'Traverse', 'Tahoe', 'Suburban', 'Camaro', 'Corvette', 'Bolt', 'Bolt EUV', 'Colorado', 'Silverado'],
  'Dodge': ['Journey', 'Avenger', 'Challenger', 'Charger', 'Durango', 'Hornet', 'Charger SRT', 'Challenger SRT', 'Viper', 'Ram 1500'],
  'Chrysler': ['300', 'Pacifica', 'Voyager', '200', 'Sebring'],
  'Cadillac': ['CT4', 'CT5', 'Escalade', 'XT4', 'XT5', 'XT6', 'Lyriq', 'Celestiq', 'CT4-V', 'CT5-V', 'Escalade-V'],
  'Infiniti': ['Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX55', 'QX60', 'QX80'],
  'Aston Martin': ['DB11', 'DBS', 'Vantage', 'DBX', 'Valkyrie', 'DBS Superleggera', 'DB11 AMR'],
  'Bentley': ['Continental GT', 'Flying Spur', 'Bentayga', 'Mulliner', 'Continental GTC'],
  'Ferrari': ['488 GTB', '812 Superfast', 'SF90 Stradale', 'Roma', 'Portofino', '296 GTB', 'F8 Tributo', 'Purosangue'],
  'Lamborghini': ['Huracan', 'Aventador', 'Urus', 'Sian', 'Revuelto', 'Huracan STO', 'Huracan EVO'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'MC20', 'GranTurismo', 'GranCabrio'],
  'McLaren': ['720S', '570S', '600LT', '720S Spider', '765LT', 'Artura', 'P1', 'Senna', 'Speedtail'],
  'Rolls-Royce': ['Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Spectre', 'Ghost Black Badge'],
  'Bugatti': ['Chiron', 'Divo', 'Centodieci', 'Bolide'],
  'Koenigsegg': ['Jesko', 'Gemera', 'Regera', 'Agera RS'],
  'MAN': ['TGE', 'TGX', 'TGS', 'TGL', 'Lion\'s City', 'Lion\'s Coach'],
  'Mercedes-Benz Bus': ['Intouro', 'Tourismo', 'Travego', 'Citaro', 'eCitaro', 'Setra S 517'],
  'Setra': ['MultiClass', 'TopClass', 'ComfortClass', 'S 515 HDH'],
  'Van Hool': ['A-series', 'T-series', 'EX', 'CX'],
  'DAF': ['XF', 'XG', 'XG+', 'LF', 'CF', 'XB'],
  'Scania': ['R-series', 'S-series', 'G-series', 'P-series', 'L-series'],
  'Mercedes-Benz Sprinter': ['314 CDI', '316 CDI', '319 CDI', '516 CDI', '519 CDI', 'eSprinter'],
  'Volkswagen Transporter': ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T6.1', 'T7'],
  'Ford Transit': ['Transit', 'Transit Custom', 'Transit Connect', 'Transit Courier', 'Transit Chassis', 'Transit Trail'],
  'Renault Master': ['Master', 'Master Z.E.', 'Master dCi'],
  'Iveco Daily': ['Daily', 'Daily Electric', 'Daily Hi-Matic'],
  'Fiat Ducato': ['Ducato', 'Ducato Electric', 'Ducato Maxi'],
  'Peugeot Boxer': ['Boxer', 'Boxer Electric'],
  'Citroen Jumper': ['Jumper', 'Jumper Electric']
}

// Get all brands with models from API
export const getAllBrands = async () => {
  // Check cache first
  const now = Date.now()
  if (brandsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return brandsCache.map(b => b.name || b)
  }
  
  try {
    const response = await fetch(`${API_URL}/brands.php?action=all`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    if (data && data.brands) {
      brandsCache = data.brands
      lastFetchTime = now
      return data.brands.map(b => b.name || b)
    } else if (Array.isArray(data)) {
      brandsCache = data
      lastFetchTime = now
      return data.map(b => b.name || b)
    }
    throw new Error('Invalid data format')
  } catch (error) {
    console.warn('API failed, using fallback brands:', error.message)
    return FALLBACK_BRANDS
  }
}

// Get brands with models from API
export const getBrandsWithModels = async () => {
  const now = Date.now()
  if (brandsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return brandsCache
  }
  
  try {
    const response = await fetch(`${API_URL}/brands.php?action=all`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    if (data && data.brands) {
      brandsCache = data.brands
      lastFetchTime = now
      return data.brands
    } else if (Array.isArray(data)) {
      brandsCache = data
      lastFetchTime = now
      return data
    }
    throw new Error('Invalid data format')
  } catch (error) {
    console.warn('API failed, using fallback data:', error.message)
    // Return fallback format
    return FALLBACK_BRANDS.map(name => ({
      name,
      models: FALLBACK_MODELS[name] || []
    }))
  }
}

// Get models for a specific brand
export const getModelsForBrand = async (brand) => {
  if (!brand) return []
  
  try {
    const response = await fetch(`${API_URL}/brands.php?action=models&brand=${encodeURIComponent(brand)}`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    let models = []
    
    if (data && data.models) {
      models = data.models
    } else if (Array.isArray(data)) {
      models = data
    }
    
    if (Array.isArray(models) && models.length > 0) {
      return models.map(m => typeof m === 'string' ? m : (m.name || m.model || '')).filter(Boolean)
    }
    
    throw new Error('No models found')
  } catch (error) {
    console.warn('API failed for models, using fallback:', error.message)
    // Return fallback models for this brand
    return FALLBACK_MODELS[brand] || []
  }
}

// Get all models (all brands combined) - returns object with brand as key
export const getAllModels = async () => {
  const brandsWithModels = await getBrandsWithModels()
  const models = {}
  brandsWithModels.forEach(brand => {
    models[brand.name] = brand.models || []
  })
  return models
}

// Get all cities from API
export const getAllCities = async () => {
  const now = Date.now()
  if (citiesCache && (now - lastFetchTime) < CACHE_DURATION) {
    return citiesCache
  }
  
  try {
    const response = await fetch(`${API_URL}/cities.php?action=all`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    // API returns array of strings like ["Ljubljana", "Maribor"], not objects
    citiesCache = Array.isArray(data) ? data : []
    return citiesCache
  } catch (error) {
    console.error('Error fetching cities:', error)
    return []
  }
}

// Clear cache (useful when data is updated)
export const clearDataCache = () => {
  brandsCache = null
  citiesCache = null
  lastFetchTime = 0
}

// Static exports for components that need immediate data (without async)
export const brands = {} // Will be populated dynamically
export const defaultModels = {} // Will be populated dynamically

// Simple array of city names (for backwards compatibility)
export const slovenianCities = ['Ljubljana', 'Maribor', 'Celje', 'Koper', 'Kranj', 'Novo Gorica', 'Velenje', 'Nova Gorica', 'Kr�ko', 'Slovenska Bistrica', 'Ptuj', 'Murska Sobota', 'Kamnik', 'Dom�ale', '�kofja Loka', 'Lendava', 'Lenart', 'Roga�ka Slatina', 'Zrece', 'Portoro�', 'Bled', 'Bohinj', 'Kranjska Gora', 'Lucija', 'Izola', 'Ankaran', 'Ajdov�cina', 'Idrija', 'Vrhnika', 'Logatec', 'Postojna', 'Piran', 'Bre�ice', 'Kr�ko', 'Sevnica', 'Trbovlje', 'Zagreb', 'Celje', 'Koper', 'Ravne na Koro�kem'] // Will be populated dynamically

// Re-export for convenience
export const fuelTypes = ['Bencin', 'Dizel', 'Hybrid', 'Električni', 'Plin (LPG)']
export const transmissions = ['Avtomatski', 'Ročni', 'Polavtomatski']
export const bodyTypes = ['Traktor', 'Limuzina', 'Hatchback', 'Coupe', 'Kombi', 'Van', 'Pickup', 'Minivan', 'Kabriolet', 'Roadster', 'Targa', 'Fastback', 'Liftback', 'Športni coupe']
export const doorCounts = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30+']
export const colors = ['Bela', 'Črna', 'Siva', 'Rdeča', 'Modra', 'Zelena', 'Rumena', 'Oranžna', 'Rjava', 'Bež']
// Stanje vozila - radio buttons (mutually exclusive)
export const vehicleConditionOptions = [
  { value: 'Vozno', label: 'Vozno', description: 'NEpoškodovano, Ni karambolirano' },
  { value: 'NEvozno', label: 'NEvozno', description: 'poškodovano, karambolirano' },
  { value: 'V_okvari', label: 'V okvari', description: 'vendar NI karambolirano' },
]

// Stanje podtips (checkboxes that depend on main selection)
export const vehicleConditionSubOptions = {
  'Vozno': [
    { id: 'neposkodovano', label: 'NEpoškodovano' },
    { id: 'ni_karambolirano', label: 'Ni karambolirano' },
  ],
  'NEvozno': [
    { id: 'poskodovano', label: 'poškodovano' },
    { id: 'karambolirano', label: 'karambolirano' },
  ],
  'V_okvari': [
    { id: 'poplavljeno', label: 'vozilo je bilo poplavijeno' },
    { id: 'dikalnik', label: 'dirkalno vozilo' },
  ],
}

// Emission classes for Slovenia
export const emissionClasses = ['Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d', 'Euro 6e', 'Euro 6e-TEMP']

// Vehicle age / type
export const vehicleAgeOptions = [
  { value: 'Novo', label: 'Novo vozilo' },
  { value: 'Rabljeno', label: 'Rabljeno vozilo' },
  { value: 'Oldtimer', label: 'Oldtimer' },
]

// Number of previous owners
export const ownerCountOptions = ['0', '1', '2', '3', '4+']

// Months for date pickers
export const months = [
  { value: '01', label: 'Januar' },
  { value: '02', label: 'Februar' },
  { value: '03', label: 'Marec' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Maj' },
  { value: '06', label: 'Junij' },
  { value: '07', label: 'Julij' },
  { value: '08', label: 'Avgust' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

// Years for date pickers (last 30 years)
export const getYears = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= currentYear - 30; y--) {
    years.push(y.toString())
  }
  return years
}

// Nova struktura opreme - checkboxes by category
export const carEquipmentCategories = {
  notranjost: {
    name: 'Notranjost',
    icon: 'car',
    subcategories: {
      udobje: {
        name: 'Udobje',
        features: [
          'Virtualni Cockpit',
          'Ambientna osvetlitev notranjosti',
          'Leseni dodatki notranjosti',
          'ALU dodatki notranjosti',
          'Karbonski dodatki notranjosti',
          'Krom dodatki notranjosti',
          'Paket za kadilce',
          'Sportni sedezi',
          'Komfortni sedezi',
          'Ortopedski sedezi',
          '12V vticnica',
          'Klimatska naprava - rocna',
          'Sedeži: nastavitev po visini',
          'Sedeži: el. nastavitev',
          'Sedeži: paket Memory',
          'Sedeži: gretje spreda',
          'Sedeži: gretje zadaj',
          'Sedeži: hlajenje / ventilacija',
          'Sedeži: masazna funkcija',
          'Sredinski naslon za roko med sedezi',
          'Hladilni predal',
          'Avtomatska klimatska naprava / digitalna',
          'Klimatska naprava - 2 conska',
          'Klimatska naprava - 3 conska',
          'Klimatska naprava - 4 conska',
          'Gretje mirujocega vozila (Webasto)',
          'Tonirana stekla',
          'Elektricni pomik prednjih stekel',
          'Elektricni pomik prednjih in zadnjih stekel',
          'El. nastavijiva zunanja ogledala',
          'Ogrevanje zunanjih ogledal',
          'El. zlozijiva zunanja ogledala',
          'Centralno zaklepanje',
          'Centralno zaklepanje z daljinskim',
          'Soft-Close sistem zapiranja',
          'Sencni rolo za zadnje steklo',
          'Keyless Go',
          'Start-Stop sistem',
          'Elektricni paket',
          'Nastavijiv volan po visini',
          'Nastavijiv volan po globini',
          'Servo volan',
          'Volanski obroc oblecen v usnje',
          'Multifunkcijski volan',
          'Sportni volan',
          'Ogrevan volanski obroc',
          'Obvolanski prestavni rocici',
          'Tempomat',
          'Aktivni tempomat (Adaptive Cruise Control)',
          'El. parkima zavora',
          'El. zapiranje prtljaznika',
          'Ogrevano vetrobransko steklo',
        ]
      }
    }
  },
  info_multimedia: {
    name: 'Info-Multimedia',
    icon: 'radio',
    subcategories: {
      avtoradio: {
        name: 'Avtoradio in povezovanje',
        features: [
          'Avtoradio',
          'Avtoradio / CD',
          'Hi-Fi ozvocenje',
          'CD izmenjevalnik / strežnik',
          'MP3 predvajalnik',
          'DVD predvajalnik',
          'Trdi disk za shranjevanje podatkov',
          'USB prikljucek (iPod, HD...)',
          'TV sprejemnik / tuner',
          'Bluetooth vmesnik',
          'Apple CarPlay',
          'Android Auto',
          'Digitalni radio DAB',
          'Navigacija',
          'Navigacija + TV',
          'Touch screen',
        ]
      }
    }
  },
  uporabnost: {
    name: 'Uporabnost',
    icon: 'settings',
    subcategories: {
      uporabnost_main: {
        name: 'Uporabnost',
        features: [
          'Deljiva zad.klop 1/2 - 1/2',
          'Deljiva zad.klop 1/3 - 2/3',
          'Deljiva zad.klop 1/3-1/3-1/3',
          'Isofix sistem za pritrditev sedeza',
          'Integrirani otroški sedez',
          'Vreca za smuci',
          'Mrezasta pregrada tovornega prostora',
          'Rolo prijaznega prostora',
          'Navodila za uporabo v SLO jeziku',
          'Dvojno dno prtljaznika',
          'Strešne sani',
          'Predpriprava za mobilni telefon',
          'Avtatelefon',
          'Potovalni racunalnik',
          'Komunikacijski paket',
          'Pomoc pri speljevanju v klanec',
          'Sistem za aktivno pomoc pri parkiranju',
          'Parkimi senzorji PDC',
          'Pomoc pri parkiranju: kamera',
          'Pomoc pri parkiranju: prednji senzorji',
          'Pomoc pri parkiranju: zadnji senzorji',
          'Pomoc pri parkiranju: pogled 360 stopinj',
          'Vzratna kamera',
          'Bone stopnice',
          'Vlecna kijuka',
          'Vozilo priagojeno invalidu',
        ]
      }
    }
  },
  sedezi_in_vrata: {
    name: 'Sedeži in vrata',
    icon: 'users',
    subcategories: {
      sedeži: {
        name: 'Sedeži',
        features: [
          'Sedežev: 2',
          'Sedežev: 4',
          'Sedežev: 5',
          'Sedežev: 5+2',
          'Sedežev: 7',
          'Sedežev: 8',
          'Bus 30+',
          'Usnjeni sedeži',
          'Delno usnjeni sedeži',
          'Alcantara sedeži',
          'Sklopiva klop 60/40',
          'Sklopiva klop 40/20/40',
        ]
      },
      obloge_vrat: {
        name: 'Obloge vrat',
        features: [
          'Obloga vrat - les',
          'Obloga vrat - aluminij',
          'Obloga vrat - karbon',
          'Obloga vrat - krom',
        ]
      },
      vrata: {
        name: 'Število vrat',
        features: [
          'Vrat: 2',
          'Vrat: 3',
          'Vrat: 4',
          'Vrat: 5',
        ]
      }
    }
  },
  podvozje: {
    name: 'Podvozje',
    icon: 'settings-2',
    subcategories: {
      platisca: {
        name: 'Platisca',
        features: [
          'Platisca (ALU)',
        ]
      },
      zavorni_sistem: {
        name: 'Zavorni sistem',
        features: [
          'Zavorni sistem (ABS)',
          'Pomoc pri zaviranju (BAS / DBC / EBV)',
          'Samodejna zapora diferenciala (ASD / EDS)',
        ]
      },
      stabilnost: {
        name: 'Stabilnost',
        features: [
          'Elektronski program stabilnosti (ESP / DSC)',
          'Elektronski nadzor Blaiseilnikov (EDC)',
          'Regulacija nivoja podvozja (ADS)',
          'Stirikolesni volan (4WS / 4CONTROL)',
          'Regulacija zdrsa pogonskih koles (ASR / DTC)',
          'Elektronski sistem za bolisi opnijem koles ETS',
        ]
      },
      podvozje_vrsta: {
        name: 'Vrsta podvozja',
        features: [
          'Športno podvozje',
          'Aktivno vzmetenje (ABC - Active Body Control)',
          'Zracno vzmetenje',
          'Štirikolesni pogon (4x4 / 4WD / Quattro)',
        ]
      }
    }
  },
  varnost: {
    name: 'Varnost',
    icon: 'shield',
    subcategories: {
      airbag: {
        name: 'Stevilo airbagov',
        features: [
          'Airbag - voznik',
          'Airbag - sopotnik',
          'Airbag - stranski (vratni)',
          'Airbag - zavesni',
          'Airbag - kolenski',
        ]
      },
      svetila: {
        name: 'Žarometi in luci',
        features: [
          'Nadzor zracnega tlaka v pnevmatikah (RDK)',
          'Xenonski zarometi',
          'Bi-xenonski zarometi',
          'Samodejno upravljanje dolgih luzi',
          'LED zarometi',
          'Prednje (dnevne) LED luci',
          'Zadnje LED luci',
          'Meglenke',
          'Adaptive light / dinamicno prilagodijivi zarometi',
          '3. zavorna luc',
          'Naprava za pranie zarometov',
        ]
      },
      asistence: {
        name: 'Varnostni asistenti',
        features: [
          'Head-Up display',
          'Sistem za ohranjanje voznega pasu',
          'Sistem za opozarjanje na mrtvi kot',
          'Sistem za prepoznavo prometnih znakov',
          'Senzor za dez',
          'Sistem za samodejno zaviranje v sili',
          'Opozorilnik spremembe voznega pasu',
          'Opozorilnik varnostne razdalje',
        ]
      },
      zascita: {
        name: 'Zascita',
        features: [
          'Alarmna naprava',
          'Blokada motorja',
          'Kodno varovan vzign motorja',
        ]
      },
      pnevmatike: {
        name: 'Pnevmatike',
        features: [
          'Rezervno kolo normalne dimenzije',
          'Run-Flat pnevmatike',
        ]
      }
    }
  },
  zunanjost: {
    name: 'Zunanjost',
    icon: 'sun',
    subcategories: {
      zunanjost_main: {
        name: 'Zunanjost',
        features: [
          'Roofracks - Strešne sani',
          'Towbar - Vlecna kljuka',
          'Zasenčena stekla',
          'Privacy stekla',
          'Karbon paket zunanj',
          'Športni izpuh',
          'Automatski žarometi',
          'Označevalne luci LED',
        ]
      }
    }
  },
  garancija_stanje: {
    name: 'Garancija in stanje',
    icon: 'award',
    subcategories: {
      garancija: {
        name: 'Garancija',
        features: [
          'Vozilo ima garancio',
          'Vozilo ima jamstvo',
          'Vozilo ima oldtimer certifikat',
          'Servisna knjiga',
          'Poln servis',
          'Garažirano',
          'Brezhibno',
          'Ne kadi',
          'Prvi lastnik',
        ]
      },
      registracija: {
        name: 'Registracija',
        features: [
          'Vozilo je registrirano',
          'Vozilo je tecnicno pregledano',
        ]
      }
    }
  },
}

export const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic Listing',
    price: 5,
    duration: 30,
    features: [
      'Standard placement',
      'Basic stats',
      '5 photos included',
    ],
  },
  {
    id: 'featured',
    name: 'Featured Listing',
    price: 12,
    duration: 30,
    popular: true,
    features: [
      'Homepage placement',
      'Priority in search',
      '10 photos included',
      'Basic stats',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Listing',
    price: 20,
    duration: 30,
    features: [
      'Homepage & search priority',
      'Highlighted listing',
      '20 photos included',
      'Advanced analytics',
      'Social media promotion',
    ],
  },
]

export const promotionPackages = [
  { id: '24h', name: '24 Hours', price: 3, duration: 1 },
  { id: '7d', name: '7 Days', price: 10, duration: 7 },
  { id: '30d', name: '30 Days', price: 25, duration: 30 },
]

export const companyInfo = {
  name: 'AutoMarket d.o.o.',
  address: 'Celovška cesta 100',
  city: 'Ljubljana',
  postalCode: '1000',
  country: 'Slovenija',
  phone: '+386 1 234 5678',
  email: 'info@automarket.si',
  website: 'www.automarket.si',
  taxId: 'SI12345678',
}

export const LUXURY_CAR_THRESHOLD = 30000
export const LUXURY_FEE = 10

// ============ CAR FEATURES ============
// These are organized by category for better UI grouping
export const carFeatures = {
  safety: [
    { id: 1, name_sl: 'Airbag - voznik', name_en: 'Airbag - driver', icon: 'shield' },
    { id: 2, name_sl: 'Airbag - sopotnik', name_en: 'Airbag - passenger', icon: 'shield' },
    { id: 3, name_sl: 'Airbag - stranski', name_en: 'Side airbag', icon: 'shield' },
    { id: 4, name_sl: 'Airbag - zavese', name_en: 'Curtain airbag', icon: 'shield' },
    { id: 5, name_sl: 'ABS', name_en: 'ABS', icon: 'circle' },
    { id: 6, name_sl: 'ESP', name_en: 'ESP', icon: 'activity' },
    { id: 7, name_sl: 'ASR (traction control)', name_en: 'ASR (traction control)', icon: 'sliders' },
    { id: 8, name_sl: 'D SRC', name_en: 'D SRC', icon: 'alert-circle' },
    { id: 9, name_sl: 'Zavora za pomoč pri zaviranju', name_en: 'Brake assist', icon: 'anchor' },
    { id: 10, name_sl: 'Sistem za nadzor mrtvega kota', name_en: 'Blind spot monitoring', icon: 'eye' },
    { id: 11, name_sl: 'Sistem za ohranjanje voznega pasu', name_en: 'Lane keep assist', icon: 'git-branch' },
    { id: 12, name_sl: 'Sistem za zaznavanje utrujenosti', name_en: 'Fatigue detection', icon: 'alert-triangle' },
    { id: 13, name_sl: 'Sistem za preprečevanje trčenja', name_en: 'Collision prevention', icon: 'alert-octagon' },
    { id: 14, name_sl: 'Parkirni senzorji - spredaj', name_en: 'Parking sensors - front', icon: 'map-pin' },
    { id: 15, name_sl: 'Parkirni senzorji - zadaj', name_en: 'Parking sensors - rear', icon: 'map-pin' },
    { id: 16, name_sl: 'Parkirna kamera', name_en: 'Parking camera', icon: 'video' },
    { id: 17, name_sl: '360° kamera', name_en: '360° camera', icon: 'aperture' },
    { id: 18, name_sl: 'Tempomat', name_en: 'Cruise control', icon: 'gauge' },
    { id: 19, name_sl: 'Adaptivni tempomat', name_en: 'Adaptive cruise control', icon: 'gauge' },
  ],
  comfort: [
    { id: 20, name_sl: 'Klimatska naprava', name_en: 'Air conditioning', icon: 'thermometer' },
    { id: 21, name_sl: 'Avtomatska klimatska naprava', name_en: 'Automatic climate control', icon: 'thermometer' },
    { id: 22, name_sl: 'Dvo conska klimatska naprava', name_en: 'Dual zone climate control', icon: 'thermometer' },
    { id: 23, name_sl: 'Štiri conska klimatska naprava', name_en: 'Four zone climate control', icon: 'thermometer' },
    { id: 24, name_sl: 'Grete sedežev', name_en: 'Heated seats', icon: 'heart' },
    { id: 25, name_sl: 'Grete sedežev - spredaj', name_en: 'Heated front seats', icon: 'heart' },
    { id: 26, name_sl: 'Grete sedežev - zadaj', name_en: 'Heated rear seats', icon: 'heart' },
    { id: 27, name_sl: 'Grete volanskega obroča', name_en: 'Heated steering wheel', icon: 'circle' },
    { id: 28, name_sl: 'Ventralni sedež', name_en: 'Ventilated seats', icon: 'wind' },
    { id: 29, name_sl: 'Električno nastavljivi sedeži', name_en: 'Electric seats adjustment', icon: 'zap' },
    { id: 30, name_sl: 'Sedeži z pomnilnikom', name_en: 'Memory seats', icon: 'save' },
    { id: 31, name_sl: 'Električno odpiranje prtljažnika', name_en: 'Electric tailgate', icon: 'package' },
    { id: 32, name_sl: 'Panoramska streha', name_en: 'Panoramic sunroof', icon: 'sun' },
    { id: 33, name_sl: 'Strešno okno', name_en: 'Sunroof', icon: 'cloud' },
    { id: 34, name_sl: 'Soft close vrata', name_en: 'Soft close doors', icon: 'door-closed' },
    { id: 35, name_sl: 'Keyless entry', name_en: 'Keyless entry', icon: 'key' },
    { id: 36, name_sl: 'Keyless go', name_en: 'Keyless go', icon: 'log-in' },
    { id: 37, name_sl: 'Električno zložljiva ogledala', name_en: 'Electric folding mirrors', icon: 'square' },
    { id: 38, name_sl: 'Ogrevana ogledala', name_en: 'Heated mirrors', icon: 'thermometer' },
    { id: 39, name_sl: 'Ambientna osvetlitev', name_en: 'Ambient lighting', icon: 'sun' },
    { id: 40, name_sl: 'Notranji ambient - več barv', name_en: 'Multi-color ambient lighting', icon: 'palette' },
  ],
  technology: [
    { id: 41, name_sl: 'USB vhod', name_en: 'USB input', icon: 'smartphone' },
    { id: 42, name_sl: 'USB-C vhod', name_en: 'USB-C input', icon: 'smartphone' },
    { id: 43, name_sl: 'Bluetooth', name_en: 'Bluetooth', icon: 'bluetooth' },
    { id: 44, name_sl: 'Apple CarPlay', name_en: 'Apple CarPlay', icon: 'smartphone' },
    { id: 45, name_sl: 'Android Auto', name_en: 'Android Auto', icon: 'smartphone' },
    { id: 46, name_sl: 'Brezžično polnjenje', name_en: 'Wireless charging', icon: 'zap' },
    { id: 47, name_sl: 'Premium zvočni sistem', name_en: 'Premium audio system', icon: 'volume-2' },
    { id: 48, name_sl: 'Harman Kardon zvočniki', name_en: 'Harman Kardon speakers', icon: 'volume-2' },
    { id: 49, name_sl: 'DAB radio', name_en: 'DAB radio', icon: 'radio' },
    { id: 50, name_sl: 'Navigacijski sistem', name_en: 'Navigation system', icon: 'navigation' },
    { id: 51, name_sl: 'Head-up display', name_en: 'Head-up display', icon: 'monitor' },
    { id: 52, name_sl: 'Digitalna instrumentna plošča', name_en: 'Digital instrument cluster', icon: 'monitor' },
    { id: 53, name_sl: 'Touchscreen zaslon', name_en: 'Touchscreen display', icon: 'tablet' },
    { id: 54, name_sl: 'Wi-Fi hotspot', name_en: 'Wi-Fi hotspot', icon: 'wifi' },
    { id: 55, name_sl: 'Pomoč pri speljevanju v klanec', name_en: 'Hill start assist', icon: 'trending-up' },
    { id: 56, name_sl: 'Sistem Start-Stop', name_en: 'Start-Stop system', icon: 'power' },
  ],
  exterior: [
    { id: 57, name_sl: 'Aluminijasta platišča', name_en: 'Alloy wheels', icon: 'circle' },
    { id: 58, name_sl: 'LED žarometi', name_en: 'LED headlights', icon: 'sun' },
    { id: 59, name_sl: 'Matrix LED žarometi', name_en: 'Matrix LED headlights', icon: 'sun' },
    { id: 60, name_sl: 'Xenon žarometi', name_en: 'Xenon headlights', icon: 'sun' },
    { id: 61, name_sl: 'Pragovi v barvi karoserije', name_en: 'Color-coded sills', icon: 'square' },
    { id: 62, name_sl: 'Športno podvozje', name_en: 'Sports suspension', icon: 'settings' },
    { id: 63, name_sl: 'Zračno podvozje', name_en: 'Air suspension', icon: 'wind' },
    { id: 64, name_sl: 'Adaptivno podvozje', name_en: 'Adaptive suspension', icon: 'sliders' },
    { id: 65, name_sl: 'Roofracks', name_en: 'Roof rails', icon: 'minus' },
    { id: 66, name_sl: 'Towbar', name_en: 'Towbar', icon: 'anchor' },
    { id: 67, name_sl: 'Zasenčena stekla', name_en: 'Tinted windows', icon: 'moon' },
    { id: 68, name_sl: 'Privacy stekla', name_en: 'Privacy glass', icon: 'shield' },
    { id: 69, name_sl: 'Karbon paket', name_en: 'Carbon package', icon: 'hexagon' },
    { id: 70, name_sl: 'Športni izpuh', name_en: 'Sport exhaust', icon: 'music' },
    { id: 71, name_sl: 'Automatski žarometi', name_en: 'Auto headlights', icon: 'sun' },
    { id: 72, name_sl: 'Označevalne luči LED', name_en: 'LED DRL', icon: 'sun' },
  ],
  interior: [
    { id: 73, name_sl: 'Usnjeni sedeži', name_en: 'Leather seats', icon: 'square' },
    { id: 74, name_sl: 'Delno usnjeni sedeži', name_en: 'Partial leather seats', icon: 'square' },
    { id: 75, name_sl: 'Alcantara sedeži', name_en: 'Alcantara seats', icon: 'square' },
    { id: 76, name_sl: 'Športni sedeži', name_en: 'Sport seats', icon: 'target' },
    { id: 77, name_sl: 'Električno nastavljiv volan', name_en: 'Electric steering wheel adjustment', icon: 'zap' },
    { id: 78, name_sl: 'Volan v perforiranem usnju', name_en: 'Perforated leather steering wheel', icon: 'circle' },
    { id: 79, name_sl: 'Aluminijaste pedalne obloge', name_en: 'Aluminum pedals', icon: 'triangle' },
    { id: 80, name_sl: 'Obloga vrat - les', name_en: 'Wood trim', icon: 'square' },
    { id: 81, name_sl: 'Obloga vrat - aluminij', name_en: 'Aluminum trim', icon: 'square' },
    { id: 82, name_sl: 'Obloga vrat - karbon', name_en: 'Carbon trim', icon: 'hexagon' },
    { id: 83, name_sl: 'Sklopiva klop 60/40', name_en: 'Folding rear bench 60/40', icon: 'minimize-2' },
    { id: 84, name_sl: 'Sklopiva klop 40/20/40', name_en: 'Folding rear bench 40/20/40', icon: 'grid' },
    { id: 85, name_sl: 'Prtljažnik - tali', name_en: 'Flat boot floor', icon: 'square' },
    { id: 86, name_sl: 'Prtljažnik - delilnik', name_en: 'Boot partition', icon: 'grid' },
  ],
  seats: [
    { id: 87, name_sl: 'Sedežev: 2', name_en: 'Seats: 2', icon: 'users' },
    { id: 88, name_sl: 'Sedežev: 4', name_en: 'Seats: 4', icon: 'users' },
    { id: 89, name_sl: 'Sedežev: 5', name_en: 'Seats: 5', icon: 'users' },
    { id: 90, name_sl: 'Sedežev: 5+2', name_en: 'Seats: 5+2', icon: 'users' },
    { id: 91, name_sl: 'Sedežev: 7', name_en: 'Seats: 7', icon: 'users' },
    { id: 92, name_sl: 'Sedežev: 8', name_en: 'Seats: 8', icon: 'users' },
    { id: 93, name_sl: 'Sedeži za otroke - ISOFIX', name_en: 'Child seats - ISOFIX', icon: 'anchor' },
    { id: 94, name_sl: 'Sedeži za otroke - Top tether', name_en: 'Child seats - Top tether', icon: 'anchor' },
  ],
  doors: [
    { id: 95, name_sl: 'Vrat: 2', name_en: 'Doors: 2', icon: 'door-closed' },
    { id: 96, name_sl: 'Vrat: 3', name_en: 'Doors: 3', icon: 'door-closed' },
    { id: 97, name_sl: 'Vrat: 4', name_en: 'Doors: 4', icon: 'door-closed' },
    { id: 98, name_sl: 'Vrat: 5', name_en: 'Doors: 5', icon: 'door-closed' },
  ],
  efficiency: [
    { id: 99, name_sl: 'Start Stop sistem', name_en: 'Start Stop system', icon: 'power' },
    { id: 100, name_sl: 'Rekuperacija zavorne energije', name_en: 'Brake energy recovery', icon: 'refresh-cw' },
    { id: 101, name_sl: 'Nizke emisije', name_en: 'Low emissions', icon: 'leaf' },
    { id: 102, name_sl: 'Euro 6', name_en: 'Euro 6', icon: 'award' },
    { id: 103, name_sl: 'CO2: manj kot 100 g/km', name_en: 'CO2: less than 100 g/km', icon: 'cloud' },
    { id: 104, name_sl: 'CO2: manj kot 50 g/km', name_en: 'CO2: less than 50 g/km', icon: 'cloud' },
    { id: 105, name_sl: 'Električni doseg: nad 300 km', name_en: 'Electric range: over 300 km', icon: 'battery' },
    { id: 106, name_sl: 'Hibridni vtič', name_en: 'Plug-in hybrid', icon: 'plug' },
  ],
  other: [
    { id: 107, name_sl: 'Garažirano', name_en: 'Garaged', icon: 'home' },
    { id: 108, name_sl: 'Brezhibno', name_en: 'Impeccable condition', icon: 'award' },
    { id: 109, name_sl: 'Servisna knjiga', name_en: 'Service book', icon: 'book' },
    { id: 110, name_sl: 'Poln servis', name_en: 'Full service history', icon: 'file-text' },
    { id: 111, name_sl: 'Ne kadi', name_en: 'Non-smoker', icon: 'heart' },
    { id: 112, name_sl: 'Prvi lastnik', name_en: 'First owner', icon: 'user' },
    { id: 113, name_sl: 'Vozilo je registrirano', name_en: 'Vehicle registered', icon: 'check-circle' },
    { id: 114, name_sl: 'Vozilo je tehnično pregledano', name_en: 'Vehicle inspected', icon: 'check-circle' },
    { id: 115, name_sl: 'Možna menjava', name_en: 'Exchange possible', icon: 'repeat' },
    { id: 116, name_sl: 'Možno financiranje', name_en: 'Financing possible', icon: 'credit-card' },
    { id: 117, name_sl: 'Možna dostava', name_en: 'Delivery possible', icon: 'truck' },
    { id: 118, name_sl: 'Test vozila možen', name_en: 'Test drive possible', icon: 'play' },
  ],
}

// Helper function to get all features as flat array
export const getAllCarFeatures = () => {
  const all = []
  Object.values(carFeatures).forEach(category => {
    all.push(...category)
  })
  return all
}

// Helper function to get features by category
export const getFeaturesByCategory = (category) => {
  return carFeatures[category] || []
}

// Helper function to get feature name by id (returns SL name if language is SL, EN otherwise)
export const getFeatureNameById = (id, language = 'sl') => {
  const all = getAllCarFeatures()
  const feature = all.find(f => f.id === id)
  if (!feature) return ''
  return language === 'sl' ? feature.name_sl : feature.name_en
}

// Helper function to get feature by id
export const getFeatureById = (id) => {
  const all = getAllCarFeatures()
  return all.find(f => f.id === id)
}

// Category display names
export const featureCategoryNames = {
  safety: { sl: 'Varnost', en: 'Safety' },
  comfort: { sl: 'Udobje', en: 'Comfort' },
  technology: { sl: 'Tehnologija', en: 'Technology' },
  exterior: { sl: 'Zunanjost', en: 'Exterior' },
  interior: { sl: 'Notranjost', en: 'Interior' },
  seats: { sl: 'Sedeži', en: 'Seats' },
  doors: { sl: 'Vrata', en: 'Doors' },
  efficiency: { sl: 'Gorivo/Izplen', en: 'Fuel/Efficiency' },
  other: { sl: 'Ostalo', en: 'Other' },
}
