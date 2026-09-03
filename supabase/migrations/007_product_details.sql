-- ============================================================
-- 007: Populate product details and set as default
-- Sets bilingual specification text on all existing products
-- and makes it the default for any new product.
-- ============================================================

-- Update all existing products
UPDATE products
SET details = 'Weight: 260 g/m²
Material: Cotton canvas (FSC® Mix certified)
Finish: Textured print surface, brown backing
Print Method: UV printing with high resolution
Inks: Sophisticated, non-toxic inks - safe and eco-friendly
Cotton canvas: The cotton canvas is stretched on an inner wooden frame.
Blind frame: Our wooden frames are crafted exclusively from kiln-dried ram-cham wood. Depending on the size of the artwork, moldings with dimensions of 2 x 3 cm, 2 x 4 cm, or 2 x 5 cm are used. Each profile is carefully selected to ensure stability, aesthetics, and a perfect fit with the artwork.
Canvas roll: With an additional 5 cm on each side, allowing the frame to be fully covered. (The frame is not included in the offer.)
Frame: Choose the frame that suits you best – a decorative wooden ''floating'' frame that highlights the artwork without overshadowing the art itself.
Ready to Hang: Each print comes with a practical mounting kit. Instead of a standard hanger, we use a discreet and secure wire that ensures easy and stable placement.

PRODUCT MADE IN NORTH MACEDONIA, IN THE CITY OF GEVGELIJA

TECHNICAL NOTES: DUE TO DIFFERENT SCREEN SETTINGS, COLORS MAY VARY.',

details_mk = 'Тежина: 260 g/m²
Материјал: Памучно платно (FSC® Mix сертифицирано)
Финиш: Текстурирана печатна површина, кафена подлога
Метод на печатење: UV печатење со висока резолуција
Бои: Софистицирани, нетоксични бои – безбедни и еколошки
Памучно платно: Памучното платно е оптегнато на внатрешна дрвена рамка.
Blind рамка: Нашите дрвени рамки се изработуваат исклучиво од суво дрво рам-чам. Во зависност од големината на уметничкото дело, се користат лајсни со димензии 2 x 3 см, 2 x 4 см или 2 x 5 см. Секој профил е внимателно избран за да обезбеди стабилност, естетика и совршено вклопување со делото.
Канвас во ролна: Со дополнителни 5 cm на секоја страна, овозможувајќи рамката да биде целосно покриена. (Рамката не е дел од понудата.)
Рамка: Изберете ја рамката што најмногу ви одговара – декоративна дрвена ''лебдечка'' рамка што го истакнува делото, а не ја засенува уметноста.
Подготвено за закачување: Секој принт доаѓа со практичен комплет за монтажа. Наместо стандардна закачалка, користиме дискретна и сигурна сајла што овозможува лесно и стабилно поставување.

ПРОИЗВОД НАПРАВЕН ВО СЕВЕРНА МАКЕДОНИЈА, ВО ГРАДОТ ГЕВГЕЛИЈА

ТЕХНИЧКИ НАПОМЕНИ: ПОРАДИ РАЗЛИЧНИ ПОДЕСУВАЊА НА ЕКРАНИТЕ, БОИТЕ МОЖЕ ДА СЕ РАЗЛИКУВААТ.';

-- Set default for new products (EN)
ALTER TABLE products
ALTER COLUMN details SET DEFAULT 'Weight: 260 g/m²
Material: Cotton canvas (FSC® Mix certified)
Finish: Textured print surface, brown backing
Print Method: UV printing with high resolution
Inks: Sophisticated, non-toxic inks - safe and eco-friendly
Cotton canvas: The cotton canvas is stretched on an inner wooden frame.
Blind frame: Our wooden frames are crafted exclusively from kiln-dried ram-cham wood. Depending on the size of the artwork, moldings with dimensions of 2 x 3 cm, 2 x 4 cm, or 2 x 5 cm are used. Each profile is carefully selected to ensure stability, aesthetics, and a perfect fit with the artwork.
Canvas roll: With an additional 5 cm on each side, allowing the frame to be fully covered. (The frame is not included in the offer.)
Frame: Choose the frame that suits you best – a decorative wooden ''floating'' frame that highlights the artwork without overshadowing the art itself.
Ready to Hang: Each print comes with a practical mounting kit. Instead of a standard hanger, we use a discreet and secure wire that ensures easy and stable placement.

PRODUCT MADE IN NORTH MACEDONIA, IN THE CITY OF GEVGELIJA

TECHNICAL NOTES: DUE TO DIFFERENT SCREEN SETTINGS, COLORS MAY VARY.';

-- Set default for new products (MK)
ALTER TABLE products
ALTER COLUMN details_mk SET DEFAULT 'Тежина: 260 g/m²
Материјал: Памучно платно (FSC® Mix сертифицирано)
Финиш: Текстурирана печатна површина, кафена подлога
Метод на печатење: UV печатење со висока резолуција
Бои: Софистицирани, нетоксични бои – безбедни и еколошки
Памучно платно: Памучното платно е оптегнато на внатрешна дрвена рамка.
Blind рамка: Нашите дрвени рамки се изработуваат исклучиво од суво дрво рам-чам. Во зависност од големината на уметничкото дело, се користат лајсни со димензии 2 x 3 см, 2 x 4 см или 2 x 5 см. Секој профил е внимателно избран за да обезбеди стабилност, естетика и совршено вклопување со делото.
Канвас во ролна: Со дополнителни 5 cm на секоја страна, овозможувајќи рамката да биде целосно покриена. (Рамката не е дел од понудата.)
Рамка: Изберете ја рамката што најмногу ви одговара – декоративна дрвена ''лебдечка'' рамка што го истакнува делото, а не ја засенува уметноста.
Подготвено за закачување: Секој принт доаѓа со практичен комплет за монтажа. Наместо стандардна закачалка, користиме дискретна и сигурна сајла што овозможува лесно и стабилно поставување.

ПРОИЗВОД НАПРАВЕН ВО СЕВЕРНА МАКЕДОНИЈА, ВО ГРАДОТ ГЕВГЕЛИЈА

ТЕХНИЧКИ НАПОМЕНИ: ПОРАДИ РАЗЛИЧНИ ПОДЕСУВАЊА НА ЕКРАНИТЕ, БОИТЕ МОЖЕ ДА СЕ РАЗЛИКУВААТ.';
