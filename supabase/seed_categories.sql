
-- Seed 16 Main Numismatic Categories with proper slugs and descriptions

INSERT INTO public.coin_categories (slug, name, description)
VALUES 
('ancient-india', 'Ancient India', 'Punch-marked coins, Janapadas, and early kingdoms (600 BC - 300 AD)'),
('mughal', 'Mughal Empire', 'Coins from Babur to Bahadur Shah Zafar, featuring intricate calligraphy'),
('sultanate', 'Delhi Sultanate', 'Coins of the five dynasties: Mamluk, Khilji, Tughlaq, Sayyid, and Lodi'),
('british-india', 'British India', 'East India Company and British Raj coinage (1835-1947)'),
('princely-states', 'Princely States', 'Coins issued by autonomous Indian states like Hyderabad, Kutch, and Travancore'),
('republic-india', 'Republic India', 'Post-independence coinage from 1950 onwards, including commemorative issues'),
('gupta', 'Gupta Empire', 'The Golden Age of Indian Numismatics - Gold Dinars and silver coins'),
('maratha', 'Maratha Confederacy', 'Coins of the Chhatrapatis and Peshwas'),
('medieval-south', 'Medieval South', 'Coins of Cholas, Pandyas, Cheras, and Vijayanagara Empire'),
('kushan', 'Kushan Empire', 'Gold and Copper coinage influenced by Greek and Indian styles'),
('colonial-portuguese', 'Portuguese India', 'Indo-Portuguese issues from Goa, Daman, and Diu'),
('colonial-french', 'French India', 'Coins from Pondicherry, Karaikal, and Mahe'),
('colonial-dutch', 'Dutch India', 'VOC coinage from settlements like Negapatam and Cochin'),
('indo-greek', 'Indo-Greek', 'Hellenistic influence on Indian coinage'),
('tribal', 'Tribal Coinage', 'Issues of ancient tribal republics like Yaudheyas and Malavas'),
('foreign-misc', 'Foreign Misc', 'Other significant foreign coins found or used in Indian history')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;
