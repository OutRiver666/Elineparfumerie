import { StorefrontContent } from "@/types/storefront-content";

export const DEFAULT_STOREFRONT_CONTENT: StorefrontContent = {
  themeId: "atelier-ivoire",
  hero: {
    badgeFr: "Haute Parfumerie Artisanale d'Algérie",
    badgeAr: "صناعة عطور يدوية فاخرة في الجزائر",
    titleFr: "L'Élégance Vient du Cœur, l'Essence d'Éline",
    titleAr: "الأناقة تنبع من القلب، وعبير إيلين يأسر الروح",
    subtitleFr:
      "Des compositions olfactives d'exception créées avec des essences pures. Choisissez vos fragrances au détail ou composez votre coffret sur-mesure de 3 flacons.",
    subtitleAr:
      "تركيبات عطرية استثنائية مُستخلصة من أنقى الزيوت الطبيعية. تسوقوا عطوركم المفضلة بالحبة أو صمموا باقتكم الفاخرة المكونة من 3 زجاجات.",
    primaryBtnTextFr: "Explorer le Catalogue",
    primaryBtnTextAr: "تصفح العطور",
    primaryBtnLink: "/shop",
    secondaryBtnTextFr: "Créer Mon Coffret (-15%)",
    secondaryBtnTextAr: "صمّم باقتك (-15%)",
    secondaryBtnLink: "/packs/builder",
    imageUrl:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=85&w=1200",
    floatingBadgeTopFr: "Sillage Signature",
    floatingBadgeTopAr: "عطر الموسم",
    floatingBadgeTitleFr: "Oud Royal — X8",
    floatingBadgeTitleAr: "عود ملكي — X8",
    floatingBadgeSubFr: "Extrait Intense 50ml",
    floatingBadgeSubAr: "خلاصة عود فاخرة 50مل",
  },
  gender: {
    headerTagFr: "Collections Essentielles",
    headerTagAr: "تصفح حسب الفئة",
    headerTitleFr: "Une Signature Pour Chaque Présence",
    headerTitleAr: "اختر العطر المناسب لشخصيتك",
    men: {
      tagFr: "Pour Homme",
      tagAr: "تشكيلة الرجال",
      titleFr: "Parfums Homme",
      titleAr: "عطور رجالية",
      subtitleFr: "Boisés profonds & accords cuirés",
      subtitleAr: "أخشاب نبيلة وجلود معتقة",
      imageUrl:
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800",
      link: "/shop?gender=men",
    },
    women: {
      tagFr: "Pour Femme",
      tagAr: "تشكيلة النساء",
      titleFr: "Parfums Femme",
      titleAr: "عطور نسائية",
      subtitleFr: "Floraux solaires & muscs soyeux",
      subtitleAr: "زهور نادرة وعبير حريري",
      imageUrl:
        "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800",
      link: "/shop?gender=women",
    },
    unisex: {
      tagFr: "Unisexe",
      tagAr: "تشكيلة للجنسين",
      titleFr: "Parfums Mixtes",
      titleAr: "عطور للجنسين",
      subtitleFr: "Orientaux rares & ambres mystiques",
      subtitleAr: "شرقيات وعنبر وروح العود",
      imageUrl:
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
      link: "/shop?gender=unisex",
    },
  },
  seasons: {
    headerTagFr: "Harmonies Saisonnières",
    headerTagAr: "تناغم الفصول الأربعة",
    headerTitleFr: "La Symphonie des 4 Saisons",
    headerTitleAr: "سيمفونية الفصول الأربعة",
    spring: {
      key: "spring",
      nameFr: "Printemps",
      nameAr: "الربيع",
      subtitleFr: "Éclosion Florale & Renaissance",
      subtitleAr: "عبير الأزهار والنضارة المتجددة",
      descriptionFr:
        "Fraîcheur délicate de néroli lumineux, pivoines soyeuses et rosée matinale.",
      descriptionAr: "نفحات زهرية رقيقة مع نيرولي كالابريا وندى الصباح العذب.",
      accordsFr: "Néroli • Pivoine • Rosée",
      accordsAr: "نيرولي • بيوني • ندى الزهور",
      badgeFr: "Sillage Floral & Délicat",
      badgeAr: "عبير زهري منعش",
      imageUrl:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000",
    },
    summer: {
      key: "summer",
      nameFr: "Été",
      nameAr: "الصيف",
      subtitleFr: "Fraîcheur Solaire & Brise Azurée",
      subtitleAr: "انتعاش الحمضيات ونسيم البحر الأبيض",
      descriptionFr:
        "Agrumes pétillants de Méditerranée, embruns marins et légèreté absolue.",
      descriptionAr: "حمضيات إيطالية متألقة، رذاذ البحر الأبيض الصافي وأناقة صيفية.",
      accordsFr: "Bergamote • Cédrat • Brise Marine",
      accordsAr: "برغموت • ليمون • نسيم البحر",
      badgeFr: "Vigueur & Agrumes Solaires",
      badgeAr: "طاقة وحمضيات متألقة",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000",
    },
    autumn: {
      key: "autumn",
      nameFr: "Automne",
      nameAr: "الخريف",
      subtitleFr: "Bois Précieux & Épices Envoûtantes",
      subtitleAr: "دفء الأخشاب والتوابل الشرقية الساحرة",
      descriptionFr:
        "Santal crémeux, cardamome noire, fève tonka et feuilles d'ambre dorées.",
      descriptionAr: "خشب الصندل النبيل، هيل شرقي معتق ودفء شاعري للمساء.",
      accordsFr: "Santal • Cardamome • Cèdre",
      accordsAr: "صندل • هيل • خشب الأرز",
      badgeFr: "Épices & Accords Boisés",
      badgeAr: "توابل وأخشاب نبيلة",
      imageUrl:
        "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=1000",
    },
    winter: {
      key: "winter",
      nameFr: "Hiver",
      nameAr: "الشتاء",
      subtitleFr: "Sillage Majestueux, Oud & Ambre",
      subtitleAr: "فوحان مهيب، عود ملكي وعنبر أسود دافئ",
      descriptionFr:
        "Bois de oud royal X8, ambre gris envoûtant, cuir impérial et sillage captivant.",
      descriptionAr: "عود كمبودي ملكي مكثف، عنبر أصيل وجلود فاخرة تدوم طويلاً.",
      accordsFr: "Oud Royal • Ambre Gris • Cuir",
      accordsAr: "عود ملكي • عنبر أصيل • جلد ناعم",
      badgeFr: "Intensité X4 & X8",
      badgeAr: "تركيز مكثف وثبات عالي",
      imageUrl:
        "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&q=80&w=1000",
    },
  },
  collections: {
    headerTagFr: "Thématiques & Accords",
    headerTagAr: "مجموعات دورية",
    headerTitleFr: "Nos Collections Signatures",
    headerTitleAr: "تصفح حسب المجموعات",
    linkTextFr: "Voir les collections",
    linkTextAr: "كل المجموعات",
    linkUrl: "/collections",
    card1: {
      tagFr: "Édition N°1 — Boisés & Orientaux",
      tagAr: "الإصدار الأول — شرقيات وأخشاب",
      titleFr: "Sillage Impérial",
      titleAr: "الفوحان الإمبراطوري",
      descriptionFr:
        "Une alliance somptueuse de oud rare, d'encens noir et de cuir pour une présence inoubliable.",
      descriptionAr:
        "مزيج فاخر من العود النادر والبخور الأسود والجلود الفاخرة لحضور لا يُنسى.",
      imageUrl:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200",
      linkUrl: "/collections",
    },
    card2: {
      tagFr: "Édition N°2 — Floraux Lumineux",
      tagAr: "الإصدار الثاني — أزهار نادرة",
      titleFr: "Jardin de Soie",
      titleAr: "حديقة الحرير",
      descriptionFr:
        "Pétales de rose de Damas, jasmin solaire et musc blanc pur créant une aura de grâce.",
      descriptionAr:
        "بتلات الورد الدمشقي، والياسمين الشمسي والمسك الأبيض لنفحات مليئة بالرقة والجمال.",
      imageUrl:
        "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200",
      linkUrl: "/collections",
    },
  },
  customPack: {
    badgeFr: "Coffret Sur-Mesure",
    badgeAr: "صندوق مخصص حسب الرغبة",
    titleFr: "Créez votre propre coffret signature de 3 flacons",
    titleAr: "صمم باقتك الخاصة المكونة من 3 زجاجات عطر",
    descriptionFr:
      "Créez votre propre coffret signature en choisissant vos 3 parfums favoris dans les formats de votre choix. Profitez d'une tarification préférentielle et d'un packaging haut de gamme.",
    descriptionAr:
      "اختر 3 عطور من تشكيلتك المفضلة، وحدد أحجام القوارير التي تناسبك، واحصل على صندوق فاخر مع تسعيرة توفيرية خاصة وتوصيل مضمون.",
    step1Fr: "Sélectionnez 3 fragrances au choix parmi toute la collection",
    step1Ar: "اختر 3 عطور من تشكيلة إيلين الراقية",
    step2Fr: "Choisissez le format idéal pour chaque flacon (25ml, 50ml ou 100ml)",
    step2Ar: "حدد الحجم المناسب لكل قارورة (25مل، 50مل أو 100مل)",
    step3Fr: "Bénéficiez automatiquement d'une réduction spéciale de -15%",
    step3Ar: "استفد تلقائياً من تخفيض خاص 15% وتغليف إهدائي فاخر",
    btnTextFr: "Composer mon coffret maintenant",
    btnTextAr: "ابدأ تصميم باقتك الآن",
    btnLink: "/packs/builder",
    imageUrl:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000",
  },
};

/**
 * Curated Luxury Fragrance Image Presets for Quick Selection in Admin
 */
export const CURATED_IMAGE_PRESETS = {
  hero: [
    {
      title: "Flacon Noir & Or (Oud)",
      url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=85&w=1200",
    },
    {
      title: "Parfum sur Marbre Élégant",
      url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=85&w=1200",
    },
    {
      title: "Atelier Haute Joaillerie",
      url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=85&w=1200",
    },
    {
      title: "Essence Royale Sombre",
      url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=85&w=1200",
    },
    {
      title: "Minimaliste Moderne",
      url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=85&w=1200",
    },
  ],
  gender: [
    {
      title: "Homme — Boisé & Mystère",
      url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Homme — Cuir & Caractère",
      url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Femme — Floral Soyeux",
      url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Femme — Rose & Poudre d'Or",
      url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Unisexe — Flacon Pur & Ambre",
      url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Unisexe — Essences Nobles",
      url: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800",
    },
  ],
  seasons: {
    spring: [
      {
        title: "Printemps — Fleurs & Pétales",
        url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000",
      },
      {
        title: "Printemps — Rose Délicate",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000",
      },
    ],
    summer: [
      {
        title: "Été — Plage & Méditerranée",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000",
      },
      {
        title: "Été — Agrumes & Soleil",
        url: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&q=80&w=1000",
      },
    ],
    autumn: [
      {
        title: "Automne — Bois & Feuilles Dorées",
        url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=1000",
      },
      {
        title: "Automne — Épices & Ambre Chaud",
        url: "https://images.unsplash.com/photo-1507371341162-763b5e419408?auto=format&fit=crop&q=80&w=1000",
      },
    ],
    winter: [
      {
        title: "Hiver — Ambre Profond & Glace",
        url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&q=80&w=1000",
      },
      {
        title: "Hiver — Nuit Mystique & Oud",
        url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&q=80&w=1000",
      },
    ],
  },
};
