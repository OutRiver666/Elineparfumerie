-- ====================================================================
-- ELINE PARFUMERIE - SEED DATA (FAMILIES, COLLECTIONS, PERFUMES, VARIANTS, PACKS, WILAYAS, INVENTORY)
-- ====================================================================

-- 1. FRAGRANCE FAMILIES
INSERT INTO fragrance_families (id, slug, name_fr, name_ar, description_fr, description_ar)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'boise-oriental', 'Boisé Oriental', 'خشبي شرقي', 'Notes riches de bois précieux, oud, résines chaudes et épices nobles.', 'نفحات فاخرة من الأخشاب الثمينة والعود والعنبر والتوابل النبيلة.'),
    ('22222222-2222-2222-2222-222222222222', 'boise-cuire', 'Boisé Cuiré', 'خشبي جلدي', 'Accords de cuir tanné, de cèdre et de santal pour un caractère affirmé.', 'أكوردات جلدية مميزة ممتزجة بأخشاب الأرز والصندل لهيبة لا تُضاهى.'),
    ('33333333-3333-3333-3333-333333333333', 'floral-lumineux', 'Floral Lumineux', 'زهري مشرق', 'Bouquet soyeux de roses de mai, de jasmin et de pivoines éclatantes.', 'باقة مخملية من الورد الجوري والياسمين والبيوني لإشراقة أنثوية ساحرة.'),
    ('44444444-4444-4444-4444-444444444444', 'oriental-gourmand', 'Oriental Gourmand', 'شرقي دافئ', 'Vanille noire, fève tonka, ambre et touches d''épices enveloppantes.', 'فانيليا سوداء وتونكا وعنبر شرقي دافئ يغمر الحواس بجاذبية تدوم طويلاً.'),
    ('55555555-5555-5555-5555-555555555555', 'frais-hesperide', 'Frais Hespéridé', 'حمضي منعش', 'Explosion vivifiante d''agrumes méditerranéens, de bergamote et de néroli.', 'انتعاش نقي من حمضيات البحر الأبيض المتوسط وزهر البرتقال والنيرولي.')
ON CONFLICT (slug) DO UPDATE
SET name_fr = EXCLUDED.name_fr, name_ar = EXCLUDED.name_ar;

-- 2. COLLECTIONS
INSERT INTO collections (id, slug, name_fr, name_ar, description_fr, description_ar, image_url, sort_order)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'orientale', 'Collection Orientale', 'المجموعة الشرقية', 'Une célébration des essences sacrées d''Orient, d''ambre gris et de bois d''agar.', 'احتفاء بنفحات الشرق الخالدة، العنبر الطبيعي وخشب العود الملكي.', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200', 1),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'florale', 'Collection Florale Prestige', 'مجموعة الزهور الفاخرة', 'Des floraux soyeux distillés selon la tradition de la haute parfumerie.', 'عطور زهرية مخملية نقية مُستخلصة بأعلى معايير صناعة العطور الراقية.', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200', 2),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'boisee', 'Collection Boisée Noble', 'مجموعة الأخشاب النبيلة', 'Santal blanc, cèdre de l''Atlas et vétiver intense pour une présence inoubliable.', 'صندل نقي وخشب الأرز الأطلسي مع نجيل الهند لثبات وحضور لا يُنسى.', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200', 3)
ON CONFLICT (slug) DO UPDATE
SET name_fr = EXCLUDED.name_fr, name_ar = EXCLUDED.name_ar;

-- 3. PRODUCTS
INSERT INTO products (
    id, slug, name_fr, name_ar, description_fr, description_ar, 
    gender, seasons, fragrance_family_id, classification,
    top_notes_fr, top_notes_ar, heart_notes_fr, heart_notes_ar, base_notes_fr, base_notes_ar,
    images, is_featured, is_bestseller, is_published
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'oud-royal',
    'Oud Royal',
    'عود ملكي',
    'Un accord majestueux de bois d''agar précieux, rehaussé de safran pourpre et d''ambre gris. Notre création la plus convoitée.',
    'توليفة ملكية مهيبة من العود الكمبودي النادر، مع خيوط الزعفران القرمزي ونفحات العنبر الأصيل. عطر الفخامة الأول.',
    'unisex',
    ARRAY['autumn', 'winter'],
    '11111111-1111-1111-1111-111111111111',
    'X8',
    ARRAY['Safran pourpre', 'Cardamome verte', 'Bergamote de Calabre'],
    ARRAY['زعفران قرمزي', 'هيل أخضر', 'برغموت كالابريا'],
    ARRAY['Oud cambodgien pur', 'Rose de Damas', 'Encens royal'],
    ARRAY['عود كمبودي نقي', 'ورد دمشقي', 'بخور ملكي'],
    ARRAY['Ambre gris', 'Cuir souple', 'Santal blanc'],
    ARRAY['عنبر أصيل', 'جلد ناعم', 'صندل أبيض'],
    ARRAY[
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000'
    ],
    true, true, true
),
(
    '10000000-0000-0000-0000-000000000002',
    'imperial-santal',
    'Imperial Santal',
    'صندل إمبراطوري',
    'L''élégance brute du santal australien alliée au poivre noir et à la fève tonka torréfiée. Puissant et magnétique.',
    'هيبة الصندل الأسترالي النقي مع حبات الفلفل الأسود ونفحات التونكا المحمصة. عطر رجالي حاسم وجذاب.',
    'men',
    ARRAY['autumn', 'winter', 'spring'],
    '22222222-2222-2222-2222-222222222222',
    'X4',
    ARRAY['Poivre noir de Madagascar', 'Mandarine d''Italie'],
    ARRAY['فلفل أسود مدغشقري', 'يوسفي إيطالي'],
    ARRAY['Santal blanc crémeux', 'Cèdre de Virginie', 'Muscade'],
    ARRAY['صندل كريمي', 'أرز فرجينيا', 'جوزة الطيب'],
    ARRAY['Fève tonka torréfiée', 'Musc ambré', 'Vétiver'],
    ARRAY['فول تونكا محمص', 'مسك عنبري', 'نجيل الهند'],
    ARRAY[
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000'
    ],
    true, true, true
),
(
    '10000000-0000-0000-0000-000000000003',
    'fleur-de-soie',
    'Fleur de Soie',
    'زهرة الحرير',
    'Un voile aérien de pivoine impériale, de litchi juteux et de musc blanc. La féminité dans son expression la plus pure.',
    'وشاح حريري ناعم من البيوني الإمبراطوري، الليتشي العصيري والمسك الأبيض الصافي. الأنوثة في أسمى تجلياتها.',
    'women',
    ARRAY['spring', 'summer'],
    '33333333-3333-3333-3333-333333333333',
    'standard',
    ARRAY['Litchi givré', 'Pétales de pivoine', 'Poire Williams'],
    ARRAY['ليتشي مثلج', 'بتلات البيوني', 'كمثرى ويليامز'],
    ARRAY['Rose de mai', 'Magnolia blanc', 'Freesia'],
    ARRAY['ورد الجوري', 'ماغنوليا بيضاء', 'فريزيا'],
    ARRAY['Musc blanc soyeux', 'Bois blanc', 'Ambroxan'],
    ARRAY['مسك حريري أبيض', 'خشب ناعم', 'أمبروكسان'],
    ARRAY[
        'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000'
    ],
    true, true, true
),
(
    '10000000-0000-0000-0000-000000000004',
    'ambre-noir-intense',
    'Ambre Noir Intense',
    'عنبر أسود مكثف',
    'Une immersion sensorielle au cœur des nuits d''Orient. Ambre résineux, vanille de Madagascar et touches balsamiques.',
    'رحلة حسية ساحرة في ليالي الشرق الدافئة. عنبر راتنجي نقي مع فانيليا مدغشقر ونفحات بلسمية غنية تأسر الحواس.',
    'unisex',
    ARRAY['autumn', 'winter'],
    '44444444-4444-4444-4444-444444444444',
    'X8',
    ARRAY['Encens d''Oman', 'Cannelle de Ceylan'],
    ARRAY['بخور عماني', 'قرفة سيلانية'],
    ARRAY['Ambre noir résineux', 'Benjoin de Siam', 'Patchouli'],
    ARRAY['عنبر أسود نقي', 'جاوي سيامي', 'باتشولي'],
    ARRAY['Vanille Bourbon', 'Cuir noir', 'Opoponax'],
    ARRAY['فانيليا بوربون', 'جلد أسود', 'أوبوبوناكس'],
    ARRAY[
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000'
    ],
    false, true, true
),
(
    '10000000-0000-0000-0000-000000000005',
    'citrus-riviera',
    'Citrus Riviera',
    'حمضيات الريفيرا',
    'L''étincelle de la Méditerranée capturée dans un flacon. Citron d''Amalfi, néroli éclatant et brise marine.',
    'بريق شواطئ البحر الأبيض المتوسط في قارورة عطر. ليمون أمالفي المنعش، زهر البرتقال والنيرولي النقي مع نفحات نسيم البحر.',
    'unisex',
    ARRAY['spring', 'summer'],
    '55555555-5555-5555-5555-555555555555',
    'standard',
    ARRAY['Citron d''Amalfi', 'Mandarine verte', 'Gingembre frais'],
    ARRAY['ليمون أمالفي', 'يوسفي أخضر', 'زنجبيل طازج'],
    ARRAY['Néroli de Grasse', 'Fleur d''oranger', 'Romarin marin'],
    ARRAY['نيرولي غراس', 'زهر البرتقال', 'إكليل الجبل البحري'],
    ARRAY['Musc solaire', 'Cèdre blanc', 'Ambre sec'],
    ARRAY['مسك نقي', 'خشب الأرز', 'عنبر منعش'],
    ARRAY[
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000'
    ],
    false, false, true
),
(
    '10000000-0000-0000-0000-000000000006',
    'cuir-majeste',
    'Cuir Majesté',
    'جلد الفخامة',
    'Un cuir d''exception adouci par la violette impériale et le bois de gaïac. Puissant, noble et inoubliable.',
    'جلد كلاسيكي راقٍ تعززه زهور البنفسج الإمبراطورية وخشب الغاياك الدخاني. تجسيد للأناقة والرجولة الواثقة.',
    'men',
    ARRAY['autumn', 'winter'],
    '22222222-2222-2222-2222-222222222222',
    'X4',
    ARRAY['Feuille de violette', 'Thym rouge', 'Cardamome'],
    ARRAY['أوراق البنفسج', 'زعتر بري', 'حب الهال'],
    ARRAY['Cuir tanné de Toscane', 'Bois de gaïac', 'Iris florentin'],
    ARRAY['جلد توسكاني أصيل', 'خشب الغاياك', 'سوسن فلورنسي'],
    ARRAY['Ambre sombre', 'Patchouli noir', 'Mousse de chêne'],
    ARRAY['عنبر دافئ', 'باتشولي معتق', 'طحلب السنديان'],
    ARRAY[
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000'
    ],
    true, false, true
)
ON CONFLICT (slug) DO UPDATE
SET 
    name_fr = EXCLUDED.name_fr,
    name_ar = EXCLUDED.name_ar,
    description_fr = EXCLUDED.description_fr,
    description_ar = EXCLUDED.description_ar,
    classification = EXCLUDED.classification,
    images = EXCLUDED.images;

-- 4. PRODUCT VARIANTS (INDEPENDENT PRICING ACROSS SIZES)
INSERT INTO product_variants (product_id, size, sku, price_dzd, compare_at_price_dzd, stock_quantity, is_active)
VALUES
    -- Oud Royal (X8)
    ('10000000-0000-0000-0000-000000000001', '25ml', 'OUD-ROY-25', 4800, 5500, 35, true),
    ('10000000-0000-0000-0000-000000000001', '30ml', 'OUD-ROY-30', 5900, 6800, 42, true),
    ('10000000-0000-0000-0000-000000000001', '50ml', 'OUD-ROY-50', 8900, 10500, 68, true),
    ('10000000-0000-0000-0000-000000000001', '80ml', 'OUD-ROY-80', 12500, 14200, 24, true),
    ('10000000-0000-0000-0000-000000000001', '100ml', 'OUD-ROY-100', 14900, 17500, 19, true),

    -- Imperial Santal (X4)
    ('10000000-0000-0000-0000-000000000002', '25ml', 'SAN-IMP-25', 4200, 4800, 28, true),
    ('10000000-0000-0000-0000-000000000002', '30ml', 'SAN-IMP-30', 5200, 6000, 36, true),
    ('10000000-0000-0000-0000-000000000002', '50ml', 'SAN-IMP-50', 7800, 9200, 55, true),
    ('10000000-0000-0000-0000-000000000002', '80ml', 'SAN-IMP-80', 10900, 12500, 18, true),
    ('10000000-0000-0000-0000-000000000002', '100ml', 'SAN-IMP-100', 12900, 14900, 15, true),

    -- Fleur de Soie (Standard)
    ('10000000-0000-0000-0000-000000000003', '25ml', 'FLR-SOI-25', 3800, 4400, 30, true),
    ('10000000-0000-0000-0000-000000000003', '30ml', 'FLR-SOI-30', 4700, 5400, 40, true),
    ('10000000-0000-0000-0000-000000000003', '50ml', 'FLR-SOI-50', 6900, 8000, 72, true),
    ('10000000-0000-0000-0000-000000000003', '80ml', 'FLR-SOI-80', 9800, 11200, 22, true),
    ('10000000-0000-0000-0000-000000000003', '100ml', 'FLR-SOI-100', 11800, 13500, 16, true),

    -- Ambre Noir Intense (X8)
    ('10000000-0000-0000-0000-000000000004', '25ml', 'AMB-NOI-25', 4600, 5200, 25, true),
    ('10000000-0000-0000-0000-000000000004', '30ml', 'AMB-NOI-30', 5600, 6400, 31, true),
    ('10000000-0000-0000-0000-000000000004', '50ml', 'AMB-NOI-50', 8400, 9800, 48, true),
    ('10000000-0000-0000-0000-000000000004', '80ml', 'AMB-NOI-80', 11900, 13600, 14, true),
    ('10000000-0000-0000-0000-000000000004', '100ml', 'AMB-NOI-100', 13900, 16200, 12, true),

    -- Citrus Riviera (Standard)
    ('10000000-0000-0000-0000-000000000005', '25ml', 'CIT-RIV-25', 3600, 4200, 20, true),
    ('10000000-0000-0000-0000-000000000005', '30ml', 'CIT-RIV-30', 4400, 5000, 29, true),
    ('10000000-0000-0000-0000-000000000005', '50ml', 'CIT-RIV-50', 6500, 7500, 45, true),
    ('10000000-0000-0000-0000-000000000005', '80ml', 'CIT-RIV-80', 9200, 10500, 15, true),
    ('10000000-0000-0000-0000-000000000005', '100ml', 'CIT-RIV-100', 10900, 12500, 10, true),

    -- Cuir Majesté (X4)
    ('10000000-0000-0000-0000-000000000006', '25ml', 'CUI-MAJ-25', 4400, 5000, 18, true),
    ('10000000-0000-0000-0000-000000000006', '30ml', 'CUI-MAJ-30', 5400, 6200, 25, true),
    ('10000000-0000-0000-0000-000000000006', '50ml', 'CUI-MAJ-50', 8100, 9500, 40, true),
    ('10000000-0000-0000-0000-000000000006', '80ml', 'CUI-MAJ-80', 11400, 13000, 12, true),
    ('10000000-0000-0000-0000-000000000006', '100ml', 'CUI-MAJ-100', 13500, 15800, 8, true)
ON CONFLICT (sku) DO UPDATE
SET 
    price_dzd = EXCLUDED.price_dzd,
    stock_quantity = EXCLUDED.stock_quantity;

-- 5. BUNDLES (PACKS PREDEFINIS & SUR-MESURE)
INSERT INTO bundles (id, slug, type, name_fr, name_ar, description_fr, description_ar, fixed_price_dzd, discount_percentage, required_bottles_count, allowed_sizes, images, is_active)
VALUES
(
    '90000000-0000-0000-0000-000000000001',
    'pack-duo-prestige',
    'predefined',
    'Pack Duo Prestige (50ml × 2)',
    'باقة الثنائي الملكي (50 مل × 2)',
    'Notre alliance emblématique: Oud Royal X8 et Imperial Santal X4 pour les amateurs de sillages intenses.',
    'التناغم الملكي الأكثر طلباً: عود ملكي X8 مع صندل إمبراطوري X4 في علبة مخملية فاخرة.',
    14500,
    15,
    2,
    ARRAY['50ml']::bottle_size[],
    ARRAY['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000'],
    true
),
(
    '90000000-0000-0000-0000-000000000002',
    'pack-trio-oriental',
    'predefined',
    'Pack Trio Oriental Intense (50ml × 3)',
    'باقة الثلاثي الشرقي المكثف (50 مل × 3)',
    'Le triptyque olfactif absolu: Oud Royal, Ambre Noir Intense et Cuir Majesté dans un coffret de prestige.',
    'ثلاثية الفخامة المطلقة: عود ملكي، عنبر أسود مكثف وجلد الفخامة في صندوق برستيج أسود فاخر.',
    21500,
    20,
    3,
    ARRAY['50ml']::bottle_size[],
    ARRAY['https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000'],
    true
)
ON CONFLICT (slug) DO UPDATE
SET fixed_price_dzd = EXCLUDED.fixed_price_dzd;

-- 6. ALGERIAN 58 WILAYAS DELIVERY RATES (Standardized)
INSERT INTO wilaya_delivery_rates (wilaya_code, name_fr, name_ar, delivery_fee_dzd, estimated_days)
VALUES
    ('01', 'Adrar', 'أدرار', 950, '48h - 72h'),
    ('02', 'Chlef', 'الشلف', 600, '24h - 48h'),
    ('03', 'Laghouat', 'الأغواط', 800, '48h'),
    ('04', 'Oum El Bouaghi', 'أم البواقي', 650, '24h - 48h'),
    ('05', 'Batna', 'باتنة', 650, '24h - 48h'),
    ('06', 'Béjaïa', 'بجاية', 600, '24h - 48h'),
    ('07', 'Biskra', 'بسكرة', 750, '48h'),
    ('08', 'Béchar', 'بشار', 900, '48h - 72h'),
    ('09', 'Blida', 'البليدة', 500, '24h - 48h'),
    ('10', 'Bouira', 'البويرة', 550, '24h - 48h'),
    ('11', 'Tamanrasset', 'تمنراست', 1100, '72h - 96h'),
    ('12', 'Tébessa', 'تبسة', 700, '48h'),
    ('13', 'Tlemcen', 'تلمسان', 650, '24h - 48h'),
    ('14', 'Tiaret', 'تيارت', 650, '24h - 48h'),
    ('15', 'Tizi Ouzou', 'تيزي وزو', 550, '24h - 48h'),
    ('16', 'Alger', 'الجزائر', 400, '24h'),
    ('17', 'Djelfa', 'الجلفة', 750, '48h'),
    ('18', 'Jijel', 'جيجل', 600, '24h - 48h'),
    ('19', 'Sétif', 'سطيف', 600, '24h - 48h'),
    ('20', 'Saïda', 'سعيدة', 700, '48h'),
    ('21', 'Skikda', 'سكيكدة', 650, '24h - 48h'),
    ('22', 'Sidi Bel Abbès', 'سيدي بلعباس', 650, '24h - 48h'),
    ('23', 'Annaba', 'عنابة', 650, '24h - 48h'),
    ('24', 'Guelma', 'قالمة', 650, '24h - 48h'),
    ('25', 'Constantine', 'قسنطينة', 600, '24h - 48h'),
    ('26', 'Médéa', 'المدية', 550, '24h - 48h'),
    ('27', 'Mostaganem', 'مستغانم', 600, '24h - 48h'),
    ('28', 'M''Sila', 'المسيلة', 650, '24h - 48h'),
    ('29', 'Mascara', 'معسكر', 650, '24h - 48h'),
    ('30', 'Ouargla', 'ورقلة', 850, '48h - 72h'),
    ('31', 'Oran', 'وهران', 600, '24h - 48h'),
    ('32', 'El Bayadh', 'البيض', 850, '48h - 72h'),
    ('33', 'Illizi', 'إليزي', 1100, '72h - 96h'),
    ('34', 'Bordj Bou Arreridj', 'برج بوعريريج', 600, '24h - 48h'),
    ('35', 'Boumerdès', 'بومرداس', 500, '24h - 48h'),
    ('36', 'El Tarf', 'الطارف', 700, '48h'),
    ('37', 'Tindouf', 'تندوف', 1100, '72h - 96h'),
    ('38', 'Tissemsilt', 'تسمسيلت', 650, '48h'),
    ('39', 'El Oued', 'الوادي', 800, '48h'),
    ('40', 'Khenchela', 'خنشلة', 700, '48h'),
    ('41', 'Souk Ahras', 'سوق أهراس', 700, '48h'),
    ('42', 'Tipaza', 'تيبازة', 500, '24h - 48h'),
    ('43', 'Mila', 'ميلة', 600, '24h - 48h'),
    ('44', 'Aïn Defla', 'عين الدفلى', 600, '24h - 48h'),
    ('45', 'Naâma', 'النعامة', 850, '48h - 72h'),
    ('46', 'Aïn Témouchent', 'عين تموشنت', 650, '24h - 48h'),
    ('47', 'Ghardaïa', 'غرداية', 850, '48h'),
    ('48', 'Relizane', 'غليزان', 650, '24h - 48h'),
    ('49', 'Timimoun', 'تيميمون', 950, '72h'),
    ('50', 'Bordj Badji Mokhtar', 'برج باجي مختار', 1200, '96h'),
    ('51', 'Ouled Djellal', 'أولاد جلال', 800, '48h'),
    ('52', 'Béni Abbès', 'بني عباس', 950, '72h'),
    ('53', 'In Salah', 'عين صالح', 1000, '72h'),
    ('54', 'In Guezzam', 'عين قزام', 1200, '96h'),
    ('55', 'Touggourt', 'تقرت', 800, '48h'),
    ('56', 'Djanet', 'جانت', 1100, '96h'),
    ('57', 'El M''Ghair', 'المغير', 800, '48h'),
    ('58', 'El Meniaa', 'المنيعة', 850, '48h')
ON CONFLICT (wilaya_code) DO UPDATE
SET delivery_fee_dzd = EXCLUDED.delivery_fee_dzd;

-- 7. RAW INVENTORY (CONCENTRATED OILS & ALCOHOL)
INSERT INTO raw_materials (sku, name_fr, name_ar, category, stock_quantity, unit, cost_per_unit_dzd, min_threshold)
VALUES
    ('OIL-OUD-ROYAL', 'Huile Concentrée Oud Royal', 'زيت خام عود ملكي', 'oil', 2500, 'ml', 45, 500),
    ('OIL-IMP-SANTAL', 'Huile Concentrée Imperial Santal', 'زيت خام صندل إمبراطوري', 'oil', 1800, 'ml', 38, 400),
    ('OIL-FLEUR-SOIE', 'Huile Concentrée Fleur de Soie', 'زيت خام زهرة الحرير', 'oil', 3000, 'ml', 32, 500),
    ('OIL-AMBRE-NOIR', 'Huile Concentrée Ambre Noir Intense', 'زيت خام عنبر أسود مكثف', 'oil', 2200, 'ml', 42, 400),
    ('OIL-CITRUS-RIV', 'Huile Concentrée Citrus Riviera', 'زيت خام حمضيات الريفيرا', 'oil', 2400, 'ml', 28, 400),
    ('ALC-DENAT-96', 'Alcool Cosmétique Dénaturé 96°', 'كحول تجميلي نقي 96 درجة', 'alcohol', 25000, 'ml', 2.5, 5000)
ON CONFLICT (sku) DO NOTHING;

-- 8. PACKAGING MATERIALS (EMPTY BOTTLES, PUMPS, CAPS, LUXURY BOXES)
INSERT INTO packaging_materials (sku, name_fr, name_ar, material_type, bottle_size, stock_quantity, unit, cost_per_unit_dzd, min_threshold)
VALUES
    ('BTL-GLS-25ML', 'Flacon Verre Lourd 25ml', 'قارورة زجاجية ثقيلة 25 مل', 'bottle', '25ml', 350, 'pcs', 180, 50),
    ('BTL-GLS-30ML', 'Flacon Verre Lourd 30ml', 'قارورة زجاجية ثقيلة 30 مل', 'bottle', '30ml', 420, 'pcs', 210, 50),
    ('BTL-GLS-50ML', 'Flacon Verre Lourd 50ml', 'قارورة زجاجية ثقيلة 50 مل', 'bottle', '50ml', 650, 'pcs', 260, 80),
    ('BTL-GLS-80ML', 'Flacon Verre Lourd 80ml', 'قارورة زجاجية ثقيلة 80 مل', 'bottle', '80ml', 280, 'pcs', 320, 40),
    ('BTL-GLS-100ML', 'Flacon Verre Lourd 100ml', 'قارورة زجاجية ثقيلة 100 مل', 'bottle', '100ml', 310, 'pcs', 370, 40),
    ('PMP-GLD-STD', 'Pompe Atomiseur Dorée Micro-Diffusion', 'مضخة بخاخ ذهبية دقيقة', 'pump', NULL, 1500, 'pcs', 75, 200),
    ('CAP-MAG-BLK', 'Bouchon Magnétique Noir/Or', 'غطاء مغناطيسي أسود وذهبي', 'cap', NULL, 1600, 'pcs', 95, 200),
    ('BOX-LUX-IND', 'Coffret Individuel Éline Finition Soft-Touch', 'علبة فردية فاخرة ملمس ناعم', 'box', NULL, 1200, 'pcs', 120, 150),
    ('BOX-LUX-TRIO', 'Coffret Prestige Trio 3 Flacons', 'صندوق برستيج فاخر 3 قوارير', 'box', NULL, 400, 'pcs', 350, 50)
ON CONFLICT (sku) DO NOTHING;
