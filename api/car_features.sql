-- AutoMarket Slovenia - Car Features Table
-- Run this in Supabase SQL Editor

-- Car features table (dropdown/checklist options)
CREATE TABLE IF NOT EXISTS car_features (
    id SERIAL PRIMARY KEY,
    name_sl VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    icon VARCHAR(100) DEFAULT 'check',
    category VARCHAR(100) DEFAULT 'other',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Car features junction table (many-to-many)
CREATE TABLE IF NOT EXISTS car_feature_assignments (
    car_id INT REFERENCES cars(id) ON DELETE CASCADE,
    feature_id INT REFERENCES car_features(id) ON DELETE CASCADE,
    PRIMARY KEY (car_id, feature_id)
);

-- Insert comprehensive car features
INSERT INTO car_features (name_sl, name_en, icon, category) VALUES
-- Safety (Varnost)
('Airbag - voznik', 'Airbag - driver', 'shield', 'safety'),
('Airbag - sopotnik', 'Airbag - passenger', 'shield', 'safety'),
('Airbag - stranski', 'Side airbag', 'shield', 'safety'),
('Airbag - zavese', 'Curtain airbag', 'shield', 'safety'),
('ABS', 'ABS', 'circle', 'safety'),
('ESP', 'ESP', 'activity', 'safety'),
('ASR', 'ASR (traction control)', 'sliders', 'safety'),
('D SR', 'D SRC', 'alert-circle', 'safety'),
('Zavora za pomoč pri zaviranju', 'Brake assist', 'anchor', 'safety'),
('Sistem za nadzor mrtvega kota', 'Blind spot monitoring', 'eye', 'safety'),
('Sistem za ohranjanje voznega pasu', 'Lane keep assist', 'git-branch', 'safety'),
('Sistem za zaznavanje utrujenosti', 'Fatigue detection', 'alert-triangle', 'safety'),
('Sistem za preprečevanje trčenja', 'Collision prevention', 'alert-octagon', 'safety'),
('Parkirni senzorji - spredaj', 'Parking sensors - front', 'map-pin', 'safety'),
('Parkirni senzorji - zadaj', 'Parking sensors - rear', 'map-pin', 'safety'),
('Parkirna kamera', 'Parking camera', 'video', 'safety'),
('360° kamera', '360° camera', 'aperture', 'safety'),
('Tempomat', 'Cruise control', 'gauge', 'safety'),
('Adaptivni tempomat', 'Adaptive cruise control', 'gauge', 'safety'),

-- Comfort (Udobje)
('Klimatska naprava', 'Air conditioning', 'thermometer', 'comfort'),
('Avtomatska klimatska naprava', 'Automatic climate control', 'thermometer', 'comfort'),
('Dvo conska klimatska naprava', 'Dual zone climate control', 'thermometer', 'comfort'),
('Štiri conska klimatska naprava', 'Four zone climate control', 'thermometer', 'comfort'),
('Grete sedežev', 'Heated seats', 'heart', 'comfort'),
('Grete sedežev - spredaj', 'Heated front seats', 'heart', 'comfort'),
('Grete sedežev - zadaj', 'Heated rear seats', 'heart', 'comfort'),
('Grete volanskega obroča', 'Heated steering wheel', 'circle', 'comfort'),
('Ventralni sedež', 'Ventilated seats', 'wind', 'comfort'),
('Električno nastavljivi sedeži', 'Electric seats adjustment', 'zap', 'comfort'),
('Sedeži z pomnilnikom', 'Memory seats', 'save', 'comfort'),
('Maserski sedeži', 'Massage seats', 'heart', 'comfort'),
('Električno odpiranje prtljažnika', 'Electric tailgate', 'package', 'comfort'),
('Panoramska streha', 'Panoramic sunroof', 'sun', 'comfort'),
('Strešno okno', 'Sunroof', 'cloud', 'comfort'),
('Soft close vrata', 'Soft close doors', 'door-closed', 'comfort'),
('Keyless entry', 'Keyless entry', 'key', 'comfort'),
('Keyless go', 'Keyless go', 'log-in', 'comfort'),
('Električno zložljiva ogledala', 'Electric folding mirrors', 'square', 'comfort'),
('Ogrevana ogledala', 'Heated mirrors', 'thermometer', 'comfort'),
('Samodejna zatemnitev ogledal', 'Auto-dimming mirrors', 'moon', 'comfort'),
('Senčnik', 'Sunshade', 'cloud', 'comfort'),
('Ambientna osvetlitev', 'Ambient lighting', 'sun', 'comfort'),
('Notranji ambient - več barv', 'Multi-color ambient lighting', 'palette', 'comfort'),

-- Technology (Tehnologija)
('USB vhod', 'USB input', 'smartphone', 'technology'),
('USB-C vhod', 'USB-C input', 'smartphone', 'technology'),
('Bluetooth', 'Bluetooth', 'bluetooth', 'technology'),
('Apple CarPlay', 'Apple CarPlay', 'smartphone', 'technology'),
('Android Auto', 'Android Auto', 'smartphone', 'technology'),
('Brezžično polnjenje', 'Wireless charging', 'zap', 'technology'),
('Premium zvočni sistem', 'Premium audio system', 'volume-2', 'technology'),
('Harman Kardon zvočniki', 'Harman Kardon speakers', 'volume-2', 'technology'),
('DAB radio', 'DAB radio', 'radio', 'technology'),
('Navigacijski sistem', 'Navigation system', 'navigation', 'technology'),
('Head-up display', 'Head-up display', 'monitor', 'technology'),
('Digitalna instrumentna plošča', 'Digital instrument cluster', 'monitor', 'technology'),
('Touchscreen zaslon', 'Touchscreen display', 'tablet', 'technology'),
('Wi-Fi hotspot', 'Wi-Fi hotspot', 'wifi', 'technology'),
('Povezava z aplikacijo', 'App connectivity', 'smartphone', 'technology'),
('Pomoč pri speljevanju v klanec', 'Hill start assist', 'trending-up', 'technology'),
('Sistem Start-Stop', 'Start-Stop system', 'power', 'technology'),

-- Exterior (Zunanjost)
('Aluminijasta platišča', 'Alloy wheels', 'circle', 'exterior'),
('LED žarometi', 'LED headlights', 'sun', 'exterior'),
('Matrix LED žarometi', 'Matrix LED headlights', 'sun', 'exterior'),
('Xenon žarometi', 'Xenon headlights', 'sun', 'exterior'),
('Pragovi v barvi karoserije', 'Color-coded sills', 'square', 'exterior'),
('Športno podvozje', 'Sports suspension', 'settings', 'exterior'),
('Zračno podvozje', 'Air suspension', 'wind', 'exterior'),
('Adaptivno podvozje', 'Adaptive suspension', 'sliders', 'exterior'),
('Znižano podvozje', 'Lowered suspension', 'arrow-down', 'exterior'),
('Roofracks', 'Roof rails', 'minus', 'exterior'),
('Towbar', 'Towbar', 'anchor', 'exterior'),
('Zasenčena stekla', 'Tinted windows', 'moon', 'exterior'),
('Privacy stekla', 'Privacy glass', 'shield', 'exterior'),
('Karbon paket', 'Carbon package', 'hexagon', 'exterior'),
('Športni izpuh', 'Sport exhaust', 'music', 'exterior'),
('Bi-Xenon žarometi', 'Bi-Xenon headlights', 'sun', 'exterior'),
('Automatski žarometi', 'Auto headlights', 'sun', 'exterior'),
('Označevalne luči LED', 'LED DRL', 'sun', 'exterior'),

-- Interior (Notranjost)
('Usnjeni sedeži', 'Leather seats', 'square', 'interior'),
('Delno usnjeni sedeži', 'Partial leather seats', 'square', 'interior'),
('Alcantara sedeži', 'Alcantara seats', 'square', 'interior'),
('Športni sedeži', 'Sport seats', 'target', 'interior'),
('Električno nastavljiv volan', 'Electric steering wheel adjustment', 'zap', 'interior'),
('Volan v perforiranem usnju', 'Perforated leather steering wheel', 'circle', 'interior'),
('Aluminijaste pedalne obloge', 'Aluminum pedals', 'triangle', 'interior'),
('Obloga vrat - les', 'Wood trim', 'square', 'interior'),
('Obloga vrat - aluminij', 'Aluminum trim', 'square', 'interior'),
('Obloga vrat - karbon', 'Carbon trim', 'hexagon', 'interior'),
('Delilnik vrat - les', 'Wood door trim', 'square', 'interior'),
('Delilnik vrat - aluminij', 'Aluminum door trim', 'square', 'interior'),
('Predpražniki - velur', 'Velour floor mats', 'grid', 'interior'),
('Predpražniki - guma', 'Rubber floor mats', 'grid', 'interior'),
('Prtljažnik - tali', 'Flat boot floor', 'square', 'interior'),
('Prtljažnik - delilnik', 'Boot partition', 'grid', 'interior'),
('Sklopiva klop 60/40', 'Folding rear bench 60/40', 'minimize-2', 'interior'),
('Sklopiva klop 40/20/40', 'Folding rear bench 40/20/40', 'grid', 'interior'),
('Sredinská konzola - hladilnik', 'Cooled center console', 'thermometer', 'interior'),
('Sredinska konzola - ogrevanje', 'Heated center console', 'thermometer', 'interior'),

-- Seats (Sedeži)
('Sedežev: 2', 'Seats: 2', 'users', 'seats'),
('Sedežev: 4', 'Seats: 4', 'users', 'seats'),
('Sedežev: 5', 'Seats: 5', 'users', 'seats'),
('Sedežev: 5+2', 'Seats: 5+2', 'users', 'seats'),
('Sedežev: 7', 'Seats: 7', 'users', 'seats'),
('Sedežev: 8', 'Seats: 8', 'users', 'seats'),
('Sedeži za otroke - ISOFIX', 'Child seats - ISOFIX', 'anchor', 'seats'),
('Sedeži za otroke - Top tether', 'Child seats - Top tether', 'anchor', 'seats'),

-- Doors (Vrata)
('Vrat: 2', 'Doors: 2', 'door-closed', 'doors'),
('Vrat: 3', 'Doors: 3', 'door-closed', 'doors'),
('Vrat: 4', 'Doors: 4', 'door-closed', 'doors'),
('Vrat: 5', 'Doors: 5', 'door-closed', 'doors'),

-- Fuel/Efficiency (Gorivo/Izplen)
('Start Stop sistem', 'Start Stop system', 'power', 'efficiency'),
('Rekuperacija zavorne energije', 'Brake energy recovery', 'refresh-cw', 'efficiency'),
('Nizke emisije', 'Low emissions', 'leaf', 'efficiency'),
('Euro 6', 'Euro 6', 'award', 'efficiency'),
('CO2: manj kot 100 g/km', 'CO2: less than 100 g/km', 'cloud', 'efficiency'),
('CO2: manj kot 50 g/km', 'CO2: less than 50 g/km', 'cloud', 'efficiency'),
('Električni doseg: nad 300 km', 'Electric range: over 300 km', 'battery', 'efficiency'),
('Hibridni vtič', 'Plug-in hybrid', 'plug', 'efficiency'),

-- Other (Ostalo)
('Garažirano', 'Garaged', 'home', 'other'),
('Brezhibno', 'Impeccable condition', 'award', 'other'),
('Servisna knjiga', 'Service book', 'book', 'other'),
('Polnavto', 'Full service history', 'file-text', 'other'),
('Ne kadi', 'Non-smoker', 'heart', 'other'),
('Prvi lastnik', 'First owner', 'user', 'other'),
('Vozilo je registrirano', 'Vehicle registered', 'check-circle', 'other'),
('Vozilo je tehnično pregledano', 'Vehicle inspected', 'check-circle', 'other'),
('Možna menjava', 'Exchange possible', 'repeat', 'other'),
('Možno financiranje', 'Financing possible', 'credit-card', 'other'),
('Možna dostava', 'Delivery possible', 'truck', 'other'),
('Test vozila možen', 'Test drive possible', 'play', 'other');

-- Add feature_ids column to cars table if not exists (for storing selected features as JSON array)
ALTER TABLE cars ADD COLUMN IF NOT EXISTS feature_ids JSONB DEFAULT '[]'::jsonb;

-- Create index for faster feature queries
CREATE INDEX IF NOT EXISTS idx_car_feature_assignments_car_id ON car_feature_assignments(car_id);
CREATE INDEX IF NOT EXISTS idx_car_feature_assignments_feature_id ON car_feature_assignments(feature_id);
CREATE INDEX IF NOT EXISTS idx_cars_feature_ids ON cars USING GIN (feature_ids);
CREATE INDEX IF NOT EXISTS idx_car_features_category ON car_features(category);
CREATE INDEX IF NOT EXISTS idx_car_features_active ON car_features(is_active);
