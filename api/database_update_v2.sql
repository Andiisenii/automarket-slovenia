-- ============================================
-- AutoMarket Slovenia - Database Updates
-- Adds new fields for car listings
-- ============================================

-- Add new columns to cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vehicle_condition VARCHAR(50);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vehicle_condition_sub TEXT[];
ALTER TABLE cars ADD COLUMN IF NOT EXISTS fuel_consumption NUMERIC(5,2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS emission_class VARCHAR(20);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS co2_emissions INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS auto_publish_fuel_data BOOLEAN DEFAULT FALSE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vehicle_age VARCHAR(50);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS has_warranty BOOLEAN DEFAULT FALSE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS has_guarantee BOOLEAN DEFAULT FALSE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS has_oldtimer_cert BOOLEAN DEFAULT FALSE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS first_reg_month VARCHAR(2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS first_reg_year INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS technical_valid_until DATE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS owner_count INTEGER DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS door_count VARCHAR(10);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS package VARCHAR(50);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS surname TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS username TEXT;

-- Change feature_ids from INTEGER[] to TEXT[] (since we now use feature names)
ALTER TABLE cars ALTER COLUMN feature_ids TYPE TEXT[];

-- ============================================
-- BRANDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, name)
);

-- ============================================
-- CAR FEATURES (NEW STRUCTURE - TEXT NAMES)
-- ============================================
-- Drop old table and create new one with text-based feature names
DROP TABLE IF EXISTS car_features_new;

CREATE TABLE car_features_new (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    subcategory TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert new features (text-based)
INSERT INTO car_features_new (name, category, subcategory) VALUES
-- NOTRANJOST - Udobje
('Virtualni Cockpit', 'notranjost', 'udobje'),
('Ambientna osvetlitev notranjosti', 'notranjost', 'udobje'),
('Leseni dodatki notranjosti', 'notranjost', 'udobje'),
('ALU dodatki notranjosti', 'notranjost', 'udobje'),
('Karbonski dodatki notranjosti', 'notranjost', 'udobje'),
('Krom dodatki notranjosti', 'notranjost', 'udobje'),
('Paket za kadilce', 'notranjost', 'udobje'),
('Sportni sedezi', 'notranjost', 'udobje'),
('Komfortni sedezi', 'notranjost', 'udobje'),
('Ortopedski sedezi', 'notranjost', 'udobje'),
('12V vticnica', 'notranjost', 'udobje'),
('Klimatska naprava - rocna', 'notranjost', 'udobje'),
('Sedeži: nastavitev po visini', 'notranjost', 'udobje'),
('Sedeži: el. nastavitev', 'notranjost', 'udobje'),
('Sedeži: paket Memory', 'notranjost', 'udobje'),
('Sedeži: gretje spreda', 'notranjost', 'udobje'),
('Sedeži: gretje zadaj', 'notranjost', 'udobje'),
('Sedeži: hlajenje / ventilacija', 'notranjost', 'udobje'),
('Sedeži: masazna funkcija', 'notranjost', 'udobje'),
('Sredinski naslon za roko med sedezi', 'notranjost', 'udobje'),
('Hladilni predal', 'notranjost', 'udobje'),
('Avtomatska klimatska naprava / digitalna', 'notranjost', 'udobje'),
('Klimatska naprava - 2 conska', 'notranjost', 'udobje'),
('Klimatska naprava - 3 conska', 'notranjost', 'udobje'),
('Klimatska naprava - 4 conska', 'notranjost', 'udobje'),
('Gretje mirujocega vozila (Webasto)', 'notranjost', 'udobje'),
('Tonirana stekla', 'notranjost', 'udobje'),
('Elektricni pomik prednjih stekel', 'notranjost', 'udobje'),
('Elektricni pomik prednjih in zadnjih stekel', 'notranjost', 'udobje'),
('El. nastavijiva zunanja ogledala', 'notranjost', 'udobje'),
('Ogrevanje zunanjih ogledal', 'notranjost', 'udobje'),
('El. zlozijiva zunanja ogledala', 'notranjost', 'udobje'),
('Centralno zaklepanje', 'notranjost', 'udobje'),
('Centralno zaklepanje z daljinskim', 'notranjost', 'udobje'),
('Soft-Close sistem zapiranja', 'notranjost', 'udobje'),
('Sencni rolo za zadnje steklo', 'notranjost', 'udobje'),
('Keyless Go', 'notranjost', 'udobje'),
('Start-Stop sistem', 'notranjost', 'udobje'),
('Elektricni paket', 'notranjost', 'udobje'),
('Nastavijiv volan po visini', 'notranjost', 'udobje'),
('Nastavijiv volan po globini', 'notranjost', 'udobje'),
('Servo volan', 'notranjost', 'udobje'),
('Volanski obroc oblecen v usnje', 'notranjost', 'udobje'),
('Multifunkcijski volan', 'notranjost', 'udobje'),
('Sportni volan', 'notranjost', 'udobje'),
('Ogrevan volanski obroc', 'notranjost', 'udobje'),
('Obvolanski prestavni rocici', 'notranjost', 'udobje'),
('Tempomat', 'notranjost', 'udobje'),
('Aktivni tempomat (Adaptive Cruise Control)', 'notranjost', 'udobje'),
('El. parkima zavora', 'notranjost', 'udobje'),
('El. zapiranje prtljaznika', 'notranjost', 'udobje'),
('Ogrevano vetrobransko steklo', 'notranjost', 'udobje'),

-- INFO_MULTIMEDIA
('Avtoradio', 'info_multimedia', 'avtoradio'),
('Avtoradio / CD', 'info_multimedia', 'avtoradio'),
('Hi-Fi ozvocenje', 'info_multimedia', 'avtoradio'),
('CD izmenjevalnik / strežnik', 'info_multimedia', 'avtoradio'),
('MP3 predvajalnik', 'info_multimedia', 'avtoradio'),
('DVD predvajalnik', 'info_multimedia', 'avtoradio'),
('Trdi disk za shranjevanje podatkov', 'info_multimedia', 'avtoradio'),
('USB prikljucek (iPod, HD...)', 'info_multimedia', 'avtoradio'),
('TV sprejemnik / tuner', 'info_multimedia', 'avtoradio'),
('Bluetooth vmesnik', 'info_multimedia', 'avtoradio'),
('Apple CarPlay', 'info_multimedia', 'avtoradio'),
('Android Auto', 'info_multimedia', 'avtoradio'),
('Digitalni radio DAB', 'info_multimedia', 'avtoradio'),
('Navigacija', 'info_multimedia', 'avtoradio'),
('Navigacija + TV', 'info_multimedia', 'avtoradio'),
('Touch screen', 'info_multimedia', 'avtoradio'),

-- UPORABNOST
('Deljiva zad.klop 1/2 - 1/2', 'uporabnost', 'uporabnost_main'),
('Deljiva zad.klop 1/3 - 2/3', 'uporabnost', 'uporabnost_main'),
('Deljiva zad.klop 1/3-1/3-1/3', 'uporabnost', 'uporabnost_main'),
('Isofix sistem za pritrditev sedeza', 'uporabnost', 'uporabnost_main'),
('Integrirani otroški sedez', 'uporabnost', 'uporabnost_main'),
('Vreca za smuci', 'uporabnost', 'uporabnost_main'),
('Mrezasta pregrada tovornega prostora', 'uporabnost', 'uporabnost_main'),
('Rolo prijaznega prostora', 'uporabnost', 'uporabnost_main'),
('Navodila za uporabo v SLO jeziku', 'uporabnost', 'uporabnost_main'),
('Dvojno dno prtljaznika', 'uporabnost', 'uporabnost_main'),
('Strešne sani', 'uporabnost', 'uporabnost_main'),
('Predpriprava za mobilni telefon', 'uporabnost', 'uporabnost_main'),
('Avtatelefon', 'uporabnost', 'uporabnost_main'),
('Potovalni racunalnik', 'uporabnost', 'uporabnost_main'),
('Komunikacijski paket', 'uporabnost', 'uporabnost_main'),
('Pomoc pri speljevanju v klanec', 'uporabnost', 'uporabnost_main'),
('Sistem za aktivno pomoc pri parkiranju', 'uporabnost', 'uporabnost_main'),
('Parkimi senzorji PDC', 'uporabnost', 'uporabnost_main'),
('Pomoc pri parkiranju: kamera', 'uporabnost', 'uporabnost_main'),
('Pomoc pri parkiranju: prednji senzorji', 'uporabnost', 'uporabnost_main'),
('Pomoc pri parkiranju: zadnji senzorji', 'uporabnost', 'uporabnost_main'),
('Pomoc pri parkiranju: pogled 360 stopinj', 'uporabnost', 'uporabnost_main'),
('Vzratna kamera', 'uporabnost', 'uporabnost_main'),
('Bone stopnice', 'uporabnost', 'uporabnost_main'),
('Vlecna kijuka', 'uporabnost', 'uporabnost_main'),
('Vozilo priagojeno invalidu', 'uporabnost', 'uporabnost_main'),

-- SEDEZI IN VRATA
('Sedežev: 2', 'sedeži_in_vrata', 'sedeži'),
('Sedežev: 4', 'sedeži_in_vrata', 'sedeži'),
('Sedežev: 5', 'sedeži_in_vrata', 'sedeži'),
('Sedežev: 5+2', 'sedeži_in_vrata', 'sedeži'),
('Sedežev: 7', 'sedeži_in_vrata', 'sedeži'),
('Sedežev: 8', 'sedeži_in_vrata', 'sedeži'),
('Bus 30+', 'sedeži_in_vrata', 'sedeži'),
('Usnjeni sedeži', 'sedeži_in_vrata', 'sedeži'),
('Delno usnjeni sedeži', 'sedeži_in_vrata', 'sedeži'),
('Alcantara sedeži', 'sedeži_in_vrata', 'sedeži'),
('Sklopiva klop 60/40', 'sedeži_in_vrata', 'sedeži'),
('Sklopiva klop 40/20/40', 'sedeži_in_vrata', 'sedeži'),
('Obloga vrat - les', 'sedeži_in_vrata', 'obloge_vrat'),
('Obloga vrat - aluminij', 'sedeži_in_vrata', 'obloge_vrat'),
('Obloga vrat - karbon', 'sedeži_in_vrata', 'obloge_vrat'),
('Obloga vrat - krom', 'sedeži_in_vrata', 'obloge_vrat'),
('Vrat: 2', 'sedeži_in_vrata', 'vrata'),
('Vrat: 3', 'sedeži_in_vrata', 'vrata'),
('Vrat: 4', 'sedeži_in_vrata', 'vrata'),
('Vrat: 5', 'sedeži_in_vrata', 'vrata'),

-- PODVOZJE
('Platisca (ALU)', 'podvozje', 'platisca'),
('Zavorni sistem (ABS)', 'podvozje', 'zavorni_sistem'),
('Pomoc pri zaviranju (BAS / DBC / EBV)', 'podvozje', 'zavorni_sistem'),
('Samodejna zapora diferenciala (ASD / EDS)', 'podvozje', 'zavorni_sistem'),
('Elektronski program stabilnosti (ESP / DSC)', 'podvozje', 'stabilnost'),
('Elektronski nadzor Blaiseilnikov (EDC)', 'podvozje', 'stabilnost'),
('Regulacija nivoja podvozja (ADS)', 'podvozje', 'stabilnost'),
('Stirikolesni volan (4WS / 4CONTROL)', 'podvozje', 'stabilnost'),
('Regulacija zdrsa pogonskih koles (ASR / DTC)', 'podvozje', 'stabilnost'),
('Elektronski sistem za bolisi opnijem koles ETS', 'podvozje', 'stabilnost'),
('Športno podvozje', 'podvozje', 'podvozje_vrsta'),
('Aktivno vzmetenje (ABC - Active Body Control)', 'podvozje', 'podvozje_vrsta'),
('Zracno vzmetenje', 'podvozje', 'podvozje_vrsta'),
('Štirikolesni pogon (4x4 / 4WD / Quattro)', 'podvozje', 'podvozje_vrsta'),

-- VARNOST
('Airbag - voznik', 'varnost', 'airbag'),
('Airbag - sopotnik', 'varnost', 'airbag'),
('Airbag - stranski (vratni)', 'varnost', 'airbag'),
('Airbag - zavesni', 'varnost', 'airbag'),
('Airbag - kolenski', 'varnost', 'airbag'),
('Nadzor zracnega tlaka v pnevmatikah (RDK)', 'varnost', 'svetila'),
('Xenonski zarometi', 'varnost', 'svetila'),
('Bi-xenonski zarometi', 'varnost', 'svetila'),
('Samodejno upravljanje dolgih luzi', 'varnost', 'svetila'),
('LED zarometi', 'varnost', 'svetila'),
('Prednje (dnevne) LED luci', 'varnost', 'svetila'),
('Zadnje LED luci', 'varnost', 'svetila'),
('Meglenke', 'varnost', 'svetila'),
('Adaptive light / dinamicno prilagodijivi zarometi', 'varnost', 'svetila'),
('3. zavorna luc', 'varnost', 'svetila'),
('Naprava za pranie zarometov', 'varnost', 'svetila'),
('Head-Up display', 'varnost', 'asistence'),
('Sistem za ohranjanje voznega pasu', 'varnost', 'asistence'),
('Sistem za opozarjanje na mrtvi kot', 'varnost', 'asistence'),
('Sistem za prepoznavo prometnih znakov', 'varnost', 'asistence'),
('Senzor za dez', 'varnost', 'asistence'),
('Sistem za samodejno zaviranje v sili', 'varnost', 'asistence'),
('Opozorilnik spremembe voznega pasu', 'varnost', 'asistence'),
('Opozorilnik varnostne razdalje', 'varnost', 'asistence'),
('Alarmna naprava', 'varnost', 'zascita'),
('Blokada motorja', 'varnost', 'zascita'),
('Kodno varovan vzign motorja', 'varnost', 'zascita'),
('Rezervno kolo normalne dimenzije', 'varnost', 'pnevmatike'),
('Run-Flat pnevmatike', 'varnost', 'pnevmatike'),

-- ZUNANJOST
('Roofracks - Strešne sani', 'zunanjost', 'zunanjost_main'),
('Towbar - Vlecna kljuka', 'zunanjost', 'zunanjost_main'),
('Zasenčena stekla', 'zunanjost', 'zunanjost_main'),
('Privacy stekla', 'zunanjost', 'zunanjost_main'),
('Karbon paket zunanj', 'zunanjost', 'zunanjost_main'),
('Športni izpuh', 'zunanjost', 'zunanjost_main'),
('Automatski žarometi', 'zunanjost', 'zunanjost_main'),
('Označevalne luci LED', 'zunanjost', 'zunanjost_main'),

-- GARANCIJA IN STANJE
('Vozilo ima garancio', 'garancija_stanje', 'garancija'),
('Vozilo ima jamstvo', 'garancija_stanje', 'garancija'),
('Vozilo ima oldtimer certifikat', 'garancija_stanje', 'garancija'),
('Servisna knjiga', 'garancija_stanje', 'garancija'),
('Poln servis', 'garancija_stanje', 'garancija'),
('Garažirano', 'garancija_stanje', 'garancija'),
('Brezhibno', 'garancija_stanje', 'garancija'),
('Ne kadi', 'garancija_stanje', 'garancija'),
('Prvi lastnik', 'garancija_stanje', 'garancija'),
('Vozilo je registrirano', 'garancija_stanje', 'registracija'),
('Vozilo je tecnicno pregledano', 'garancija_stanje', 'registracija'),
('Tehnicni pregled velja do', 'garancija_stanje', 'registracija')
ON CONFLICT (name) DO NOTHING;

-- Rename old table and use new one
DROP TABLE IF EXISTS car_features;
ALTER TABLE car_features_new RENAME TO car_features;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_car_features_category ON car_features(category);
CREATE INDEX IF NOT EXISTS idx_car_features_subcategory ON car_features(subcategory);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);

-- ============================================
-- INSERT ALL CAR BRANDS
-- ============================================
INSERT INTO brands (name) VALUES
('Alfa Romeo'),
('Aston Martin'),
('Audi'),
('BMW'),
('Bentley'),
('Bugatti'),
('Buick'),
('Cadillac'),
('Chevrolet'),
('Chrysler'),
('Citroën'),
('Dacia'),
('Daewoo'),
('Daihatsu'),
('Dodge'),
('Ferrari'),
('Fiat'),
('Ford'),
('Geely'),
('GMC'),
('Honda'),
('Hyundai'),
('Infiniti'),
('Isuzu'),
('Iveco'),
('Jaguar'),
('Jeep'),
('Kia'),
('Koenigsegg'),
('Lamborghini'),
('Lancia'),
('Land Rover'),
('Lexus'),
('Lincoln'),
('Lotus'),
('Maserati'),
('Maybach'),
('Mazda'),
('McLaren'),
('Mercedes-Benz'),
('Mini'),
('Mitsubishi'),
('Nissan'),
('Opel'),
('Peugeot'),
('Porsche'),
('Ram'),
('Renault'),
('Rolls-Royce'),
('Saab'),
('Seat'),
('Skoda'),
('Smart'),
('SsangYong'),
('Subaru'),
('Suzuki'),
('Tesla'),
('Toyota'),
('Volkswagen'),
('Volvo'),
-- Bus brands
('MAN'),
('Mercedes-Benz Bus'),
('Setra'),
('Van Hool'),
('Iveco Bus'),
('Solaris'),
('Heuliez'),
('Berkhof'),
('Jonckheere'),
('VDL'),
('BMC'),
('Temsa'),
('Karsan'),
('Benz'),
('King Long'),
('Yutong'),
('Higer'),
('Golden Dragon'),
('SAIC'),
-- Truck/Commercial
('DAF'),
('Scania'),
('Volvo Trucks'),
('MAN Truck'),
('Iveco'),
('Renault Trucks'),
('Mercedes-Benz Trucks'),
('Hyundai Truck'),
('Isuzu Truck'),
('Fuso'),
('UD Trucks'),
-- Van/Minibus
('Mercedes-Benz Sprinter'),
('Volkswagen Transporter'),
('Ford Transit'),
('Renault Master'),
('Iveco Daily'),
('Fiat Ducato'),
('Peugeot Boxer'),
('Citroen Jumper'),
('Opel Movano'),
('Nissan NV'),
('Toyota HiAce'),
('VWV Caravelle'),
('Mercedes-Benz Vito'),
('Ford Custom'),
('Renault Trafic')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- INSERT MODELS FOR POPULAR BRANDS
-- ============================================

-- Function to insert models
DO $$
DECLARE
    b_id INTEGER;
BEGIN
    -- AUDI
    SELECT id INTO b_id FROM brands WHERE name = 'Audi';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'A1'), (b_id, 'A3'), (b_id, 'A4'), (b_id, 'A5'), (b_id, 'A6'), (b_id, 'A7'), (b_id, 'A8'),
        (b_id, 'Q2'), (b_id, 'Q3'), (b_id, 'Q5'), (b_id, 'Q7'), (b_id, 'Q8'),
        (b_id, 'e-tron'), (b_id, 'e-tron GT'), (b_id, 'TT'), (b_id, 'R8')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- BMW
    SELECT id INTO b_id FROM brands WHERE name = 'BMW';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Serija 1'), (b_id, 'Serija 2'), (b_id, 'Serija 3'), (b_id, 'Serija 4'), (b_id, 'Serija 5'), (b_id, 'Serija 6'), (b_id, 'Serija 7'), (b_id, 'Serija 8'),
        (b_id, 'X1'), (b_id, 'X2'), (b_id, 'X3'), (b_id, 'X4'), (b_id, 'X5'), (b_id, 'X6'), (b_id, 'X7'),
        (b_id, 'Z4'), (b_id, 'i3'), (b_id, 'i4'), (b_id, 'i7'), (b_id, 'iX'), (b_id, 'iX3')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Mercedes-Benz
    SELECT id INTO b_id FROM brands WHERE name = 'Mercedes-Benz';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'A-Class'), (b_id, 'B-Class'), (b_id, 'C-Class'), (b_id, 'E-Class'), (b_id, 'S-Class'),
        (b_id, 'CLA'), (b_id, 'CLS'), (b_id, 'GLA'), (b_id, 'GLB'), (b_id, 'GLC'), (b_id, 'GLE'), (b_id, 'GLS'),
        (b_id, 'G-Class'), (b_id, 'AMG GT'), (b_id, 'SL'), (b_id, 'SLC'),
        (b_id, 'EQS'), (b_id, 'EQC'), (b_id, 'EQA'), (b_id, 'EQB'), (b_id, 'EQE'),
        (b_id, 'V-Class'), (b_id, 'Sprinter')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Volkswagen
    SELECT id INTO b_id FROM brands WHERE name = 'Volkswagen';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Polo'), (b_id, 'Golf'), (b_id, 'Passat'), (b_id, 'Arteon'),
        (b_id, 'T-Roc'), (b_id, 'T-Cross'), (b_id, ' Tiguan'), (b_id, 'Touareg'), (b_id, 'Teramont'),
        (b_id, 'Up!'), (b_id, 'Up! GTI'), (b_id, 'Fox'), (b_id, 'Lupo'),
        (b_id, 'Transporter'), (b_id, 'Multivan'), (b_id, 'Caravelle'), (b_id, 'California'),
        (b_id, 'ID.3'), (b_id, 'ID.4'), (b_id, 'ID.5'), (b_id, 'ID.Buzz')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Opel
    SELECT id INTO b_id FROM brands WHERE name = 'Opel';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Corsa'), (b_id, 'Astra'), (b_id, 'Insignia'), (b_id, 'Grandland'), (b_id, 'Crossland'),
        (b_id, 'Mokka'), (b_id, 'Mokka-e'), (b_id, 'Combo'), (b_id, 'Movano'), (b_id, 'Zafira'),
        (b_id, 'Vivaro'), (b_id, 'Zafira Life')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Renault
    SELECT id INTO b_id FROM brands WHERE name = 'Renault';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Twingo'), (b_id, 'Clio'), (b_id, 'Megane'), (b_id, 'Talisman'), (b_id, 'Laguna'),
        (b_id, 'Captur'), (b_id, 'Kadjar'), (b_id, 'Koleos'), (b_id, 'Arkana'),
        (b_id, 'ZOE'), (b_id, 'Megane E-Tech'), (b_id, 'Austral'), (b_id, 'Espace'),
        (b_id, 'Master'), (b_id, 'Trafic'), (b_id, 'Kangoo')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Peugeot
    SELECT id INTO b_id FROM brands WHERE name = 'Peugeot';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, '108'), (b_id, '208'), (b_id, '308'), (b_id, '408'), (b_id, '508'),
        (b_id, '2008'), (b_id, '3008'), (b_id, '5008'),
        (b_id, 'e-208'), (b_id, 'e-2008'), (b_id, 'e-308'),
        (b_id, 'Rifter'), (b_id, 'Partner'), (b_id, 'Expert'), (b_id, 'Boxer'),
        (b_id, '508 PSE'), (b_id, '508 SW')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Ford
    SELECT id INTO b_id FROM brands WHERE name = 'Ford';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Fiesta'), (b_id, 'Focus'), (b_id, 'Mondeo'), (b_id, 'Mustang'),
        (b_id, 'Puma'), (b_id, 'Kuga'), (b_id, 'Explorer'), (b_id, 'Edge'),
        (b_id, 'Bronco'), (b_id, 'Bronco Sport'), (b_id, 'Mustang Mach-E'),
        (b_id, 'Transit'), (b_id, 'Transit Custom'), (b_id, 'Tourneo'), (b_id, 'S-Max'), (b_id, 'Galaxy'),
        (b_id, 'Ranger'), (b_id, 'F-150'), (b_id, 'Maverick')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Toyota
    SELECT id INTO b_id FROM brands WHERE name = 'Toyota';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Aygo'), (b_id, 'Yaris'), (b_id, 'Corolla'), (b_id, 'Camry'), (b_id, 'Prius'),
        (b_id, 'C-HR'), (b_id, 'RAV4'), (b_id, 'Highlander'), (b_id, 'Land Cruiser'), (b_id, 'Sequoia'),
        (b_id, 'Hilux'), (b_id, 'Tacoma'), (b_id, 'Tundra'),
        (b_id, 'Proace'), (b_id, 'Proace City'), (b_id, 'Sienna'),
        (b_id, 'GR Supra'), (b_id, 'GR86'), (b_id, 'GR Yaris'), (b_id, 'Mirai'),
        (b_id, 'bZ4X'), (b_id, 'Urban Cruiser')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Hyundai
    SELECT id INTO b_id FROM brands WHERE name = 'Hyundai';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'i10'), (b_id, 'i20'), (b_id, 'i30'), (b_id, 'i40'), (b_id, 'IONIQ'),
        (b_id, 'Kona'), (b_id, 'Tucson'), (b_id, 'Santa Fe'), (b_id, 'Palisade'),
        (b_id, 'Bayon'), (b_id, 'Nexo'), (b_id, 'Staria'),
        (b_id, 'IONIQ 5'), (b_id, 'IONIQ 6'), (b_id, 'Kona Electric')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Kia
    SELECT id INTO b_id FROM brands WHERE name = 'Kia';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Picanto'), (b_id, 'Rio'), (b_id, 'Ceed'), (b_id, 'K5'), (b_id, 'Stinger'),
        (b_id, 'XCeed'), (b_id, 'Niro'), (b_id, 'Sportage'), (b_id, 'Sorento'), (b_id, 'Telluride'),
        (b_id, 'Soul'), (b_id, 'EV6'), (b_id, 'EV9'), (b_id, 'e-Soul'), (b_id, 'Niro EV'),
        (b_id, 'Carens'), (b_id, 'Carnival')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Skoda
    SELECT id INTO b_id FROM brands WHERE name = 'Skoda';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Citigo'), (b_id, 'Fabia'), (b_id, 'Scala'), (b_id, 'Octavia'), (b_id, 'Superb'),
        (b_id, 'Kamiq'), (b_id, 'Karoq'), (b_id, 'Kodiaq'), (b_id, 'Enyaq'),
        (b_id, 'Rapid'), (b_id, 'Yeti')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Seat
    SELECT id INTO b_id FROM brands WHERE name = 'Seat';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Mii'), (b_id, 'Ibiza'), (b_id, 'Leon'), (b_id, 'Ateca'), (b_id, 'Tarraco'), (b_id, 'Ateca FR'),
        (b_id, 'Cupra Formentor'), (b_id, 'Cupra Leon'), (b_id, 'Born')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Fiat
    SELECT id INTO b_id FROM brands WHERE name = 'Fiat';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, '500'), (b_id, '500L'), (b_id, '500X'), (b_id, '500e'),
        (b_id, 'Panda'), (b_id, 'Tipo'), (b_id, '500L'), (b_id, 'Punto'), (b_id, 'Doblo'),
        (b_id, ' Ducato'), (b_id, 'Talento'), (b_id, 'Scudo'),
        (b_id, '124 Spider'), (b_id, '595 Abarth'), (b_id, 'Panda Hybrid')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Honda
    SELECT id INTO b_id FROM brands WHERE name = 'Honda';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Jazz'), (b_id, 'Civic'), (b_id, 'Accord'), (b_id, 'HR-V'), (b_id, 'CR-V'),
        (b_id, 'Pilot'), (b_id, 'Ridgeline'), (b_id, 'Passport'), (b_id, 'Odyssey'),
        (b_id, 'e:Ny1'), (b_id, 'e:N1'), (b_id, 'Civic Type R'), (b_id, 'ZR-V')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Nissan
    SELECT id INTO b_id FROM brands WHERE name = 'Nissan';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Micra'), (b_id, 'Note'), (b_id, 'Leaf'), (b_id, 'Juke'), (b_id, 'Qashqai'), (b_id, 'X-Trail'),
        (b_id, 'Ariya'), (b_id, 'Navara'), (b_id, 'Pathfinder'), (b_id, 'Patrol'), (b_id, 'Armada'),
        (b_id, '370Z'), (b_id, 'GT-R'), (b_id, 'Z'), (b_id, 'Townstar')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Mazda
    SELECT id INTO b_id FROM brands WHERE name = 'Mazda';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Mazda2'), (b_id, 'Mazda3'), (b_id, 'Mazda6'), (b_id, 'MX-30'),
        (b_id, 'CX-3'), (b_id, 'CX-30'), (b_id, 'CX-5'), (b_id, 'CX-50'), (b_id, 'CX-60'), (b_id, 'CX-90'),
        (b_id, 'MX-5'), (b_id, 'MX-5 RF')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Porsche
    SELECT id INTO b_id FROM brands WHERE name = 'Porsche';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, '911'), (b_id, '718 Cayman'), (b_id, '718 Boxster'), (b_id, 'Panamera'),
        (b_id, 'Cayenne'), (b_id, 'Macan'), (b_id, 'Taycan'), (b_id, '911 GT3'), (b_id, '911 Turbo')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Volvo
    SELECT id INTO b_id FROM brands WHERE name = 'Volvo';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'XC40'), (b_id, 'XC60'), (b_id, 'XC90'), (b_id, 'XC40 Recharge'),
        (b_id, 'S60'), (b_id, 'S90'), (b_id, 'V60'), (b_id, 'V90'), (b_id, 'V60 Cross Country'),
        (b_id, 'C40'), (b_id, 'EX30'), (b_id, 'EX90')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Tesla
    SELECT id INTO b_id FROM brands WHERE name = 'Tesla';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Model S'), (b_id, 'Model 3'), (b_id, 'Model X'), (b_id, 'Model Y'),
        (b_id, 'Cybertruck'), (b_id, 'Roadster'), (b_id, 'Semi')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Jaguar
    SELECT id INTO b_id FROM brands WHERE name = 'Jaguar';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'XE'), (b_id, 'XF'), (b_id, 'F-Type'), (b_id, 'E-Pace'), (b_id, 'F-Pace'), (b_id, 'I-Pace')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Land Rover
    SELECT id INTO b_id FROM brands WHERE name = 'Land Rover';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Defender'), (b_id, 'Discovery'), (b_id, 'Discovery Sport'), (b_id, 'Range Rover'),
        (b_id, 'Range Rover Sport'), (b_id, 'Range Rover Velar'), (b_id, 'Range Rover Evoque'),
        (b_id, 'Defender 90'), (b_id, 'Defender 110'), (b_id, 'Defender 130')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- MINI
    SELECT id INTO b_id FROM brands WHERE name = 'Mini';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Cooper'), (b_id, 'Cooper S'), (b_id, 'Clubman'), (b_id, 'Countryman'),
        (b_id, 'Electric'), (b_id, 'John Cooper Works'), (b_id, 'Clubman JCW'), (b_id, 'Countryman JCW'),
        (b_id, 'Convertible'), (b_id, 'Paceman')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Subaru
    SELECT id INTO b_id FROM brands WHERE name = 'Subaru';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Impreza'), (b_id, 'Legacy'), (b_id, 'Outback'), (b_id, 'Forester'), (b_id, 'XV'),
        (b_id, 'Solterra'), (b_id, 'WRX'), (b_id, 'WRX STI'), (b_id, 'BRZ'), (b_id, 'Levorg')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Suzuki
    SELECT id INTO b_id FROM brands WHERE name = 'Suzuki';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Swift'), (b_id, 'Baleno'), (b_id, 'Liana'), (b_id, 'Ciaz'), (b_id, 'Alto'),
        (b_id, 'Vitara'), (b_id, 'S-Cross'), (b_id, 'Across'), (b_id, 'Swace'),
        (b_id, 'Jimny'), (b_id, 'Ignis'), (b_id, 'Vitara'), (b_id, 'e Vitara')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Mitsubishi
    SELECT id INTO b_id FROM brands WHERE name = 'Mitsubishi';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Space Star'), (b_id, 'Mirage'), (b_id, 'Attrage'), (b_id, 'Lancer'), (b_id, 'Galant'),
        (b_id, 'ASX'), (b_id, 'Eclipse Cross'), (b_id, 'Outlander'), (b_id, 'Pajero'), (b_id, 'Pajero Sport'),
        (b_id, 'L200'), (b_id, 'Triton'), (b_id, 'i-MiEV')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Jeep
    SELECT id INTO b_id FROM brands WHERE name = 'Jeep';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Renegade'), (b_id, 'Compass'), (b_id, 'Cherokee'), (b_id, 'Grand Cherokee'), (b_id, 'Wrangler'),
        (b_id, 'Gladiator'), (b_id, 'Wagoneer'), (b_id, 'Grand Wagoneer'), (b_id, 'Avenger')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Lexus
    SELECT id INTO b_id FROM brands WHERE name = 'Lexus';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'CT'), (b_id, 'IS'), (b_id, 'ES'), (b_id, 'GS'), (b_id, 'LS'),
        (b_id, 'UX'), (b_id, 'NX'), (b_id, 'RX'), (b_id, 'GX'), (b_id, 'LX'),
        (b_id, 'RZ'), (b_id, 'LFA'), (b_id, 'RC'), (b_id, 'LC'), (b_id, 'NX PHEV')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Chevrolet
    SELECT id INTO b_id FROM brands WHERE name = 'Chevrolet';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Spark'), (b_id, 'Beat'), (b_id, 'Sonic'), (b_id, 'Cruze'), (b_id, 'Malibu'),
        (b_id, 'Trax'), (b_id, 'Equinox'), (b_id, 'Blazer'), (b_id, 'Traverse'), (b_id, 'Tahoe'), (b_id, 'Suburban'),
        (b_id, 'Camaro'), (b_id, 'Corvette'), (b_id, 'Bolt'), (b_id, 'Bolt EUV'), (b_id, 'Colorado'), (b_id, 'Silverado')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Dodge
    SELECT id INTO b_id FROM brands WHERE name = 'Dodge';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Journey'), (b_id, 'Avenger'), (b_id, 'Challenger'), (b_id, 'Charger'), (b_id, 'Durango'),
        (b_id, 'Hornet'), (b_id, 'Charger SRT'), (b_id, 'Challenger SRT'), (b_id, 'Viper'), (b_id, 'Ram 1500')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Chrysler
    SELECT id INTO b_id FROM brands WHERE name = 'Chrysler';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, '300'), (b_id, 'Pacifica'), (b_id, 'Voyager'), (b_id, '200'), (b_id, 'Sebring')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Cadillac
    SELECT id INTO b_id FROM brands WHERE name = 'Cadillac';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'CT4'), (b_id, 'CT5'), (b_id, 'Escalade'), (b_id, 'XT4'), (b_id, 'XT5'), (b_id, 'XT6'),
        (b_id, 'Lyriq'), (b_id, 'Celestiq'), (b_id, 'CT4-V'), (b_id, 'CT5-V'), (b_id, 'Escalade-V')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
    -- Infiniti
    SELECT id INTO b_id FROM brands WHERE name = 'Infiniti';
    IF b_id IS NOT NULL THEN
        INSERT INTO models (brand_id, name) VALUES
        (b_id, 'Q50'), (b_id, 'Q60'), (b_id, 'Q70'), (b_id, 'QX30'), (b_id, 'QX50'), (b_id, 'QX55'), (b_id, 'QX60'), (b_id, 'QX80')
        ON CONFLICT (brand_id, name) DO NOTHING;
    END IF;
    
END $$;

-- ============================================
-- Function to update cars table with all data
-- ============================================
CREATE OR REPLACE FUNCTION sync_car_data()
RETURNS void AS $$
BEGIN
    -- This function will be called from API to sync data
    RAISE NOTICE 'Car data sync initiated';
END;
$$ LANGUAGE plpgsql;
