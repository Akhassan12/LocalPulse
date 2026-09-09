"""
app/seeds/seed_data.py — Production-grade seed data for LocalPulse
Contains:
- 2 Authentic Hub Cities: Tokyo, Japan & Oaxaca, Mexico
- 80 Rich, diverse experiences across categories (Food, Culture, Outdoor, Market, Shopping, Workshop, Tour, Nightlife, Wellness)
- 14 Market Listings with matching market_valuations rows and bilingual bargaining phrases
"""
from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Any, Dict, List

# ── 14 Detailed Market Valuations ─────────────────────────────────────────────
SEED_MARKET_VALUATIONS: List[Dict[str, Any]] = [
    # ── Oaxaca, Mexico (Mercado 20 de Noviembre & Mercado Benito Juárez) ───────
    {
        "id": "11111111-0000-0000-0000-000000000001",
        "item_name": "Hand-carved Copal Wood Alebrije (Small)",
        "category": "folk_art",
        "location_country": "Mexico",
        "location_city": "Oaxaca",
        "currency": "USD",
        "fair_market_value": Decimal("35.00"),
        "suggested_opening_bid": Decimal("25.00"),
        "estimated_weight_kg": Decimal("0.35"),
        "valuation_source": "artisan_guild_estimate",
        "confidence_score": Decimal("0.90"),
        "bargaining_phrases": [
            {"native": "¿Cuánto es lo menos por esta pieza?", "phonetic": "Kwan-to es lo may-nos por es-ta pyeh-sa?", "meaning": "What is the best/lowest price for this piece?"},
            {"native": "Es un trabajo artesanal muy hermoso.", "phonetic": "Es oon tra-ba-ho ar-te-sa-nal mwee er-mo-so", "meaning": "It is very beautiful handcrafted work."},
            {"native": "¿Me haría un descuento si llevo dos?", "phonetic": "May ah-ree-ah oon des-kwen-to see yeh-vo dos?", "meaning": "Would you give me a discount if I take two?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000002",
        "item_name": "Hand-woven Zapotec Wool Rug (Tapete 60x100cm)",
        "category": "textile",
        "location_country": "Mexico",
        "location_city": "Oaxaca",
        "currency": "USD",
        "fair_market_value": Decimal("85.00"),
        "suggested_opening_bid": Decimal("65.00"),
        "estimated_weight_kg": Decimal("1.40"),
        "valuation_source": "teotitlan_cooperative_index",
        "confidence_score": Decimal("0.88"),
        "bargaining_phrases": [
            {"native": "¿Los tintes son naturales de cochinilla?", "phonetic": "Los teen-tes son na-too-rah-les day co-chee-nee-ya?", "meaning": "Are the dyes natural from cochineal?"},
            {"native": "¿Cuál es su mejor precio por el tapete?", "phonetic": "Kwal es soo may-hor preh-syoh por el tah-peh-teh?", "meaning": "What is your best price for the rug?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000003",
        "item_name": "Barro Negro (Black Clay) Mezcal Cantarito Set",
        "category": "pottery",
        "location_country": "Mexico",
        "location_city": "Oaxaca",
        "currency": "USD",
        "fair_market_value": Decimal("28.00"),
        "suggested_opening_bid": Decimal("20.00"),
        "estimated_weight_kg": Decimal("0.90"),
        "valuation_source": "san_bartolo_potters_standard",
        "confidence_score": Decimal("0.92"),
        "bargaining_phrases": [
            {"native": "¿Está bien empacado para viaje en avión?", "phonetic": "Es-tah byehn em-pa-ka-do pa-ra vya-he en ah-vyon?", "meaning": "Is it well packed for airplane travel?"},
            {"native": "¿Cuánto por el juego completo con vasitos?", "phonetic": "Kwan-to por el hweh-go com-ple-to kon va-see-tos?", "meaning": "How much for the complete set with small cups?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000004",
        "item_name": "Artisanal Espadín Mezcal (750ml Hand-labeled)",
        "category": "spirits",
        "location_country": "Mexico",
        "location_city": "Oaxaca",
        "currency": "USD",
        "fair_market_value": Decimal("40.00"),
        "suggested_opening_bid": Decimal("32.00"),
        "estimated_weight_kg": Decimal("1.25"),
        "valuation_source": "palenque_direct_benchmark",
        "confidence_score": Decimal("0.95"),
        "bargaining_phrases": [
            {"native": "¿Puedo probar una pequeña muestra primero?", "phonetic": "Pweh-doh pro-bar oo-nah peh-kehn-ya mwehs-trah pree-meh-ro?", "meaning": "May I try a small sample first?"},
            {"native": "¿Cuántos grados de alcohol tiene este lote?", "phonetic": "Kwan-tos gra-dos day al-co-hol tyeh-neh es-teh lo-teh?", "meaning": "What ABV does this distillation batch have?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000005",
        "item_name": "Traditional Embroidered Huipil Blouse (Cotton)",
        "category": "clothing",
        "location_country": "Mexico",
        "location_city": "Oaxaca",
        "currency": "USD",
        "fair_market_value": Decimal("48.00"),
        "suggested_opening_bid": Decimal("38.00"),
        "estimated_weight_kg": Decimal("0.30"),
        "valuation_source": "mercado_artesanias_survey",
        "confidence_score": Decimal("0.85"),
        "bargaining_phrases": [
            {"native": "¿El bordado es hecho a mano?", "phonetic": "El bor-dah-do es eh-cho ah mah-no?", "meaning": "Is the embroidery done by hand?"},
            {"native": "¿Tiene esta blusa en otra talla o color?", "phonetic": "Tyeh-neh es-tah bloo-sah en oh-trah tie-yah oh co-lor?", "meaning": "Do you have this blouse in another size or color?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000006",
        "item_name": "Oaxacan Criollo Cacao Chocolate Disk Pack (1kg)",
        "category": "gourmet_food",
        "location_country": "Mexico",
        "location_city": "Oaxaca",
        "currency": "USD",
        "fair_market_value": Decimal("16.00"),
        "suggested_opening_bid": Decimal("14.00"),
        "estimated_weight_kg": Decimal("1.05"),
        "valuation_source": "mercado_abastos_producer_price",
        "confidence_score": Decimal("0.95"),
        "bargaining_phrases": [
            {"native": "¿Tiene chocolate amargo con canela y almendra?", "phonetic": "Tyeh-neh cho-co-lah-teh ah-mar-go kon cah-neh-lah ee al-men-drah?", "meaning": "Do you have dark chocolate with cinnamon and almond?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000007",
        "item_name": "Dried Chapulines with Lime & Chile de Árbol (250g bag)",
        "category": "specialty_food",
        "location_country": "Mexico",
        "location_city": "Oaxaca",
        "currency": "USD",
        "fair_market_value": Decimal("7.00"),
        "suggested_opening_bid": Decimal("5.50"),
        "estimated_weight_kg": Decimal("0.28"),
        "valuation_source": "mercado_20_noviembre_pricing",
        "confidence_score": Decimal("0.90"),
        "bargaining_phrases": [
            {"native": "¿Son recién tostados del día?", "phonetic": "Son reh-syen tos-tah-dos del dee-ah?", "meaning": "Are they freshly toasted today?"}
        ]
    },

    # ── Tokyo, Japan (Ameyoko, Yanaka Ginza & Kappabashi) ─────────────────────
    {
        "id": "11111111-0000-0000-0000-000000000008",
        "item_name": "Santoku Damascus Steel Kitchen Knife (180mm)",
        "category": "cutlery",
        "location_country": "Japan",
        "location_city": "Tokyo",
        "currency": "USD",
        "fair_market_value": Decimal("130.00"),
        "suggested_opening_bid": Decimal("115.00"),
        "estimated_weight_kg": Decimal("0.45"),
        "valuation_source": "kappabashi_guild_benchmark",
        "confidence_score": Decimal("0.96"),
        "bargaining_phrases": [
            {"native": "この包丁の鋼材は何ですか？", "phonetic": "Kono hōchō no kōzai wa nan desu ka?", "meaning": "What steel is used for this knife?"},
            {"native": "免税手続きはできますか？", "phonetic": "Menzei tetsuzuki wa dekimasu ka?", "meaning": "Can I do tax-free procedures?"},
            {"native": "名入れサービスはありますか？", "phonetic": "Naire sābisu wa arimasu ka?", "meaning": "Is there a name engraving service?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000009",
        "item_name": "Ceremonial Uji Matcha & Hand-split Bamboo Chasen Whisk Set",
        "category": "tea_ceremony",
        "location_country": "Japan",
        "location_city": "Tokyo",
        "currency": "USD",
        "fair_market_value": Decimal("48.00"),
        "suggested_opening_bid": Decimal("42.00"),
        "estimated_weight_kg": Decimal("0.32"),
        "valuation_source": "ginza_tea_merchants_index",
        "confidence_score": Decimal("0.94"),
        "bargaining_phrases": [
            {"native": "茶せんの穂数は百本立てですか？", "phonetic": "Chasen no hosū wa hyappon-date desu ka?", "meaning": "Is this whisk a 100-tine whisk?"},
            {"native": "おすすめのお抹茶はどれですか？", "phonetic": "Osusume no omatcha wa dore desu ka?", "meaning": "Which matcha do you recommend?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000010",
        "item_name": "Edo Kiriko Cut-Glass Whiskey Tumbler",
        "category": "craftsmanship",
        "location_country": "Japan",
        "location_city": "Tokyo",
        "currency": "USD",
        "fair_market_value": Decimal("95.00"),
        "suggested_opening_bid": Decimal("85.00"),
        "estimated_weight_kg": Decimal("0.40"),
        "valuation_source": "tokyo_traditional_arts_catalog",
        "confidence_score": Decimal("0.91"),
        "bargaining_phrases": [
            {"native": "桐箱は付いていますか？", "phonetic": "Kiribako wa tsuite imasu ka?", "meaning": "Does it come with a traditional paulownia wood box?"},
            {"native": "職人さんの手削りですか？", "phonetic": "Shokunin-san no tezuri desu ka?", "meaning": "Is this hand-cut by a master craftsman?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000011",
        "item_name": "Vintage Indigo-Dyed Tenugui Cotton Cloth",
        "category": "textile",
        "location_country": "Japan",
        "location_city": "Tokyo",
        "currency": "USD",
        "fair_market_value": Decimal("18.00"),
        "suggested_opening_bid": Decimal("15.00"),
        "estimated_weight_kg": Decimal("0.08"),
        "valuation_source": "yanaka_ginza_market_rate",
        "confidence_score": Decimal("0.89"),
        "bargaining_phrases": [
            {"native": "本藍染めですか？", "phonetic": "Hon-aizome desu ka?", "meaning": "Is this genuine natural indigo dye?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000012",
        "item_name": "Nanbu Ironware (Tetsubin) Teapot (0.6L)",
        "category": "cookware",
        "location_country": "Japan",
        "location_city": "Tokyo",
        "currency": "USD",
        "fair_market_value": Decimal("110.00"),
        "suggested_opening_bid": Decimal("95.00"),
        "estimated_weight_kg": Decimal("1.65"),
        "valuation_source": "kappabashi_metals_guild",
        "confidence_score": Decimal("0.93"),
        "bargaining_phrases": [
            {"native": "内側はホーロー加工されていますか？", "phonetic": "Uchigawa wa hōrō kakō sarete imasu ka?", "meaning": "Is the interior enameled or raw cast iron?"},
            {"native": "直火にかけても大丈夫ですか？", "phonetic": "Jikabi ni kaketemo daijōbu desu ka?", "meaning": "Can this be placed directly on flame/stovetop?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000013",
        "item_name": "Aged Junmai Daiginjo Sake (720ml Niigata Brew)",
        "category": "spirits",
        "location_country": "Japan",
        "location_city": "Tokyo",
        "currency": "USD",
        "fair_market_value": Decimal("42.00"),
        "suggested_opening_bid": Decimal("38.00"),
        "estimated_weight_kg": Decimal("1.20"),
        "valuation_source": "tsukiji_liquor_index",
        "confidence_score": Decimal("0.95"),
        "bargaining_phrases": [
            {"native": "冷やして飲むのがおすすめですか？", "phonetic": "Hiyashite nomu no ga osusume desu ka?", "meaning": "Is this best enjoyed chilled?"}
        ]
    },
    {
        "id": "11111111-0000-0000-0000-000000000014",
        "item_name": "Kyoto Cypress (Hinoki) Aromatherapy Bath Stool & Ladle",
        "category": "bathware",
        "location_country": "Japan",
        "location_city": "Tokyo",
        "currency": "USD",
        "fair_market_value": Decimal("55.00"),
        "suggested_opening_bid": Decimal("45.00"),
        "estimated_weight_kg": Decimal("1.10"),
        "valuation_source": "traditional_woodwork_index",
        "confidence_score": Decimal("0.87"),
        "bargaining_phrases": [
            {"native": "ヒノキの良い香りがしますね。", "phonetic": "Hinoki no ii kaori ga shimasu ne.", "meaning": "It has a wonderful hinoki cedar scent."}
        ]
    },
]


# ── Helper to build 80 Rich Experiences ───────────────────────────────────────
def generate_seed_experiences() -> List[Dict[str, Any]]:
    experiences: List[Dict[str, Any]] = []

    # 40 Tokyo Experiences
    tokyo_items = [
        # Culture & Heritage
        ("Meiji Jingu Forest Walking Meditation", "culture", ["shrine", "nature", "peaceful"], Decimal("0.0"), Decimal("0.0"), 90, 35.6764, 139.6993, "1-1 Yoyogikamizonocho, Shibuya", ["wheelchair_accessible", "audio_guide"], Decimal("4.85"), 340, Decimal("0.75")),
        ("Sensō-ji Dawn Sanctuary Tour", "culture", ["temple", "historic", "asakusa"], Decimal("15.0"), Decimal("25.0"), 75, 35.7148, 139.7967, "2-3-1 Asakusa, Taito", ["step_free"], Decimal("4.90"), 520, Decimal("0.80")),
        ("Nezu Shrine Azalea & Vermilion Torii Path", "culture", ["torii", "hidden_gem", "quiet"], Decimal("0.0"), Decimal("5.0"), 60, 35.7202, 139.7610, "1-28-9 Nezu, Bunkyo", [], Decimal("4.78"), 180, Decimal("0.88")),
        ("Edo-Tokyo Architectural Open-Air Museum", "culture", ["architecture", "history", "retro"], Decimal("10.0"), Decimal("15.0"), 150, 35.7161, 139.5126, "Koganei Park, Tokyo", ["wheelchair_accessible"], Decimal("4.82"), 210, Decimal("0.85")),
        ("Kanda Myojin IT Tech Blessing Ritual", "culture", ["quirky", "modern_traditional", "akihabara"], Decimal("5.0"), Decimal("10.0"), 45, 35.7020, 139.7679, "2-16-2 Sotokanda, Chiyoda", ["step_free"], Decimal("4.65"), 140, Decimal("0.92")),

        # Workshops & Crafts
        ("Kappabashi Hand-Forged Kitchen Knife Workshop", "workshop", ["knife", "craft", "blacksmith"], Decimal("90.0"), Decimal("130.0"), 120, 35.7126, 139.7897, "Kappabashi Dougu Street, Taito", [], Decimal("4.95"), 88, Decimal("0.94")),
        ("Authentic Yanaka Soba Noodle Kneading Class", "workshop", ["cooking", "soba", "culinary"], Decimal("45.0"), Decimal("60.0"), 90, 35.7275, 139.7685, "Yanaka Ginza, Taito", [], Decimal("4.88"), 115, Decimal("0.87")),
        ("Traditional Kintsugi Gold Ceramic Repair", "workshop", ["kintsugi", "mindfulness", "art"], Decimal("65.0"), Decimal("85.0"), 120, 35.6628, 139.7314, "Aoyama, Minato", ["quiet_space"], Decimal("4.92"), 64, Decimal("0.96")),
        ("Uji Ceremonial Matcha & Wagashi Making", "workshop", ["tea", "sweets", "zen"], Decimal("35.0"), Decimal("50.0"), 75, 35.6660, 139.7050, "Omotesando, Shibuya", ["wheelchair_accessible"], Decimal("4.86"), 190, Decimal("0.89")),
        ("Sumida Woodblock Ukiyo-e Printing Experience", "workshop", ["woodblock", "hokusai", "printing"], Decimal("40.0"), Decimal("55.0"), 90, 35.7056, 139.8094, "Kamezawa, Sumida", [], Decimal("4.79"), 82, Decimal("0.91")),

        # Food & Gastronomy
        ("Tsukiji Outer Market Morning Seafood Crawl", "food", ["sushi", "street_food", "morning"], Decimal("25.0"), Decimal("50.0"), 90, 35.6655, 139.7707, "4-16-2 Tsukiji, Chuo", ["stroller_friendly"], Decimal("4.87"), 610, Decimal("0.82")),
        ("Omoide Yokocho Charcoal Yakitori Alley", "food", ["izakaya", "yakitori", "nightlife"], Decimal("20.0"), Decimal("40.0"), 75, 35.6931, 139.6997, "1-2 Nishi-Shinjuku", [], Decimal("4.74"), 420, Decimal("0.78")),
        ("Kanda Old-School Soba & Tempura Tasting", "food", ["soba", "historic_dining", "traditional"], Decimal("18.0"), Decimal("30.0"), 60, 35.6967, 139.7690, "Awajicho, Chiyoda", [], Decimal("4.83"), 290, Decimal("0.86")),
        ("Ginza Standing Tachigui Sushi Counter", "food", ["sushi", "fast_gourmet", "authentic"], Decimal("20.0"), Decimal("45.0"), 45, 35.6719, 139.7658, "5-Chome Ginza, Chuo", [], Decimal("4.80"), 310, Decimal("0.84")),
        ("Shimokitazawa Specialty Third-Wave Coffee Hop", "food", ["coffee", "indie", "cafe"], Decimal("12.0"), Decimal("22.0"), 60, 35.6617, 139.6667, "Kitazawa, Setagaya", [], Decimal("4.76"), 150, Decimal("0.81")),

        # Outdoor & Nature
        ("Shinjuku Gyoen Seasonal Botanical Stroll", "outdoor", ["garden", "nature", "picnic"], Decimal("4.0"), Decimal("4.0"), 90, 35.6852, 139.7101, "11 Naitomachi, Shinjuku", ["wheelchair_accessible", "accessible_restroom"], Decimal("4.88"), 780, Decimal("0.72")),
        ("Meguro River Cherry Blossom Canal Kayaking", "outdoor", ["kayak", "waterway", "adventure"], Decimal("55.0"), Decimal("75.0"), 105, 35.6339, 139.7158, "Meguro Canal, Shinagawa", [], Decimal("4.91"), 92, Decimal("0.95")),
        ("Todoroki Ravine Secret Valley Hike", "outdoor", ["ravine", "hidden_nature", "hiking"], Decimal("0.0"), Decimal("0.0"), 75, 35.6067, 139.6461, "Todoroki, Setagaya", [], Decimal("4.72"), 160, Decimal("0.90")),
        ("Sumida River Waterbus Cruise to Odaiba", "outdoor", ["boat", "skyline", "relaxing"], Decimal("12.0"), Decimal("18.0"), 60, 35.7118, 139.7990, "Asakusa Pier, Taito", ["wheelchair_accessible"], Decimal("4.68"), 380, Decimal("0.70")),
        ("Koishikawa Korakuen Feudal Landscape Garden", "outdoor", ["landscape", "zen", "historic"], Decimal("3.0"), Decimal("3.0"), 60, 35.7047, 139.7494, "Koraku, Bunkyo", ["step_free"], Decimal("4.81"), 230, Decimal("0.83")),

        # Market & Shopping (barter & capacity relevant)
        ("Ameyoko Open-Air Bargain & Spice Bazaars", "market", ["street_market", "bargaining", "seafood"], Decimal("10.0"), Decimal("50.0"), 90, 35.7111, 139.7744, "Ueno 6-Chome, Taito", [], Decimal("4.69"), 490, Decimal("0.79")),
        ("Yanaka Ginza Nostalgic Retro Shopping Street", "shopping", ["retro", "cats", "artisan"], Decimal("15.0"), Decimal("35.0"), 75, 35.7278, 139.7681, "Yanaka, Taito", ["stroller_friendly"], Decimal("4.78"), 280, Decimal("0.86")),
        ("Kappabashi Kitchenware & Food Sample Safari", "shopping", ["kitchenware", "ceramics", "unique"], Decimal("20.0"), Decimal("100.0"), 120, 35.7130, 139.7890, "Matsugaya, Taito", [], Decimal("4.89"), 350, Decimal("0.92")),
        ("Jimbocho Antiquarian & Art Book Treasure Hunt", "shopping", ["books", "vintage", "prints"], Decimal("10.0"), Decimal("60.0"), 90, 35.6958, 139.7580, "Kanda Jimbocho, Chiyoda", [], Decimal("4.85"), 210, Decimal("0.88")),
        ("Nakano Broadway Underground Vintage Anime Bourse", "shopping", ["subculture", "vintage", "collectibles"], Decimal("15.0"), Decimal("80.0"), 105, 35.7088, 139.6658, "Nakano, Tokyo", ["elevator_access"], Decimal("4.75"), 410, Decimal("0.85")),

        # Nightlife & Evening
        ("Golden Gai Micro-Bar Architectural Crawl", "nightlife", ["micro_bars", "cocktails", "night"], Decimal("30.0"), Decimal("60.0"), 120, 35.6942, 139.7044, "Kabukicho 1-Chome, Shinjuku", [], Decimal("4.77"), 480, Decimal("0.84")),
        ("Roppongi Hills Mori Skydeck Midnight Panorama", "nightlife", ["view", "skyline", "modern"], Decimal("18.0"), Decimal("25.0"), 60, 35.6605, 139.7292, "Roppongi, Minato", ["wheelchair_accessible"], Decimal("4.83"), 550, Decimal("0.74")),
        ("Koenji Live Indie Punk & Jazz Basement", "nightlife", ["live_music", "indie", "underground"], Decimal("20.0"), Decimal("35.0"), 150, 35.7054, 139.6497, "Koenjiminami, Suginami", [], Decimal("4.81"), 120, Decimal("0.93")),
        ("Yurakucho Gado-shita Train Trestle Izakaya Row", "nightlife", ["train_tracks", "beer", "local_workers"], Decimal("20.0"), Decimal("35.0"), 90, 35.6748, 139.7634, "Yurakucho, Chiyoda", [], Decimal("4.70"), 260, Decimal("0.80")),
        ("Shibuya Nonbei Yokocho Drunkard's Alley Tour", "nightlife", ["intimate", "retro", "sake"], Decimal("25.0"), Decimal("45.0"), 75, 35.6601, 139.7019, "Shibuya 1-Chome, Shibuya", [], Decimal("4.73"), 220, Decimal("0.82")),

        # Wellness & Relaxation
        ("Historic Asakusa Sentō Public Bath Ritual", "wellness", ["onsen", "sento", "relaxation"], Decimal("5.0"), Decimal("8.0"), 60, 35.7160, 139.7940, "Asakusa, Taito", [], Decimal("4.76"), 190, Decimal("0.87")),
        ("Daikanyama Zen Rock Garden Tea Meditation", "wellness", ["zen", "tea", "minimalist"], Decimal("25.0"), Decimal("35.0"), 60, 35.6489, 139.7032, "Sarugakucho, Shibuya", ["wheelchair_accessible"], Decimal("4.86"), 85, Decimal("0.89")),
        ("Ryogoku Hinoki Cypress Aromatherapy Soak", "wellness", ["cypress", "soak", "detox"], Decimal("30.0"), Decimal("50.0"), 90, 35.6961, 139.7933, "Yokoami, Sumida", [], Decimal("4.82"), 70, Decimal("0.91")),

        # Tours & Hidden Perspectives
        ("Shibuya Underground Disaster Water Bunker Tour", "tour", ["infrastructure", "engineering", "secret"], Decimal("30.0"), Decimal("40.0"), 90, 35.6595, 139.7005, "Shibuya Deep Level", [], Decimal("4.94"), 110, Decimal("0.98")),
        ("Yanaka Cemetery & Meiji Literature Pilgrimage", "tour", ["literature", "cats", "quiet_walk"], Decimal("15.0"), Decimal("25.0"), 90, 35.7230, 139.7710, "Yanaka, Taito", ["step_free"], Decimal("4.75"), 130, Decimal("0.88")),
        ("Akihabara Vintage Radio Parts & PCB Hunt", "tour", ["electronics", "nerd_culture", "hardware"], Decimal("10.0"), Decimal("20.0"), 75, 35.6983, 139.7731, "Sotokanda, Chiyoda", [], Decimal("4.80"), 180, Decimal("0.92")),
        ("Tsukishima Monjayaki Street Cooking Stroll", "tour", ["foodie", "monjayaki", "waterfront"], Decimal("20.0"), Decimal("35.0"), 90, 35.6633, 139.7825, "Tsukishima, Chuo", ["stroller_friendly"], Decimal("4.71"), 210, Decimal("0.81")),
        ("Kagurazaka Geisha District Lantern Night Walk", "tour", ["lanterns", "cobblestones", "geisha_culture"], Decimal("25.0"), Decimal("40.0"), 80, 35.7018, 139.7408, "Kagurazaka, Shinjuku", [], Decimal("4.84"), 195, Decimal("0.89")),
        ("Oji Fox Shrine & Inari Folklore Expedition", "tour", ["folklore", "fox_shrine", "myths"], Decimal("10.0"), Decimal("15.0"), 75, 35.7533, 139.7347, "Kishimachi, Kita", [], Decimal("4.78"), 95, Decimal("0.93")),
        ("Shibaura Canal Night Photography Excursion", "outdoor", ["photography", "canal", "industrial_beauty"], Decimal("20.0"), Decimal("35.0"), 105, 35.6425, 139.7530, "Shibaura, Minato", ["tripod_friendly"], Decimal("4.87"), 110, Decimal("0.90")),
    ]

    # 40 Oaxaca Experiences
    oaxaca_items = [
        # Culture & Heritage
        ("Monte Albán Zapotec Pyramids Sunrise Tour", "culture", ["archaeology", "ruins", "zapotec"], Decimal("20.0"), Decimal("35.0"), 180, 17.0438, -96.7681, "Carretera a Monte Albán, Oaxaca", ["audio_guide"], Decimal("4.94"), 650, Decimal("0.90")),
        ("Santo Domingo Church & Ethnobotanical Garden Walk", "culture", ["baroque", "cactus", "botanical"], Decimal("8.0"), Decimal("12.0"), 90, 17.0658, -96.7233, "Macedonio Alcalá, Oaxaca Centro", ["wheelchair_accessible"], Decimal("4.92"), 580, Decimal("0.85")),
        ("Mitla Mosaic Palace of the Dead Excursion", "culture", ["ruins", "geometric_fretwork", "sacred"], Decimal("18.0"), Decimal("30.0"), 150, 16.9272, -96.3592, "San Pablo Villa de Mitla", [], Decimal("4.88"), 320, Decimal("0.92")),
        ("Teotitlán del Valle Weaver Community Meeting", "culture", ["textiles", "weaving", "zapotec_tradition"], Decimal("25.0"), Decimal("40.0"), 120, 17.0267, -96.5186, "Teotitlán del Valle, Oaxaca", ["stroller_friendly"], Decimal("4.96"), 240, Decimal("0.96")),
        ("San Bartolo Coyotepec Black Pottery Museum", "culture", ["pottery", "craft", "ancient_technique"], Decimal("5.0"), Decimal("10.0"), 75, 16.9536, -96.7083, "San Bartolo Coyotepec", ["wheelchair_accessible"], Decimal("4.79"), 170, Decimal("0.89")),

        # Workshops & Crafts
        ("San Martín Tilcajete Alebrije Carving & Painting", "workshop", ["woodcarving", "painting", "alebrijes"], Decimal("45.0"), Decimal("70.0"), 150, 16.8583, -96.6975, "San Martín Tilcajete", ["family_friendly"], Decimal("4.97"), 280, Decimal("0.97")),
        ("Traditional Mole Negro Masterclass with Doña Rosa", "workshop", ["cooking", "mole", "culinary_heritage"], Decimal("60.0"), Decimal("85.0"), 210, 17.0610, -96.7250, "Barrio de Jalatlaco, Oaxaca", [], Decimal("4.98"), 190, Decimal("0.95")),
        ("Cochineal & Wild Marigold Natural Dye Workshop", "workshop", ["natural_dyes", "wool", "hands_on"], Decimal("40.0"), Decimal("60.0"), 120, 17.0270, -96.5190, "Teotitlán del Valle", [], Decimal("4.93"), 140, Decimal("0.94")),
        ("Artisanal Cacao Roasting & Stone Metate Grinding", "workshop", ["chocolate", "metate", "ancient_cacao"], Decimal("30.0"), Decimal("45.0"), 90, 17.0633, -96.7217, "Calle Mina, Oaxaca Centro", ["wheelchair_accessible"], Decimal("4.90"), 210, Decimal("0.91")),
        ("Handmade Corn Tortilla & Salsa Molcajete Lesson", "workshop", ["tortillas", "nixtamal", "molcajete"], Decimal("25.0"), Decimal("35.0"), 75, 17.0590, -96.7280, "Barrio del Ex-Marquesado", [], Decimal("4.86"), 160, Decimal("0.88")),

        # Food & Gastronomy
        ("Mercado 20 de Noviembre Pasillo de Humo Smoke Hall", "food", ["tlayudas", "tasajo", "smoke_hall"], Decimal("10.0"), Decimal("25.0"), 60, 17.0583, -96.7247, "Calle 20 de Noviembre, Oaxaca", [], Decimal("4.89"), 720, Decimal("0.86")),
        ("Barrio de Jalatlaco Specialty Coffee & Pan Dulce", "food", ["coffee", "patio", "cobblestones"], Decimal("6.0"), Decimal("14.0"), 45, 17.0664, -96.7156, "Calle Aldama, Jalatlaco", ["wheelchair_accessible"], Decimal("4.82"), 260, Decimal("0.80")),
        ("Ancestral Clay-Pot Mezcal Tasting with Mezcalier", "food", ["mezcal", "ancestral", "tasting"], Decimal("35.0"), Decimal("55.0"), 90, 17.0645, -96.7240, "Calle García Vigil, Centro", [], Decimal("4.95"), 310, Decimal("0.93")),
        ("Crispy Grasshopper (Chapulines) & Quesillo Pairing", "food", ["exotic", "quesillo", "chapulines"], Decimal("8.0"), Decimal("15.0"), 45, 17.0595, -96.7252, "Mercado Benito Juárez", [], Decimal("4.73"), 290, Decimal("0.84")),
        ("Rooftop Tlayuda & Craft Cerveza Tasting", "food", ["rooftop", "tlayudas", "sunset"], Decimal("15.0"), Decimal("30.0"), 75, 17.0625, -96.7260, "Murguía 104, Centro", ["stroller_friendly"], Decimal("4.85"), 340, Decimal("0.82")),

        # Outdoor & Nature
        ("Hierve el Agua Petrified Waterfall & Infinity Pools", "outdoor", ["mineral_springs", "geology", "swimming"], Decimal("25.0"), Decimal("45.0"), 240, 16.8661, -96.2758, "San Isidro Roaguía, Oaxaca", [], Decimal("4.88"), 520, Decimal("0.91")),
        ("Sierra Norte Cloud Forest Hiking & Suspension Bridge", "outdoor", ["cloud_forest", "ecotourism", "hiking"], Decimal("40.0"), Decimal("65.0"), 300, 17.1333, -96.5333, "Pueblos Mancomunados", [], Decimal("4.93"), 170, Decimal("0.96")),
        ("El Tule 2000-Year-Old Giant Montezuma Tree", "outdoor", ["ancient_tree", "sacred", "nature"], Decimal("2.0"), Decimal("5.0"), 45, 17.0469, -96.6358, "Santa María del Tule", ["wheelchair_accessible"], Decimal("4.74"), 380, Decimal("0.75")),
        ("Dainzú Archaic Ball Court & Petroglyphs Walk", "outdoor", ["archaeology", "quiet", "ballgame"], Decimal("10.0"), Decimal("18.0"), 90, 17.0042, -96.5564, "Tlacolula Valley, Oaxaca", [], Decimal("4.81"), 90, Decimal("0.93")),
        ("Llano Grande Pine Mountain Biking Trails", "outdoor", ["mtb", "pine_forest", "active"], Decimal("35.0"), Decimal("55.0"), 180, 17.1833, -96.4833, "Sierra de Juárez", [], Decimal("4.87"), 85, Decimal("0.92")),

        # Market & Shopping (barter & capacity relevant)
        ("Mercado Benito Juárez Artisan & Leather Stalls", "market", ["bazaar", "leather", "baskets"], Decimal("10.0"), Decimal("60.0"), 90, 17.0592, -96.7248, "Las Casas, Oaxaca Centro", ["crowded"], Decimal("4.80"), 480, Decimal("0.83")),
        ("Tlacolula Sunday Indigenous Market (Ancient Tianguis)", "market", ["indigenous", "sunday_market", "barter"], Decimal("15.0"), Decimal("50.0"), 150, 16.9547, -96.4789, "Tlacolula de Matamoros", [], Decimal("4.96"), 410, Decimal("0.98")),
        ("Oaxaca Textile Museum & Sustainable Weaver Fair", "shopping", ["fair_trade", "museum", "sustainable"], Decimal("15.0"), Decimal("70.0"), 75, 17.0608, -96.7219, "Hidalgo 917, Centro", ["wheelchair_accessible"], Decimal("4.91"), 230, Decimal("0.90")),
        ("Central de Abastos Vintage & Ephemera Corner", "shopping", ["flea_market", "antiques", "bargains"], Decimal("5.0"), Decimal("40.0"), 90, 17.0570, -96.7350, "Periférico Sur, Oaxaca", [], Decimal("4.68"), 190, Decimal("0.87")),
        ("Xochimilco Neighborhood Pottery Boutiques", "shopping", ["ceramics", "neighborhood", "boutiques"], Decimal("20.0"), Decimal("80.0"), 75, 17.0730, -96.7240, "Barrio de Xochimilco", ["stroller_friendly"], Decimal("4.84"), 140, Decimal("0.89")),

        # Nightlife & Evening
        ("Plaza de la Danza Live Marimba & Danzón Evening", "nightlife", ["marimba", "dance", "community"], Decimal("0.0"), Decimal("5.0"), 90, 17.0617, -96.7289, "Plaza de la Danza, Centro", ["wheelchair_accessible"], Decimal("4.87"), 320, Decimal("0.86")),
        ("Secret Speakeasy Mezcalería Behind a Bookshelf", "nightlife", ["cocktails", "speakeasy", "mezcal"], Decimal("20.0"), Decimal("40.0"), 105, 17.0650, -96.7225, "Calle 5 de Mayo, Centro", [], Decimal("4.92"), 210, Decimal("0.94")),
        ("Teatro Macedonio Alcalá Classical Concert", "nightlife", ["theatre", "architecture", "opera"], Decimal("15.0"), Decimal("35.0"), 120, 17.0614, -96.7228, "Independencia 900, Centro", ["wheelchair_accessible"], Decimal("4.89"), 175, Decimal("0.84")),
        ("Zócalo Brass Band & Night Street Corn Gathering", "nightlife", ["band", "esquites", "street_life"], Decimal("5.0"), Decimal("12.0"), 75, 17.0603, -96.7256, "Zócalo de Oaxaca", ["step_free"], Decimal("4.79"), 440, Decimal("0.78")),
        ("Botanical Mezcal Garden Moonlit Tasting", "nightlife", ["garden", "cocktails", "romantic"], Decimal("25.0"), Decimal("45.0"), 90, 17.0670, -96.7210, "Reforma, Oaxaca", [], Decimal("4.86"), 160, Decimal("0.88")),

        # Wellness & Relaxation
        ("Traditional Zapotec Temazcal Sweat Lodge & Herb Bath", "wellness", ["temazcal", "herbal", "detox"], Decimal("50.0"), Decimal("80.0"), 120, 17.0350, -96.6980, "San Antonio de la Cal", [], Decimal("4.95"), 150, Decimal("0.97")),
        ("Copal & Flower Water Spiritual Cleansing (Limpia)", "wellness", ["spiritual", "limpia", "curandera"], Decimal("25.0"), Decimal("40.0"), 60, 17.0598, -96.7245, "Barrio de la Soledad", [], Decimal("4.88"), 110, Decimal("0.95")),
        ("Agave Honey & Clay Mineral Facial Therapy", "wellness", ["spa", "honey", "clay"], Decimal("40.0"), Decimal("65.0"), 75, 17.0655, -96.7190, "Jalatlaco Wellness Center", ["quiet_space"], Decimal("4.83"), 75, Decimal("0.89")),

        # Tours & Hidden Perspectives
        ("Callejón del Muerto Ghost & Legend Lantern Tour", "tour", ["legends", "night_walk", "history"], Decimal("15.0"), Decimal("22.0"), 75, 17.0638, -96.7230, "Barrio del Carmen Alto", [], Decimal("4.78"), 185, Decimal("0.87")),
        ("Agave Country Bicycle Tour Among Blue Agaves", "tour", ["cycling", "agave", "countryside"], Decimal("35.0"), Decimal("50.0"), 180, 16.9600, -96.4800, "Santiago Matatlán", [], Decimal("4.91"), 130, Decimal("0.93")),
        ("Street Art Murals of Jalatlaco Photographic Safari", "tour", ["street_art", "photography", "murals"], Decimal("15.0"), Decimal("25.0"), 80, 17.0660, -96.7160, "Barrio de Jalatlaco", ["stroller_friendly"], Decimal("4.86"), 220, Decimal("0.85")),
        ("Underground Aqueducts of San Felipe del Agua", "tour", ["aqueduct", "historic_water", "hike"], Decimal("12.0"), Decimal("20.0"), 90, 17.0980, -96.7110, "San Felipe del Agua", [], Decimal("4.80"), 95, Decimal("0.91")),
        ("Yagul Fortress & Prehistoric Caves of Mitla", "tour", ["caves", "rock_art", "unesco"], Decimal("25.0"), Decimal("40.0"), 150, 16.9560, -96.5050, "Valle de Tlacolula", [], Decimal("4.94"), 120, Decimal("0.97")),
        ("Mezcal Palenque Still Distillation Immersion", "tour", ["distillery", "fermentation", "palenque"], Decimal("40.0"), Decimal("60.0"), 180, 16.8600, -96.4200, "San Dionisio Ocotepec", [], Decimal("4.96"), 210, Decimal("0.96")),
        ("Zaachila Underground Zapotec Tomb Discovery", "tour", ["tombs", "zapotec", "off_beaten_path"], Decimal("15.0"), Decimal("25.0"), 105, 16.9530, -96.7490, "Villa de Zaachila", [], Decimal("4.85"), 85, Decimal("0.92")),
    ]

    # Combine Tokyo and Oaxaca items
    all_raw = [("Tokyo", "Japan", *item) for item in tokyo_items] + [("Oaxaca", "Mexico", *item) for item in oaxaca_items]

    for idx, (city, country, title, cat, tags, p_min, p_max, dur, lat, lng, addr, a11y, r_avg, r_cnt, uniq) in enumerate(all_raw):
        exp_id = f"22222222-0000-0000-{idx//100:04d}-{(idx%100)+1:012d}"
        experiences.append({
            "id": exp_id,
            "provider_id": None,
            "title": title,
            "description": f"Immerse yourself in {title}, an authentic {cat} experience nestled in {city}, {country}. Curated with local insight for deep cultural immersion.",
            "category": cat,
            "tags": tags,
            "price_min": p_min,
            "price_max": p_max,
            "currency": "USD",
            "duration_minutes": dur,
            "lat": lat,
            "lng": lng,
            "address": addr,
            "city": city,
            "country": country,
            "opening_hours": {"mon_sun": "09:00-19:00"},
            "capacity": 12 if "workshop" in cat or "tour" in cat else 40,
            "accessibility_tags": a11y,
            "rating_avg": r_avg,
            "rating_count": r_cnt,
            "uniqueness_score": uniq,
            "is_active": True,
            "source": "seed",
        })

    return experiences


SEED_EXPERIENCES = generate_seed_experiences()


def seed_database_sync(session) -> Dict[str, int]:
    """Populate database synchronously with seed experiences and market valuations."""
    from app.models import Experience, MarketValuation
    from sqlalchemy import select

    existing_exp = session.scalar(select(Experience.id).limit(1))
    if existing_exp:
        return {"status": "already_seeded", "experiences": 0, "market_valuations": 0}

    mv_count = 0
    for mv in SEED_MARKET_VALUATIONS:
        row = MarketValuation(
            id=uuid.UUID(mv["id"]),
            item_name=mv["item_name"],
            category=mv["category"],
            location_country=mv["location_country"],
            location_city=mv["location_city"],
            currency=mv["currency"],
            fair_market_value=mv["fair_market_value"],
            suggested_opening_bid=mv["suggested_opening_bid"],
            estimated_weight_kg=mv["estimated_weight_kg"],
            valuation_source=mv["valuation_source"],
            confidence_score=mv["confidence_score"],
            bargaining_phrases=mv["bargaining_phrases"],
        )
        session.add(row)
        mv_count += 1

    exp_count = 0
    for exp in SEED_EXPERIENCES:
        row = Experience(
            id=uuid.UUID(exp["id"]),
            provider_id=None,
            title=exp["title"],
            description=exp["description"],
            category=exp["category"],
            tags=exp["tags"],
            price_min=exp["price_min"],
            price_max=exp["price_max"],
            currency=exp["currency"],
            duration_minutes=exp["duration_minutes"],
            lat=exp["lat"],
            lng=exp["lng"],
            address=exp["address"],
            city=exp["city"],
            country=exp["country"],
            opening_hours=exp["opening_hours"],
            capacity=exp["capacity"],
            accessibility_tags=exp["accessibility_tags"],
            rating_avg=exp["rating_avg"],
            rating_count=exp["rating_count"],
            uniqueness_score=exp["uniqueness_score"],
            is_active=exp["is_active"],
            source=exp["source"],
        )
        session.add(row)
        exp_count += 1

    session.commit()
    return {"status": "success", "experiences": exp_count, "market_valuations": mv_count}


async def seed_database(session) -> Dict[str, int]:
    """Populate database asynchronously (or synchronously) with seed experiences and market valuations."""
    # Check if session is sync Session or AsyncSession
    if not hasattr(session, "execute"):
        return seed_database_sync(session)
    import inspect
    if not inspect.iscoroutinefunction(session.scalar) and not inspect.iscoroutinefunction(session.execute):
        return seed_database_sync(session)

    from app.models import Experience, MarketValuation
    from sqlalchemy import select

    existing_exp = await session.scalar(select(Experience.id).limit(1))
    if existing_exp:
        return {"status": "already_seeded", "experiences": 0, "market_valuations": 0}

    mv_count = 0
    for mv in SEED_MARKET_VALUATIONS:
        row = MarketValuation(
            id=uuid.UUID(mv["id"]),
            item_name=mv["item_name"],
            category=mv["category"],
            location_country=mv["location_country"],
            location_city=mv["location_city"],
            currency=mv["currency"],
            fair_market_value=mv["fair_market_value"],
            suggested_opening_bid=mv["suggested_opening_bid"],
            estimated_weight_kg=mv["estimated_weight_kg"],
            valuation_source=mv["valuation_source"],
            confidence_score=mv["confidence_score"],
            bargaining_phrases=mv["bargaining_phrases"],
        )
        session.add(row)
        mv_count += 1

    exp_count = 0
    for exp in SEED_EXPERIENCES:
        row = Experience(
            id=uuid.UUID(exp["id"]),
            provider_id=None,
            title=exp["title"],
            description=exp["description"],
            category=exp["category"],
            tags=exp["tags"],
            price_min=exp["price_min"],
            price_max=exp["price_max"],
            currency=exp["currency"],
            duration_minutes=exp["duration_minutes"],
            lat=exp["lat"],
            lng=exp["lng"],
            address=exp["address"],
            city=exp["city"],
            country=exp["country"],
            opening_hours=exp["opening_hours"],
            capacity=exp["capacity"],
            accessibility_tags=exp["accessibility_tags"],
            rating_avg=exp["rating_avg"],
            rating_count=exp["rating_count"],
            uniqueness_score=exp["uniqueness_score"],
            is_active=exp["is_active"],
            source=exp["source"],
        )
        session.add(row)
        exp_count += 1

    await session.commit()
    return {"status": "success", "experiences": exp_count, "market_valuations": mv_count}
