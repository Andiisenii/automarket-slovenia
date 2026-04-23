-- ============================================
-- STEP 1: Shto kolonën category në tabelat
-- ============================================

ALTER TABLE brands ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE body_types ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- ============================================
-- STEP 2: Fshi të dhënat ekzistuese motor
-- ============================================

DELETE FROM brands WHERE category = 'motor';
DELETE FROM body_types WHERE category = 'motor';

-- ============================================
-- STEP 3: Moto Brands (107 brands)
-- ============================================

INSERT INTO brands (name, category) VALUES
('Aprilia', 'motor'), ('BMW', 'motor'), ('Ducati', 'motor'), ('Harley-Davidson', 'motor'),
('Honda', 'motor'), ('Kawasaki', 'motor'), ('KTM', 'motor'), ('Suzuki', 'motor'),
('Triumph', 'motor'), ('Yamaha', 'motor'),
('Aeon', 'motor'), ('AJP', 'motor'), ('AJS', 'motor'), ('Apollo Motors', 'motor'),
('Asiawing', 'motor'), ('Barton', 'motor'), ('Bashan', 'motor'), ('Benda', 'motor'),
('Benelli', 'motor'), ('Beta', 'motor'), ('Bimota', 'motor'), ('Brixton', 'motor'),
('BRUT-X', 'motor'), ('Bucci Moto', 'motor'), ('Buell', 'motor'), ('Cagiva', 'motor'),
('Can-Am', 'motor'), ('CF Moto', 'motor'), ('CPI', 'motor'), ('Custom', 'motor'),
('ČZ', 'motor'), ('Daelim', 'motor'), ('Derbi', 'motor'), ('Dnepr', 'motor'),
('DKW', 'motor'), ('Dream Pitbikes', 'motor'), ('Ebroh', 'motor'), ('E Ride', 'motor'),
('EM', 'motor'), ('Energica', 'motor'), ('Enfield', 'motor'), ('Fantic', 'motor'),
('FB Mondial', 'motor'), ('FYM', 'motor'), ('Garelli', 'motor'), ('Generic', 'motor'),
('GasGas', 'motor'), ('Giantco', 'motor'), ('Gilera', 'motor'), ('GunShot', 'motor'),
('Hengjian', 'motor'), ('HM Moto', 'motor'), ('Horwin', 'motor'), ('Husaberg', 'motor'),
('Husqvarna', 'motor'), ('Hyosung', 'motor'), ('Indian', 'motor'), ('Italjet', 'motor'),
('Jawa', 'motor'), ('Jiajue', 'motor'), ('Jinlun', 'motor'), ('Junak', 'motor'),
('K-Sport', 'motor'), ('Kangchao', 'motor'), ('Kayo', 'motor'), ('KeeWay', 'motor'),
('Kinroad', 'motor'), ('KL Motors', 'motor'), ('Kove', 'motor'), ('Kreidler', 'motor'),
('KSR Moto', 'motor'), ('Kuberg', 'motor'), ('Kymco', 'motor'), ('Laverda', 'motor'),
('LEM', 'motor'), ('Leonart', 'motor'), ('Longjia', 'motor'), ('Mac Motorcycles', 'motor'),
('Macbor', 'motor'), ('Maico', 'motor'), ('Malaguti', 'motor'), ('Marshal', 'motor'),
('Mash', 'motor'), ('Mecatecno', 'motor'), ('Morbidelli', 'motor'), ('Motobi', 'motor'),
('Montesa', 'motor'), ('MotoGuzzi', 'motor'), ('Moto Morini', 'motor'), ('Motor Union', 'motor'),
('Motowell', 'motor'), ('Motron', 'motor'), ('MV Agusta', 'motor'), ('MZ', 'motor'),
('Norton', 'motor'), ('NSU', 'motor'), ('Ohvale', 'motor'), ('Oldtimer', 'motor'),
('Oset', 'motor'), ('Palmo', 'motor'), ('Peugeot', 'motor'), ('Phelon & Moore', 'motor'),
('Pioneer', 'motor'), ('Pitbikes', 'motor'), ('Pitsterpro', 'motor'), ('Polaris', 'motor'),
('Puch', 'motor'), ('Qingqi', 'motor'), ('QJMotor', 'motor'), ('Qulbix', 'motor'),
('Regal Raptor', 'motor'), ('Rieju', 'motor'), ('Romet', 'motor'), ('Royal Enfield', 'motor'),
('Sachs', 'motor'), ('Sarolea', 'motor'), ('SCZ', 'motor'), ('Sherco', 'motor'),
('Shineray', 'motor'), ('SiaMoto', 'motor'), ('Skygo', 'motor'), ('Skyteam', 'motor'),
('Stallions', 'motor'), ('Stark', 'motor'), ('Stomp', 'motor'), ('Super soco', 'motor'),
('Surron', 'motor'), ('SWM', 'motor'), ('Sym', 'motor'), ('Talaria', 'motor'),
('Thumpstar', 'motor'), ('Tinbot', 'motor'), ('TM Racing', 'motor'), ('TMS', 'motor'),
('Tomos', 'motor'), ('Torrot', 'motor'), ('Trike', 'motor'), ('Triton', 'motor'),
('Tromox', 'motor'), ('TRS', 'motor'), ('UM', 'motor'), ('Ural', 'motor'),
('Urbet', 'motor'), ('Velocifero', 'motor'), ('Vent', 'motor'), ('Victory', 'motor'),
('Vins', 'motor'), ('Voge', 'motor'), ('VOR', 'motor'), ('Wottan Motor', 'motor'),
('Xingyue', 'motor'), ('Xinling', 'motor'), ('Xmotos', 'motor'), ('YCF', 'motor'),
('Yiying', 'motor'), ('Zero', 'motor'), ('Zongshen', 'motor'), ('Zontes', 'motor'),
('Zhongyu', 'motor'), ('Ztech', 'motor'), ('Zundapp', 'motor'), ('MOTO', 'motor')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 4: Moto Body Types
-- ============================================

INSERT INTO body_types (name, category) VALUES
('Sport', 'motor'), ('Chopper', 'motor'), ('Tourer', 'motor'),
('Naked bike', 'motor'), ('Enduro', 'motor'), ('Supermoto', 'motor'),
('Trial', 'motor'), ('Cross', 'motor')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 5: Verifiko
-- ============================================

SELECT 'Brands Moto:', COUNT(*) FROM brands WHERE category = 'motor';
SELECT 'Body Types Moto:', COUNT(*) FROM body_types WHERE category = 'motor';
