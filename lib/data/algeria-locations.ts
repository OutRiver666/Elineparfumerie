/**
 * Official Algeria Administrative Divisions (Wilayas & Communes) - Updated for 2026
 * Source: https://github.com/Kenandarabeh/algeria-wilayas-communes-2026
 * 
 * Includes all 69 Wilayas (58 standard + 11 delegated/promoted) and 1,600+ Communes.
 */

export interface Commune {
  fr: string;
  ar: string;
  postCode?: string;
}

export interface Wilaya {
  code: string;
  name_fr: string;
  name_ar: string;
  deliveryFeeDZD: number;
  communes: Commune[];
}

/**
 * Maps newly created delegated wilayas (59-69) to parent wilayas if required by legacy carrier APIs
 */
export function getEcoTrackWilayaCode(wilayaCode: string | number): number {
  const code = typeof wilayaCode === "string" ? parseInt(wilayaCode, 10) : wilayaCode;
  if (!code || isNaN(code)) return 16;
  const parentMapping: Record<number, number> = {
    59: 3,  // Aflou -> Laghouat
    60: 5,  // Barika -> Batna
    61: 7,  // El Kantara -> Biskra
    62: 12, // Bir El Ater -> Tébessa
    63: 13, // El Aricha -> Tlemcen
    64: 14, // Ksar Chellala -> Tiaret
    65: 17, // Aïn Oussera -> Djelfa
    66: 17, // Messad -> Djelfa
    67: 26, // Ksar El Boukhari -> Médéa
    68: 28, // Bou Saada -> M'Sila
    69: 32, // El Abiodh Sidi Cheikh -> El Bayadh
  };
  return parentMapping[code] || code;
}

export function getWilayaByCode(code: string | number | undefined | null): Wilaya | undefined {
  if (!code) return undefined;
  const str = String(code).trim();
  const numMatch = str.match(/\d+/);
  if (numMatch) {
    const padded = numMatch[0].padStart(2, "0");
    const found = ALGERIA_WILAYAS.find((w) => w.code === padded);
    if (found) return found;
  }
  const lower = str.toLowerCase();
  return ALGERIA_WILAYAS.find(
    (w) => w.name_fr.toLowerCase() === lower || w.name_ar === str
  );
}

export const ALGERIA_WILAYAS: Wilaya[] = [
  {
    "code": "01",
    "name_fr": "Adrar",
    "name_ar": "أدرار",
    "deliveryFeeDZD": 950,
    "communes": [
      {
        "fr": "Adrar",
        "ar": "أدرار",
        "postCode": "01001"
      },
      {
        "fr": "Akabli",
        "ar": "أقبلي",
        "postCode": "01019"
      },
      {
        "fr": "Aoulef",
        "ar": "أولف",
        "postCode": "01012"
      },
      {
        "fr": "Bouda",
        "ar": "بودة",
        "postCode": "01022"
      },
      {
        "fr": "Fenoughil",
        "ar": "فنوغيل",
        "postCode": "01015"
      },
      {
        "fr": "In Zghmir",
        "ar": "ان زغمير",
        "postCode": "01005"
      },
      {
        "fr": "Ouled Ahmed Tammi",
        "ar": "أولاد أحمد تيمى",
        "postCode": "01021"
      },
      {
        "fr": "Reggane",
        "ar": "رڨان",
        "postCode": "01004"
      },
      {
        "fr": "Sali",
        "ar": "سالى",
        "postCode": "01018"
      },
      {
        "fr": "Sbaa",
        "ar": "السبع",
        "postCode": "01026"
      },
      {
        "fr": "Tamentit",
        "ar": "تامنطيت",
        "postCode": "01014"
      },
      {
        "fr": "Tamest",
        "ar": "تأماست",
        "postCode": "01002"
      },
      {
        "fr": "Timokten",
        "ar": "تيمقتن",
        "postCode": "01013"
      },
      {
        "fr": "Tit",
        "ar": "تــيـــت",
        "postCode": "01006"
      },
      {
        "fr": "Tsabit",
        "ar": "تسابيت",
        "postCode": "01008"
      },
      {
        "fr": "Zaouiet Kounta",
        "ar": "زاوية كنتة",
        "postCode": "01011"
      }
    ]
  },
  {
    "code": "02",
    "name_fr": "Chlef",
    "name_ar": "الشلف",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Abou El Hassen",
        "ar": "أبو الحسن",
        "postCode": "02022"
      },
      {
        "fr": "Ain Merane",
        "ar": "عين مران",
        "postCode": "02032"
      },
      {
        "fr": "Benairia",
        "ar": "بنايرية",
        "postCode": "02003"
      },
      {
        "fr": "Beni Bouateb",
        "ar": "بني بوعتاب",
        "postCode": "02035"
      },
      {
        "fr": "Beni Haoua",
        "ar": "بني حواء",
        "postCode": "02007"
      },
      {
        "fr": "Beni Rached",
        "ar": "بني راشد",
        "postCode": "02013"
      },
      {
        "fr": "Boukadir",
        "ar": "بوقدير",
        "postCode": "02012"
      },
      {
        "fr": "Bouzghaia",
        "ar": "بوزغاية",
        "postCode": "02031"
      },
      {
        "fr": "Breira",
        "ar": "بريرة",
        "postCode": "02034"
      },
      {
        "fr": "Chettia",
        "ar": "الشطية",
        "postCode": "02024"
      },
      {
        "fr": "Chlef",
        "ar": "الشلف",
        "postCode": "02001"
      },
      {
        "fr": "Dahra",
        "ar": "الظهرة",
        "postCode": "02017"
      },
      {
        "fr": "El Hadjadj",
        "ar": "الحجاج",
        "postCode": "02027"
      },
      {
        "fr": "El Karimia",
        "ar": "الكريمية",
        "postCode": "02004"
      },
      {
        "fr": "El Marsa",
        "ar": "المرصى",
        "postCode": "02023"
      },
      {
        "fr": "Harchoun",
        "ar": "حرشون",
        "postCode": "02009"
      },
      {
        "fr": "Herenfa",
        "ar": "الهرنفة",
        "postCode": "02015"
      },
      {
        "fr": "Labiod Medjadja",
        "ar": "الأبيض مجاجة",
        "postCode": "02028"
      },
      {
        "fr": "Moussadek",
        "ar": "مصدق",
        "postCode": "02026"
      },
      {
        "fr": "Oued Fodda",
        "ar": "واد الفضة",
        "postCode": "02029"
      },
      {
        "fr": "Oued Goussine",
        "ar": "واد ڨوسين",
        "postCode": "02016"
      },
      {
        "fr": "Oued Sly",
        "ar": "واد سلي",
        "postCode": "02021"
      },
      {
        "fr": "Ouled Abbes",
        "ar": "أولاد عباس",
        "postCode": "02018"
      },
      {
        "fr": "Ouled Ben Abdelkader",
        "ar": "أولاد بن عبد القادر",
        "postCode": "02030"
      },
      {
        "fr": "Ouled Fares",
        "ar": "أولاد فارس",
        "postCode": "02010"
      },
      {
        "fr": "Oum Drou",
        "ar": "أم الذروع",
        "postCode": "02033"
      },
      {
        "fr": "Sendjas",
        "ar": "سنجاس",
        "postCode": "02019"
      },
      {
        "fr": "Sidi Abderrahmane",
        "ar": "سيدي عبد الرحمان",
        "postCode": "02025"
      },
      {
        "fr": "Sidi Akacha",
        "ar": "سيدي عكاشة",
        "postCode": "02011"
      },
      {
        "fr": "Sobha",
        "ar": "صبحة",
        "postCode": "02008"
      },
      {
        "fr": "Tadjna",
        "ar": "تاجنة",
        "postCode": "02005"
      },
      {
        "fr": "Talassa",
        "ar": "تلعصة",
        "postCode": "02014"
      },
      {
        "fr": "Taougrite",
        "ar": "تاوقريت",
        "postCode": "02006"
      },
      {
        "fr": "Tenes",
        "ar": "تنس",
        "postCode": "02002"
      },
      {
        "fr": "Zeboudja",
        "ar": "الزبوجة",
        "postCode": "02020"
      }
    ]
  },
  {
    "code": "03",
    "name_fr": "Laghouat",
    "name_ar": "الأغواط",
    "deliveryFeeDZD": 850,
    "communes": [
      {
        "fr": "Ain Mahdi",
        "ar": "عــيــن مـــاضــي",
        "postCode": "03007"
      },
      {
        "fr": "Benacer Ben Chohra",
        "ar": "بن ناصر بن شهرة",
        "postCode": "03003"
      },
      {
        "fr": "El Assafia",
        "ar": "العسافية",
        "postCode": "03020"
      },
      {
        "fr": "El Haouaita",
        "ar": "الهوارية",
        "postCode": "03023"
      },
      {
        "fr": "El Kheneg",
        "ar": "الخنق",
        "postCode": "03009"
      },
      {
        "fr": "Hadj Mechri",
        "ar": "الحاج المشري",
        "postCode": "03015"
      },
      {
        "fr": "Hassi Delaa",
        "ar": "حاسي دلاعة",
        "postCode": "03005"
      },
      {
        "fr": "Hassi R'Mel",
        "ar": "حاسي الرمل",
        "postCode": "03006"
      },
      {
        "fr": "Ksar El Hirane",
        "ar": "قصر الحيران",
        "postCode": "03002"
      },
      {
        "fr": "Laghouat",
        "ar": "الأغواط",
        "postCode": "03001"
      },
      {
        "fr": "Oued M'Zi",
        "ar": "وادي مزي",
        "postCode": "03022"
      },
      {
        "fr": "Sidi Makhlouf",
        "ar": "سيدي مخلوف",
        "postCode": "03004"
      },
      {
        "fr": "Tadjmout",
        "ar": "تاجموت",
        "postCode": "03008"
      },
      {
        "fr": "Tadjrouna",
        "ar": "تاجرونة",
        "postCode": "03018"
      },
      {
        "fr": "Taouiala",
        "ar": "تاويالة",
        "postCode": "03017"
      }
    ]
  },
  {
    "code": "04",
    "name_fr": "Oum El Bouaghi",
    "name_ar": "أم البواقي",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Babouche",
        "ar": "عين بابوش",
        "postCode": "04008"
      },
      {
        "fr": "Ain Beida",
        "ar": "عين البيضاء",
        "postCode": "04002"
      },
      {
        "fr": "Ain Diss",
        "ar": "عين الديس",
        "postCode": "04015"
      },
      {
        "fr": "Ain Fekroune",
        "ar": "عين فكرون",
        "postCode": "04025"
      },
      {
        "fr": "Ain Kercha",
        "ar": "عين كرشة",
        "postCode": "04012"
      },
      {
        "fr": "Ain M'lila",
        "ar": "عين مليلة",
        "postCode": "04003"
      },
      {
        "fr": "Ain Zitoun",
        "ar": "عين الزيتون",
        "postCode": "04027"
      },
      {
        "fr": "Behir Chergui",
        "ar": "بحير الشرڨي",
        "postCode": "04004"
      },
      {
        "fr": "Berriche",
        "ar": "بريش",
        "postCode": "04009"
      },
      {
        "fr": "Bir Chouhada",
        "ar": "بئر الشهداء",
        "postCode": "04021"
      },
      {
        "fr": "Dhala",
        "ar": "الضلعة",
        "postCode": "04011"
      },
      {
        "fr": "El Amiria",
        "ar": "العامرية",
        "postCode": "04005"
      },
      {
        "fr": "El Belala",
        "ar": "البلالة",
        "postCode": "04007"
      },
      {
        "fr": "El Djazia",
        "ar": "الجازيـــــــة",
        "postCode": "04014"
      },
      {
        "fr": "El Fedjoudj Boughrara Saoudi",
        "ar": "الفجوج بوغرارة سعودى",
        "postCode": "04019"
      },
      {
        "fr": "El Harmilia",
        "ar": "الحرملية",
        "postCode": "04029"
      },
      {
        "fr": "Fkirina",
        "ar": "فكرينة",
        "postCode": "04016"
      },
      {
        "fr": "Hanchir Toumghani",
        "ar": "هنشير تومغني",
        "postCode": "04013"
      },
      {
        "fr": "Ksar Sbahi",
        "ar": "قصر صباحي",
        "postCode": "04022"
      },
      {
        "fr": "Meskiana",
        "ar": "مسكيانة",
        "postCode": "04024"
      },
      {
        "fr": "Oued Nini",
        "ar": "وادي نيني",
        "postCode": "04023"
      },
      {
        "fr": "Ouled Gacem",
        "ar": "أولاد ڨاسم",
        "postCode": "04028"
      },
      {
        "fr": "Ouled Hamla",
        "ar": "أولاد حملة",
        "postCode": "04010"
      },
      {
        "fr": "Ouled Zouai",
        "ar": "أولاد زواي",
        "postCode": "04020"
      },
      {
        "fr": "Oum El Bouaghi",
        "ar": "أم البواقي",
        "postCode": "04001"
      },
      {
        "fr": "Rahia",
        "ar": "الراحية",
        "postCode": "04026"
      },
      {
        "fr": "Sigus",
        "ar": "سيقوس",
        "postCode": "04006"
      },
      {
        "fr": "Souk Naamane",
        "ar": "سوق نعمان",
        "postCode": "04017"
      },
      {
        "fr": "Zorg",
        "ar": "الزرڨ",
        "postCode": "04018"
      }
    ]
  },
  {
    "code": "05",
    "name_fr": "Batna",
    "name_ar": "باتنة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Djasser",
        "ar": "عين جاسر",
        "postCode": "05019"
      },
      {
        "fr": "Ain Touta",
        "ar": "عين التوتة",
        "postCode": "05045"
      },
      {
        "fr": "Ain Yagout",
        "ar": "عين ياقوت",
        "postCode": "05022"
      },
      {
        "fr": "Arris",
        "ar": "اريس",
        "postCode": "05016"
      },
      {
        "fr": "Batna",
        "ar": "باتنة",
        "postCode": "05001"
      },
      {
        "fr": "Beni Foudhala El Hakania",
        "ar": "بنى فضالة الحقانية",
        "postCode": "05032"
      },
      {
        "fr": "Boulhilat",
        "ar": "بولهيلات",
        "postCode": "05060"
      },
      {
        "fr": "Boumagueur",
        "ar": "بــومقر",
        "postCode": "05041"
      },
      {
        "fr": "Boumia",
        "ar": "بومية",
        "postCode": "05059"
      },
      {
        "fr": "Bouzina",
        "ar": "بوزينة",
        "postCode": "05035"
      },
      {
        "fr": "Chemora",
        "ar": "الشمرة",
        "postCode": "05036"
      },
      {
        "fr": "Chir",
        "ar": "شير",
        "postCode": "05052"
      },
      {
        "fr": "Djezzar",
        "ar": "الجزار",
        "postCode": "05043"
      },
      {
        "fr": "El Hassi",
        "ar": "الحاسي",
        "postCode": "05057"
      },
      {
        "fr": "Fesdis",
        "ar": "فسديس",
        "postCode": "05023"
      },
      {
        "fr": "Foum Toub",
        "ar": "فم الطوب",
        "postCode": "05031"
      },
      {
        "fr": "Ghassira",
        "ar": "غسيرة",
        "postCode": "05002"
      },
      {
        "fr": "Gosbat",
        "ar": "القصبات",
        "postCode": "05039"
      },
      {
        "fr": "Guigba",
        "ar": "قيقبة",
        "postCode": "05010"
      },
      {
        "fr": "Hidoussa",
        "ar": "حيدوسة",
        "postCode": "05046"
      },
      {
        "fr": "Ichmoul",
        "ar": "ايشمول",
        "postCode": "05030"
      },
      {
        "fr": "Inoughissen",
        "ar": "إينوغيسن",
        "postCode": "05011"
      },
      {
        "fr": "Kimmel",
        "ar": "كيمل",
        "postCode": "05017"
      },
      {
        "fr": "Ksar Belezma",
        "ar": "قصر بلازمة",
        "postCode": "05028"
      },
      {
        "fr": "Larbaa",
        "ar": "الاربعاء",
        "postCode": "05061"
      },
      {
        "fr": "Lazrou",
        "ar": "لازرو",
        "postCode": "05058"
      },
      {
        "fr": "Lemsane",
        "ar": "لمسان",
        "postCode": "05027"
      },
      {
        "fr": "M'doukel",
        "ar": "أمدوكال",
        "postCode": "05055"
      },
      {
        "fr": "Maafa",
        "ar": "معافة",
        "postCode": "05003"
      },
      {
        "fr": "Menaa",
        "ar": "منعة",
        "postCode": "05006"
      },
      {
        "fr": "Merouana",
        "ar": "مروانة",
        "postCode": "05004"
      },
      {
        "fr": "Metkaouak",
        "ar": "عزيل عبد القادر",
        "postCode": "05015"
      },
      {
        "fr": "Ngaous",
        "ar": "نڨاوس",
        "postCode": "05009"
      },
      {
        "fr": "Oued Chaaba",
        "ar": "واد الشعبة",
        "postCode": "05037"
      },
      {
        "fr": "Oued El Ma",
        "ar": "واد الماء",
        "postCode": "05033"
      },
      {
        "fr": "Oued Taga",
        "ar": "وادي الطاقة",
        "postCode": "05048"
      },
      {
        "fr": "Ouled Aouf",
        "ar": "أولاد عوف",
        "postCode": "05040"
      },
      {
        "fr": "Ouled Fadel",
        "ar": "أولاد فاضل",
        "postCode": "05049"
      },
      {
        "fr": "Ouled Selam",
        "ar": "أولاد سلام",
        "postCode": "05020"
      },
      {
        "fr": "Ouled Si Slimane",
        "ar": "أولاد سي سليمان",
        "postCode": "05053"
      },
      {
        "fr": "Ouyoun El Assafir",
        "ar": "عيون العصافير",
        "postCode": "05012"
      },
      {
        "fr": "Rahbat",
        "ar": "الرحبات",
        "postCode": "05025"
      },
      {
        "fr": "Ras El Aioun",
        "ar": "رأس العيون",
        "postCode": "05051"
      },
      {
        "fr": "Sefiane",
        "ar": "سفيان",
        "postCode": "05024"
      },
      {
        "fr": "Seriana",
        "ar": "سريانة",
        "postCode": "05005"
      },
      {
        "fr": "Talkhamt",
        "ar": "تالخمت",
        "postCode": "05034"
      },
      {
        "fr": "Taxlent",
        "ar": "تاكسلانت",
        "postCode": "05038"
      },
      {
        "fr": "Tazoult",
        "ar": "تازولت",
        "postCode": "05008"
      },
      {
        "fr": "Teniet El Abed",
        "ar": "نية العابد",
        "postCode": "05047"
      },
      {
        "fr": "Tighanimine",
        "ar": "تيغانمين",
        "postCode": "05026"
      },
      {
        "fr": "Tigherghar",
        "ar": "تيغرغار",
        "postCode": "05021"
      },
      {
        "fr": "Tilatou",
        "ar": "تيلاطو",
        "postCode": "05018"
      },
      {
        "fr": "Timgad",
        "ar": "تيمقاد",
        "postCode": "05050"
      },
      {
        "fr": "Tkout",
        "ar": "تكوت",
        "postCode": "05044"
      },
      {
        "fr": "Zanat El Beida",
        "ar": "زانة البيضاء",
        "postCode": "05054"
      }
    ]
  },
  {
    "code": "06",
    "name_fr": "Béjaïa",
    "name_ar": "بجاية",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Adekar",
        "ar": "آدكار",
        "postCode": "06024"
      },
      {
        "fr": "Ait Djellil",
        "ar": "آيث جليل",
        "postCode": "06023"
      },
      {
        "fr": "Ait R'zine",
        "ar": "آيت أرزين",
        "postCode": "06028"
      },
      {
        "fr": "Ait Smail",
        "ar": "آيت سماعيل",
        "postCode": "06047"
      },
      {
        "fr": "Akbou",
        "ar": "أقبو",
        "postCode": "06025"
      },
      {
        "fr": "Akfadou",
        "ar": "اكفادو",
        "postCode": "06042"
      },
      {
        "fr": "Amalou",
        "ar": "امالو",
        "postCode": "06016"
      },
      {
        "fr": "Amizour",
        "ar": "اميزور",
        "postCode": "06002"
      },
      {
        "fr": "Aokas",
        "ar": "أوقاس",
        "postCode": "06022"
      },
      {
        "fr": "Barbacha",
        "ar": "برباشة",
        "postCode": "06034"
      },
      {
        "fr": "Bejaia",
        "ar": "بجاية",
        "postCode": "06001"
      },
      {
        "fr": "Beni Ksila",
        "ar": "بنى كسيلة",
        "postCode": "06035"
      },
      {
        "fr": "Beni Maouch",
        "ar": "بني معوش",
        "postCode": "06050"
      },
      {
        "fr": "Beni Melikeche",
        "ar": "بنى مليكش",
        "postCode": "06038"
      },
      {
        "fr": "Boudjellil",
        "ar": "بوجليل",
        "postCode": "06052"
      },
      {
        "fr": "Bouhamza",
        "ar": "بوحمزة",
        "postCode": "06037"
      },
      {
        "fr": "Boukhelifa",
        "ar": "بوخليفة",
        "postCode": "06048"
      },
      {
        "fr": "Chelata",
        "ar": "شلاطة",
        "postCode": "06005"
      },
      {
        "fr": "Chemini",
        "ar": "شميني",
        "postCode": "06029"
      },
      {
        "fr": "Darguina",
        "ar": "درقينة",
        "postCode": "06020"
      },
      {
        "fr": "Draa Kaid",
        "ar": "ذراع القايد",
        "postCode": "06045"
      },
      {
        "fr": "El Kseur",
        "ar": "القصر",
        "postCode": "06040"
      },
      {
        "fr": "Ferraoun",
        "ar": "فرعون",
        "postCode": "06003"
      },
      {
        "fr": "Ifelain Ilmathen",
        "ar": "افناين الماثن",
        "postCode": "06018"
      },
      {
        "fr": "Ighil Ali",
        "ar": "إغيل على",
        "postCode": "06017"
      },
      {
        "fr": "Ighram",
        "ar": "إغرم",
        "postCode": "06015"
      },
      {
        "fr": "Kendira",
        "ar": "كنديرة",
        "postCode": "06013"
      },
      {
        "fr": "Kherrata",
        "ar": "خراطة",
        "postCode": "06044"
      },
      {
        "fr": "Leflaye",
        "ar": "لفلاى",
        "postCode": "06043"
      },
      {
        "fr": "M'cisna",
        "ar": "مسيسنة",
        "postCode": "06009"
      },
      {
        "fr": "Melbou",
        "ar": "ملبو",
        "postCode": "06041"
      },
      {
        "fr": "Oued Ghir",
        "ar": "وادي غير",
        "postCode": "06051"
      },
      {
        "fr": "Ouzallaguen",
        "ar": "أوزلاقن",
        "postCode": "06036"
      },
      {
        "fr": "Seddouk",
        "ar": "صدوق",
        "postCode": "06026"
      },
      {
        "fr": "Semaoun",
        "ar": "سمعون",
        "postCode": "06012"
      },
      {
        "fr": "Sidi Aich",
        "ar": "سيدي عيش",
        "postCode": "06039"
      },
      {
        "fr": "Sidi Ayad",
        "ar": "سيدي عياد",
        "postCode": "06021"
      },
      {
        "fr": "Souk El Thenine",
        "ar": "ﺳﻮق اﻻﺛﻨﻴﻦ",
        "postCode": "06008"
      },
      {
        "fr": "Souk Oufella",
        "ar": "سوق أوفلة",
        "postCode": "06030"
      },
      {
        "fr": "Tala Hamza",
        "ar": "ثالة حمزة",
        "postCode": "06033"
      },
      {
        "fr": "Tamokra",
        "ar": "تامقرة",
        "postCode": "06006"
      },
      {
        "fr": "Tamridjet",
        "ar": "تامريجت",
        "postCode": "06046"
      },
      {
        "fr": "Taourirt Ighil",
        "ar": "تاوريرت اغيل",
        "postCode": "06004"
      },
      {
        "fr": "Taskriout",
        "ar": "تاسقريوت",
        "postCode": "06031"
      },
      {
        "fr": "Tazmalt",
        "ar": "تازمالت",
        "postCode": "06027"
      },
      {
        "fr": "Thinabdher",
        "ar": "تينبذار",
        "postCode": "06010"
      },
      {
        "fr": "Tibane",
        "ar": "طيبان",
        "postCode": "06032"
      },
      {
        "fr": "Tichi",
        "ar": "تيشي",
        "postCode": "06011"
      },
      {
        "fr": "Tifra",
        "ar": "تيفرة",
        "postCode": "06014"
      },
      {
        "fr": "Timzrit",
        "ar": "تيمزريت",
        "postCode": "06007"
      },
      {
        "fr": "Tizi N'berber",
        "ar": "تيزى نبربر",
        "postCode": "06049"
      },
      {
        "fr": "Toudja",
        "ar": "توجة",
        "postCode": "06019"
      }
    ]
  },
  {
    "code": "07",
    "name_fr": "Biskra",
    "name_ar": "بسكرة",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Ain Naga",
        "ar": "عين الناقة",
        "postCode": "07014"
      },
      {
        "fr": "Biskra",
        "ar": "بسكرة",
        "postCode": "07001"
      },
      {
        "fr": "Bordj Ben Azzouz",
        "ar": "برج بن عزوز",
        "postCode": "07027"
      },
      {
        "fr": "Bouchagroun",
        "ar": "بوشقرون",
        "postCode": "07029"
      },
      {
        "fr": "Chetma",
        "ar": "شتمة",
        "postCode": "07004"
      },
      {
        "fr": "Djemorah",
        "ar": "جمورة",
        "postCode": "07020"
      },
      {
        "fr": "Ech Chaiba",
        "ar": "أولاد رحمة",
        "postCode": "07010"
      },
      {
        "fr": "El Feidh",
        "ar": "الفيض",
        "postCode": "07016"
      },
      {
        "fr": "El Ghrous",
        "ar": "الغروس",
        "postCode": "07031"
      },
      {
        "fr": "El Hadjab",
        "ar": "الحاجب",
        "postCode": "07032"
      },
      {
        "fr": "El Haouch",
        "ar": "الحوش",
        "postCode": "07013"
      },
      {
        "fr": "Foughala",
        "ar": "فوغالة",
        "postCode": "07026"
      },
      {
        "fr": "Khanguet Sidinadji",
        "ar": "خنڨة سيدي ناجي",
        "postCode": "07033"
      },
      {
        "fr": "Lichana",
        "ar": "لشانة",
        "postCode": "07023"
      },
      {
        "fr": "Lioua",
        "ar": "لواء",
        "postCode": "07022"
      },
      {
        "fr": "M'lili",
        "ar": "مليلي",
        "postCode": "07025"
      },
      {
        "fr": "M'ziraa",
        "ar": "مزيرعة",
        "postCode": "07028"
      },
      {
        "fr": "Mchouneche",
        "ar": "مشونش",
        "postCode": "07012"
      },
      {
        "fr": "Mekhadma",
        "ar": "مخادمة",
        "postCode": "07030"
      },
      {
        "fr": "Oumache",
        "ar": "أوماش",
        "postCode": "07002"
      },
      {
        "fr": "Ourlal",
        "ar": "أورلال",
        "postCode": "07024"
      },
      {
        "fr": "Sidi Okba",
        "ar": "سيدي عقبة",
        "postCode": "07011"
      },
      {
        "fr": "Tolga",
        "ar": "طولقة",
        "postCode": "07021"
      },
      {
        "fr": "Zeribet El Oued",
        "ar": "زريبة الوادي",
        "postCode": "07015"
      }
    ]
  },
  {
    "code": "08",
    "name_fr": "Bechar",
    "name_ar": "بشار",
    "deliveryFeeDZD": 950,
    "communes": [
      {
        "fr": "Abadla",
        "ar": "العبادلة",
        "postCode": "08017"
      },
      {
        "fr": "Bechar",
        "ar": "بشار",
        "postCode": "08001"
      },
      {
        "fr": "Beni Ikhlef",
        "ar": "بني يخلف",
        "postCode": "08008"
      },
      {
        "fr": "Beni Ounif",
        "ar": "بني ونيف",
        "postCode": "08021"
      },
      {
        "fr": "Boukais",
        "ar": "بوكايس",
        "postCode": "08015"
      },
      {
        "fr": "Erg Ferradj",
        "ar": "عرق فراج",
        "postCode": "08002"
      },
      {
        "fr": "Kenedsa",
        "ar": "القنادسة",
        "postCode": "08010"
      },
      {
        "fr": "Lahmar",
        "ar": "لحمر",
        "postCode": "08006"
      },
      {
        "fr": "Mechraa Houari Boumedienne",
        "ar": "مشرع ھوارى بومدين",
        "postCode": "08009"
      },
      {
        "fr": "Meridja",
        "ar": "مريجة",
        "postCode": "08004"
      },
      {
        "fr": "Mogheul",
        "ar": "موغل",
        "postCode": "08016"
      },
      {
        "fr": "Tabalbala",
        "ar": "تبلبالة",
        "postCode": "08012"
      },
      {
        "fr": "Taghit",
        "ar": "تــــاغـيــث",
        "postCode": "08013"
      },
      {
        "fr": "Tamtert",
        "ar": "تامترت",
        "postCode": "08020"
      }
    ]
  },
  {
    "code": "09",
    "name_fr": "Blida",
    "name_ar": "البليدة",
    "deliveryFeeDZD": 500,
    "communes": [
      {
        "fr": "Ain Romana",
        "ar": "عين الرمانة",
        "postCode": "09028"
      },
      {
        "fr": "Ben Khlil",
        "ar": "بني خليل",
        "postCode": "09013"
      },
      {
        "fr": "Beni Mered",
        "ar": "بني مراد",
        "postCode": "09025"
      },
      {
        "fr": "Beni Tamou",
        "ar": "بني تامو",
        "postCode": "09023"
      },
      {
        "fr": "Blida",
        "ar": "البليدة‎",
        "postCode": "09001"
      },
      {
        "fr": "Bouarfa",
        "ar": "بوعرفة",
        "postCode": "09024"
      },
      {
        "fr": "Boufarik",
        "ar": "بوفاريك",
        "postCode": "09020"
      },
      {
        "fr": "Bougara",
        "ar": "بوڨرة",
        "postCode": "09026"
      },
      {
        "fr": "Bouinan",
        "ar": "بوعينان",
        "postCode": "09003"
      },
      {
        "fr": "Chebli",
        "ar": "الشبلي",
        "postCode": "09002"
      },
      {
        "fr": "Chiffa",
        "ar": "الشفة",
        "postCode": "09011"
      },
      {
        "fr": "Chrea",
        "ar": "الشريعة",
        "postCode": "09008"
      },
      {
        "fr": "Djebabra",
        "ar": "جبابرة",
        "postCode": "09029"
      },
      {
        "fr": "El Affroun",
        "ar": "العفرون",
        "postCode": "09010"
      },
      {
        "fr": "Guerrouaou",
        "ar": "ڨرواو",
        "postCode": "09027"
      },
      {
        "fr": "Hammam Melouane",
        "ar": "حمام ملوان",
        "postCode": "09012"
      },
      {
        "fr": "Larbaa",
        "ar": "الاربعاء",
        "postCode": "09021"
      },
      {
        "fr": "Meftah",
        "ar": "مفتاح",
        "postCode": "09018"
      },
      {
        "fr": "Mouzaia",
        "ar": "موزاية",
        "postCode": "09016"
      },
      {
        "fr": "Oued Djer",
        "ar": "واد جر",
        "postCode": "09022"
      },
      {
        "fr": "Oued El Alleug",
        "ar": "واد العلايڨ",
        "postCode": "09004"
      },
      {
        "fr": "Ouled Selama",
        "ar": "أولاد سلامة",
        "postCode": "09019"
      },
      {
        "fr": "Ouled Yaich",
        "ar": "اولاد يعيش",
        "postCode": "09007"
      },
      {
        "fr": "Souhane",
        "ar": "صوحان",
        "postCode": "09017"
      },
      {
        "fr": "Soumaa",
        "ar": "صومعة",
        "postCode": "09014"
      }
    ]
  },
  {
    "code": "10",
    "name_fr": "Bouira",
    "name_ar": "البويرة",
    "deliveryFeeDZD": 550,
    "communes": [
      {
        "fr": "Aghbalou",
        "ar": "أغبالو",
        "postCode": "10027"
      },
      {
        "fr": "Ahl El Ksar",
        "ar": "أھل القصر",
        "postCode": "10022"
      },
      {
        "fr": "Ain Bessam",
        "ar": "عين بسام",
        "postCode": "10035"
      },
      {
        "fr": "Ain El Hadjar",
        "ar": "عين الحجر",
        "postCode": "10025"
      },
      {
        "fr": "Ain Laloui",
        "ar": "عين العلوي",
        "postCode": "10041"
      },
      {
        "fr": "Ain Turk",
        "ar": "عين الترك",
        "postCode": "10029"
      },
      {
        "fr": "Ait Laaziz",
        "ar": "آيت لعزيز",
        "postCode": "10008"
      },
      {
        "fr": "Aomar",
        "ar": "أعمر",
        "postCode": "10016"
      },
      {
        "fr": "Ath Mansour",
        "ar": "آث منصور",
        "postCode": "10043"
      },
      {
        "fr": "Bechloul",
        "ar": "بشلول",
        "postCode": "10033"
      },
      {
        "fr": "Bir Ghbalou",
        "ar": "بئر غبالو",
        "postCode": "10036"
      },
      {
        "fr": "Bordj Oukhriss",
        "ar": "برج أوخريص",
        "postCode": "10018"
      },
      {
        "fr": "Bouderbala",
        "ar": "بودربالة",
        "postCode": "10023"
      },
      {
        "fr": "Bouira",
        "ar": "البويرة",
        "postCode": "10001"
      },
      {
        "fr": "Boukram",
        "ar": "بوكرام",
        "postCode": "10034"
      },
      {
        "fr": "Chorfa",
        "ar": "الشرفاء",
        "postCode": "10017"
      },
      {
        "fr": "Dechmia",
        "ar": "الدشمية",
        "postCode": "10031"
      },
      {
        "fr": "Dirah",
        "ar": "ديــرة",
        "postCode": "10007"
      },
      {
        "fr": "Djebahia",
        "ar": "الجباحية",
        "postCode": "10026"
      },
      {
        "fr": "El Adjiba",
        "ar": "العجيبة",
        "postCode": "10019"
      },
      {
        "fr": "El Asnam",
        "ar": "الأصنام",
        "postCode": "10002"
      },
      {
        "fr": "El Hachimia",
        "ar": "الھاشمية",
        "postCode": "10015"
      },
      {
        "fr": "El Hakimia",
        "ar": "الحاكمية",
        "postCode": "10020"
      },
      {
        "fr": "El Khebouzia",
        "ar": "الخبوزية",
        "postCode": "10021"
      },
      {
        "fr": "El Mokrani",
        "ar": "المقراني",
        "postCode": "10044"
      },
      {
        "fr": "Guerrouma",
        "ar": "قرومة",
        "postCode": "10003"
      },
      {
        "fr": "Hadjera Zerga",
        "ar": "الحجرة الزرقاء",
        "postCode": "10042"
      },
      {
        "fr": "Haizer",
        "ar": "حيزر",
        "postCode": "10012"
      },
      {
        "fr": "Hanif",
        "ar": "احنيف",
        "postCode": "10006"
      },
      {
        "fr": "Kadiria",
        "ar": "قادرية",
        "postCode": "10005"
      },
      {
        "fr": "Lakhdaria",
        "ar": "الأخضرية",
        "postCode": "10013"
      },
      {
        "fr": "Maala",
        "ar": "معالة",
        "postCode": "10014"
      },
      {
        "fr": "Maamora",
        "ar": "المعمورة",
        "postCode": "10039"
      },
      {
        "fr": "Mchedallah",
        "ar": "مشدا الله",
        "postCode": "10037"
      },
      {
        "fr": "Mezdour",
        "ar": "مسدور",
        "postCode": "10011"
      },
      {
        "fr": "Oued El Berdi",
        "ar": "وادى البردي",
        "postCode": "10045"
      },
      {
        "fr": "Ouled Rached",
        "ar": "أولاد راشد",
        "postCode": "10040"
      },
      {
        "fr": "Raouraoua",
        "ar": "الروراوة",
        "postCode": "10010"
      },
      {
        "fr": "Ridane",
        "ar": "ريدان",
        "postCode": "10032"
      },
      {
        "fr": "Saharidj",
        "ar": "الصهاريج",
        "postCode": "10030"
      },
      {
        "fr": "Souk El Khemis",
        "ar": "سوق الخميس",
        "postCode": "10004"
      },
      {
        "fr": "Sour El Ghozlane",
        "ar": "سور الغزلان",
        "postCode": "10038"
      },
      {
        "fr": "Taghzout",
        "ar": "تاغزوت",
        "postCode": "10009"
      },
      {
        "fr": "Taguedit",
        "ar": "تاڨديت",
        "postCode": "10028"
      },
      {
        "fr": "Zbarbar",
        "ar": "زبربر",
        "postCode": "10024"
      }
    ]
  },
  {
    "code": "11",
    "name_fr": "Tamanrasset",
    "name_ar": "تمنراست",
    "deliveryFeeDZD": 1050,
    "communes": [
      {
        "fr": "Abalessa",
        "ar": "أبلسة",
        "postCode": "11002"
      },
      {
        "fr": "Idles",
        "ar": "إدلس",
        "postCode": "11005"
      },
      {
        "fr": "In Amguel",
        "ar": "ان أمقل",
        "postCode": "11009"
      },
      {
        "fr": "Tamanghasset",
        "ar": "تمنراست",
        "postCode": "11001"
      },
      {
        "fr": "Tazouk",
        "ar": "تاظروك",
        "postCode": "11006"
      },
      {
        "fr": "Tinzaouatine",
        "ar": "تين زاوتين",
        "postCode": "11007"
      }
    ]
  },
  {
    "code": "12",
    "name_fr": "Tbessa",
    "name_ar": "تبسة",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Ain Zerga",
        "ar": "عين الزرقاء",
        "postCode": "12023"
      },
      {
        "fr": "Bedjene",
        "ar": "بجن",
        "postCode": "12026"
      },
      {
        "fr": "Bekkaria",
        "ar": "بكارية",
        "postCode": "12017"
      },
      {
        "fr": "Bir Dheb",
        "ar": "بٔير الذھب",
        "postCode": "12014"
      },
      {
        "fr": "Bir El Mokadem",
        "ar": "بــئــر مــقـدم",
        "postCode": "12010"
      },
      {
        "fr": "Boukhadra",
        "ar": "بوخضرة",
        "postCode": "12018"
      },
      {
        "fr": "Boulhaf Dyr",
        "ar": "بولحاف الدير",
        "postCode": "12025"
      },
      {
        "fr": "Cheria",
        "ar": "الــشــريــعـة",
        "postCode": "12003"
      },
      {
        "fr": "El Aouinet",
        "ar": "العوينات",
        "postCode": "12005"
      },
      {
        "fr": "El Kouif",
        "ar": "الكويف",
        "postCode": "12011"
      },
      {
        "fr": "El Ma El Biodh",
        "ar": "الماء الأبيض",
        "postCode": "12020"
      },
      {
        "fr": "El Mazeraa",
        "ar": "المزرعة",
        "postCode": "12027"
      },
      {
        "fr": "El Meridj",
        "ar": "المريج",
        "postCode": "12024"
      },
      {
        "fr": "El Ogla",
        "ar": "العقلة",
        "postCode": "12015"
      },
      {
        "fr": "Gorriguer",
        "ar": "قوريقر",
        "postCode": "12016"
      },
      {
        "fr": "Hammamet",
        "ar": "الحمامات",
        "postCode": "12008"
      },
      {
        "fr": "Lahouidjbet",
        "ar": "الحويجبات",
        "postCode": "12006"
      },
      {
        "fr": "Morsott",
        "ar": "مرسط",
        "postCode": "12012"
      },
      {
        "fr": "Ouenza",
        "ar": "الونزة",
        "postCode": "12019"
      },
      {
        "fr": "Oum Ali",
        "ar": "أم على",
        "postCode": "12021"
      },
      {
        "fr": "Safsaf El Ouesra",
        "ar": "صفصاف الوسرة",
        "postCode": "12007"
      },
      {
        "fr": "Stah Guentis",
        "ar": "سطح قنطيس",
        "postCode": "12004"
      },
      {
        "fr": "Tebessa",
        "ar": "تبسة",
        "postCode": "12001"
      },
      {
        "fr": "Tlidjene",
        "ar": "ثليجان",
        "postCode": "12022"
      }
    ]
  },
  {
    "code": "13",
    "name_fr": "Tlemcen",
    "name_ar": "تلمسان",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Fetah",
        "ar": "عين فتاح",
        "postCode": "13031"
      },
      {
        "fr": "Ain Fezza",
        "ar": "عين فزّة",
        "postCode": "13012"
      },
      {
        "fr": "Ain Ghoraba",
        "ar": "عين غرابة",
        "postCode": "13049"
      },
      {
        "fr": "Ain Kebira",
        "ar": "عين الكبيرة",
        "postCode": "13053"
      },
      {
        "fr": "Ain Nehala",
        "ar": "عين نحالة",
        "postCode": "13025"
      },
      {
        "fr": "Ain Tallout",
        "ar": "عين تالوت",
        "postCode": "13003"
      },
      {
        "fr": "Ain Youcef",
        "ar": "عين يوسف",
        "postCode": "13015"
      },
      {
        "fr": "Amieur",
        "ar": "عمير",
        "postCode": "13014"
      },
      {
        "fr": "Azails",
        "ar": "العزايل",
        "postCode": "13021"
      },
      {
        "fr": "Bab El Assa",
        "ar": "باب العسة",
        "postCode": "13018"
      },
      {
        "fr": "Beni Bahdel",
        "ar": "بني بهدل",
        "postCode": "13042"
      },
      {
        "fr": "Beni Boussaid",
        "ar": "بني بوسعيد",
        "postCode": "13038"
      },
      {
        "fr": "Beni Mester",
        "ar": "بني مستار",
        "postCode": "13002"
      },
      {
        "fr": "Beni Ouarsous",
        "ar": "برج عريمة",
        "postCode": "13036"
      },
      {
        "fr": "Beni Semiel",
        "ar": "بني مستار",
        "postCode": "13052"
      },
      {
        "fr": "Beni Snous",
        "ar": "بنى سنوس",
        "postCode": "13017"
      },
      {
        "fr": "Bensekrane",
        "ar": "بن سكران",
        "postCode": "13024"
      },
      {
        "fr": "Bouhlou",
        "ar": "بوحلو",
        "postCode": "13047"
      },
      {
        "fr": "Chetouane",
        "ar": "شتوان",
        "postCode": "13050"
      },
      {
        "fr": "Dar Yaghmouracene",
        "ar": "دار يغمراسن",
        "postCode": "13019"
      },
      {
        "fr": "Djebala",
        "ar": "جبالة",
        "postCode": "13009"
      },
      {
        "fr": "El Bouihi",
        "ar": "البويھي",
        "postCode": "13043"
      },
      {
        "fr": "El Fehoul",
        "ar": "الفحول",
        "postCode": "13005"
      },
      {
        "fr": "Fellaoucene",
        "ar": "فلاوسن",
        "postCode": "13020"
      },
      {
        "fr": "Ghazaouet",
        "ar": "الغزوات",
        "postCode": "13007"
      },
      {
        "fr": "Hammam Boughrara",
        "ar": "حمام بوغرارة",
        "postCode": "13028"
      },
      {
        "fr": "Hennaya",
        "ar": "الحناية",
        "postCode": "13026"
      },
      {
        "fr": "Honaine",
        "ar": "هنين",
        "postCode": "13044"
      },
      {
        "fr": "Maghnia",
        "ar": "مغنية",
        "postCode": "13027"
      },
      {
        "fr": "Mansourah",
        "ar": "المنصورة",
        "postCode": "13051"
      },
      {
        "fr": "Marsa Ben Mhidi",
        "ar": "مرسى بن مھيدي",
        "postCode": "13039"
      },
      {
        "fr": "Msirda Fouaga",
        "ar": "مسيردة الفواقة",
        "postCode": "13030"
      },
      {
        "fr": "Nedroma",
        "ar": "ندرومة",
        "postCode": "13040"
      },
      {
        "fr": "Oued Chouly",
        "ar": "وادى الشولى",
        "postCode": "13011"
      },
      {
        "fr": "Ouled Mimoun",
        "ar": "أولاد ميمون",
        "postCode": "13013"
      },
      {
        "fr": "Ouled Riyah",
        "ar": "أولاد رياح",
        "postCode": "13046"
      },
      {
        "fr": "Remchi",
        "ar": "الرمشي",
        "postCode": "13004"
      },
      {
        "fr": "Sabra",
        "ar": "صبرة",
        "postCode": "13006"
      },
      {
        "fr": "Sebbaa Chioukh",
        "ar": "سبعة شيوخ",
        "postCode": "13022"
      },
      {
        "fr": "Sebdou",
        "ar": "سبدو",
        "postCode": "13035"
      },
      {
        "fr": "Sidi Abdelli",
        "ar": "سيدي العبدلي",
        "postCode": "13034"
      },
      {
        "fr": "Sidi Djillali",
        "ar": "سيدي الجيلالي",
        "postCode": "13041"
      },
      {
        "fr": "Sidi Medjahed",
        "ar": "سيدي مجاهد",
        "postCode": "13037"
      },
      {
        "fr": "Souahlia",
        "ar": "تونان",
        "postCode": "13029"
      },
      {
        "fr": "Souani",
        "ar": "السواني",
        "postCode": "13008"
      },
      {
        "fr": "Souk El Khemis",
        "ar": "سوق الخميس",
        "postCode": "13048"
      },
      {
        "fr": "Souk Thlata",
        "ar": "سوق الثلاثاء",
        "postCode": "13033"
      },
      {
        "fr": "Terni Beni Hediel",
        "ar": "تيرني بني هديل",
        "postCode": "13023"
      },
      {
        "fr": "Tianet",
        "ar": "تيانت",
        "postCode": "13045"
      },
      {
        "fr": "Tlemcen",
        "ar": "تلمسان",
        "postCode": "13001"
      },
      {
        "fr": "Zenata",
        "ar": "زناتة",
        "postCode": "13016"
      }
    ]
  },
  {
    "code": "14",
    "name_fr": "Tiaret",
    "name_ar": "تيارت",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Bouchekif",
        "ar": "بوشقيف",
        "postCode": "14003"
      },
      {
        "fr": "Ain Deheb",
        "ar": "عين الذهب",
        "postCode": "14006"
      },
      {
        "fr": "Ain El Hadid",
        "ar": "عين الحديد",
        "postCode": "14018"
      },
      {
        "fr": "Ain Kermes",
        "ar": "عين كرمس",
        "postCode": "14028"
      },
      {
        "fr": "Ain Zarit",
        "ar": "عين زاريت",
        "postCode": "14005"
      },
      {
        "fr": "Chehaima",
        "ar": "شحيمة",
        "postCode": "14036"
      },
      {
        "fr": "Dahmouni",
        "ar": "دحموني",
        "postCode": "14013"
      },
      {
        "fr": "Djillali Ben Amar",
        "ar": "جيلالي بن عمار",
        "postCode": "14024"
      },
      {
        "fr": "Faidja",
        "ar": "الفايجة",
        "postCode": "14041"
      },
      {
        "fr": "Frenda",
        "ar": "فرندة",
        "postCode": "14027"
      },
      {
        "fr": "Guertoufa",
        "ar": "قرطوفة",
        "postCode": "14022"
      },
      {
        "fr": "Madna",
        "ar": "مادنة",
        "postCode": "14010"
      },
      {
        "fr": "Mahdia",
        "ar": "المھدية",
        "postCode": "14015"
      },
      {
        "fr": "Mechraa Safa",
        "ar": "مشرع الصفاء",
        "postCode": "14034"
      },
      {
        "fr": "Medrissa",
        "ar": "مدريسة",
        "postCode": "14008"
      },
      {
        "fr": "Medroussa",
        "ar": "مدروسة",
        "postCode": "14002"
      },
      {
        "fr": "Meghila",
        "ar": "مغيلة",
        "postCode": "14021"
      },
      {
        "fr": "Mellakou",
        "ar": "ملاكو",
        "postCode": "14012"
      },
      {
        "fr": "Nadorah",
        "ar": "ملاكو",
        "postCode": "14031"
      },
      {
        "fr": "Naima",
        "ar": "نعيمة",
        "postCode": "14020"
      },
      {
        "fr": "Oued Lilli",
        "ar": "وادى ليلى",
        "postCode": "14033"
      },
      {
        "fr": "Ouled Djerad",
        "ar": "اولاد جراد",
        "postCode": "14019"
      },
      {
        "fr": "Rahouia",
        "ar": "رحوية",
        "postCode": "14014"
      },
      {
        "fr": "Sebaine",
        "ar": "سبعين",
        "postCode": "14025"
      },
      {
        "fr": "Sebt",
        "ar": "السبت",
        "postCode": "14011"
      },
      {
        "fr": "Sidi Abderrahmane",
        "ar": "سيدي عبدالرحمان",
        "postCode": "14038"
      },
      {
        "fr": "Sidi Ali Mellal",
        "ar": "سيدي علي ملال",
        "postCode": "14004"
      },
      {
        "fr": "Sidi Bakhti",
        "ar": "سيدي بختي",
        "postCode": "14007"
      },
      {
        "fr": "Sidi Hosni",
        "ar": "سيدي حسني",
        "postCode": "14023"
      },
      {
        "fr": "Sougueur",
        "ar": "سوقر",
        "postCode": "14016"
      },
      {
        "fr": "Tagdemt",
        "ar": "تاقدمت",
        "postCode": "14032"
      },
      {
        "fr": "Takhemaret",
        "ar": "تاخمرت",
        "postCode": "14037"
      },
      {
        "fr": "Tiaret",
        "ar": "تيارت‎",
        "postCode": "14001"
      },
      {
        "fr": "Tidda",
        "ar": "تيدة",
        "postCode": "14042"
      },
      {
        "fr": "Tousnina",
        "ar": "توسنينة",
        "postCode": "14026"
      },
      {
        "fr": "Zmalet El Emir Aek",
        "ar": "زمالة الأمير عبد القادر",
        "postCode": "14009"
      }
    ]
  },
  {
    "code": "15",
    "name_fr": "Tizi Ouzou",
    "name_ar": "تيزي وزو",
    "deliveryFeeDZD": 550,
    "communes": [
      {
        "fr": "Abi Youcef",
        "ar": "أبي يوسف",
        "postCode": "15031"
      },
      {
        "fr": "Aghrib",
        "ar": "أغريب",
        "postCode": "15053"
      },
      {
        "fr": "Agouni Gueghrane",
        "ar": "آقنى قغران",
        "postCode": "15061"
      },
      {
        "fr": "Ain El Hammam",
        "ar": "عين الحمام",
        "postCode": "15002"
      },
      {
        "fr": "Ain Zaouia",
        "ar": "عين الزاوية",
        "postCode": "15025"
      },
      {
        "fr": "Ait Aggouacha",
        "ar": "أيت أقواشة",
        "postCode": "15035"
      },
      {
        "fr": "Ait Aissa Mimoun",
        "ar": "آيت عيسى ميمون",
        "postCode": "15039"
      },
      {
        "fr": "Ait Bouadou",
        "ar": "أيت بوعدو",
        "postCode": "15065"
      },
      {
        "fr": "Ait Boumehdi",
        "ar": "آيت بومھدى",
        "postCode": "15030"
      },
      {
        "fr": "Ait Chaffaa",
        "ar": "آيت شفعة",
        "postCode": "15013"
      },
      {
        "fr": "Ait Khelil",
        "ar": "أيت خليلي",
        "postCode": "15058"
      },
      {
        "fr": "Ait Mahmoud",
        "ar": "أيت محمود",
        "postCode": "15028"
      },
      {
        "fr": "Ait Oumalou",
        "ar": "آيت أومالو",
        "postCode": "15042"
      },
      {
        "fr": "Ait Toudert",
        "ar": "أيت تودرت",
        "postCode": "15067"
      },
      {
        "fr": "Ait Yahia",
        "ar": "أيت يحي",
        "postCode": "15027"
      },
      {
        "fr": "Ait Yahia Moussa",
        "ar": "أيت يحي موسى",
        "postCode": "15056"
      },
      {
        "fr": "Akbil",
        "ar": "أقبيل",
        "postCode": "15003"
      },
      {
        "fr": "Akerrou",
        "ar": "أقرو",
        "postCode": "15044"
      },
      {
        "fr": "Assi Youcef",
        "ar": "أسي يوسف",
        "postCode": "15066"
      },
      {
        "fr": "Azazga",
        "ar": "عزازقة",
        "postCode": "15018"
      },
      {
        "fr": "Azzefoun",
        "ar": "أزفون",
        "postCode": "15037"
      },
      {
        "fr": "Beni Aissi",
        "ar": "بني عيسي",
        "postCode": "15015"
      },
      {
        "fr": "Beni Douala",
        "ar": "بني دوالة",
        "postCode": "15032"
      },
      {
        "fr": "Beni Yenni",
        "ar": "بني يني",
        "postCode": "15052"
      },
      {
        "fr": "Beni Ziki",
        "ar": "بنى زيكى",
        "postCode": "15046"
      },
      {
        "fr": "Beni Zmenzer",
        "ar": "أيت زمنزر",
        "postCode": "15016"
      },
      {
        "fr": "Boghni",
        "ar": "بوغني",
        "postCode": "15040"
      },
      {
        "fr": "Boudjima",
        "ar": "بوجيمة",
        "postCode": "15055"
      },
      {
        "fr": "Bounouh",
        "ar": "بونوح",
        "postCode": "15012"
      },
      {
        "fr": "Bouzguen",
        "ar": "بوزقن",
        "postCode": "15034"
      },
      {
        "fr": "Draa Ben Khedda",
        "ar": "ذراع بن خدة",
        "postCode": "15047"
      },
      {
        "fr": "Draa El Mizan",
        "ar": "ذراع الميزان",
        "postCode": "15010"
      },
      {
        "fr": "Freha",
        "ar": "فريحة",
        "postCode": "15004"
      },
      {
        "fr": "Frikat",
        "ar": "فريقات",
        "postCode": "15014"
      },
      {
        "fr": "Iboudraren",
        "ar": "أبودرارن",
        "postCode": "15060"
      },
      {
        "fr": "Idjeur",
        "ar": "آجر",
        "postCode": "15049"
      },
      {
        "fr": "Iferhounene",
        "ar": "إيفرحونن",
        "postCode": "15017"
      },
      {
        "fr": "Ifigha",
        "ar": "ايفيغاء",
        "postCode": "15041"
      },
      {
        "fr": "Iflissen",
        "ar": "إفليسن",
        "postCode": "15054"
      },
      {
        "fr": "Illilten",
        "ar": "إليلتن",
        "postCode": "15033"
      },
      {
        "fr": "Iloula Oumalou",
        "ar": "إيلولة أمالو",
        "postCode": "15019"
      },
      {
        "fr": "Imsouhal",
        "ar": "إمسوحال",
        "postCode": "15063"
      },
      {
        "fr": "Irdjen",
        "ar": "إرجن",
        "postCode": "15007"
      },
      {
        "fr": "Larba Nait Irathen",
        "ar": "الأربعاء نايت إيراثن",
        "postCode": "15021"
      },
      {
        "fr": "Maatka",
        "ar": "المعاتقة",
        "postCode": "15029"
      },
      {
        "fr": "Makouda",
        "ar": "ماكودة",
        "postCode": "15009"
      },
      {
        "fr": "Mechtrass",
        "ar": "مشطراس",
        "postCode": "15006"
      },
      {
        "fr": "Mekla",
        "ar": "مقلع",
        "postCode": "15050"
      },
      {
        "fr": "Mizrana",
        "ar": "مزرانة",
        "postCode": "15062"
      },
      {
        "fr": "Mkira",
        "ar": "مكيرة",
        "postCode": "15026"
      },
      {
        "fr": "Ouacif",
        "ar": "واسيف",
        "postCode": "15048"
      },
      {
        "fr": "Ouadhia",
        "ar": "واضية",
        "postCode": "15036"
      },
      {
        "fr": "Ouaguenoun",
        "ar": "واقنون",
        "postCode": "15024"
      },
      {
        "fr": "Sidi Naamane",
        "ar": "سيدي نعمان",
        "postCode": "15059"
      },
      {
        "fr": "Souamaa",
        "ar": "صوامع",
        "postCode": "15005"
      },
      {
        "fr": "Souk El Thenine",
        "ar": "سوق الإثنين",
        "postCode": "15057"
      },
      {
        "fr": "Tadmait",
        "ar": "تادمايت",
        "postCode": "15064"
      },
      {
        "fr": "Tigzirt",
        "ar": "تقزيرت",
        "postCode": "15038"
      },
      {
        "fr": "Timizart",
        "ar": "تيميزارت",
        "postCode": "15008"
      },
      {
        "fr": "Tirmitine",
        "ar": "ترمتين",
        "postCode": "15043"
      },
      {
        "fr": "Tizi Ghenif",
        "ar": "تيزي غنيف",
        "postCode": "15011"
      },
      {
        "fr": "Tizi Nthlata",
        "ar": "تيزي نثلاثة",
        "postCode": "15051"
      },
      {
        "fr": "Tizi Ouzou",
        "ar": "تيزي وزو",
        "postCode": "15001"
      },
      {
        "fr": "Tizi Rached",
        "ar": "تيزي راشد",
        "postCode": "15022"
      },
      {
        "fr": "Yakouren",
        "ar": "اعكورن",
        "postCode": "15020"
      },
      {
        "fr": "Yatafen",
        "ar": "يطافن",
        "postCode": "15045"
      },
      {
        "fr": "Zekri",
        "ar": "زكري",
        "postCode": "15023"
      }
    ]
  },
  {
    "code": "16",
    "name_fr": "Alger",
    "name_ar": "الجزائر",
    "deliveryFeeDZD": 400,
    "communes": [
      {
        "fr": "Ain Benian",
        "ar": "عين بنيان",
        "postCode": "16044"
      },
      {
        "fr": "Ain Taya",
        "ar": "عين طاية",
        "postCode": "16038"
      },
      {
        "fr": "Alger Centre",
        "ar": "الجزائر الوسطى",
        "postCode": "16001"
      },
      {
        "fr": "Bab Azzouar",
        "ar": "باب الزوار",
        "postCode": "16021"
      },
      {
        "fr": "Bab El Oued",
        "ar": "باب الواد",
        "postCode": "16005"
      },
      {
        "fr": "Baba Hassen",
        "ar": "بابا حسن",
        "postCode": "16055"
      },
      {
        "fr": "Bachedjerah",
        "ar": "باش جراح",
        "postCode": "16019"
      },
      {
        "fr": "Baraki",
        "ar": "براقي",
        "postCode": "16014"
      },
      {
        "fr": "Belouizdad",
        "ar": "بلوزداد",
        "postCode": "16004"
      },
      {
        "fr": "Ben Aknoun",
        "ar": "بن عكنون",
        "postCode": "16022"
      },
      {
        "fr": "Beni Messous",
        "ar": "بني مسوس",
        "postCode": "16032"
      },
      {
        "fr": "Bir Mourad Rais",
        "ar": "بير مراد رايس",
        "postCode": "16009"
      },
      {
        "fr": "Birkhadem",
        "ar": "بئر خادم",
        "postCode": "16012"
      },
      {
        "fr": "Birtouta",
        "ar": "بئر توتة",
        "postCode": "16034"
      },
      {
        "fr": "Bologhine",
        "ar": "بولوغين",
        "postCode": "16006"
      },
      {
        "fr": "Bordj El Bahri",
        "ar": "برج البحري",
        "postCode": "16039"
      },
      {
        "fr": "Bordj El Kiffan",
        "ar": "برج الكيفان",
        "postCode": "16030"
      },
      {
        "fr": "Bourouba",
        "ar": "بوروبة",
        "postCode": "16016"
      },
      {
        "fr": "Bouzareah",
        "ar": "بوزريعة",
        "postCode": "16011"
      },
      {
        "fr": "Casbah",
        "ar": "القصبة",
        "postCode": "16007"
      },
      {
        "fr": "Cheraga",
        "ar": "شراقة",
        "postCode": "16050"
      },
      {
        "fr": "Dar El Beida",
        "ar": "الدار البيضاء",
        "postCode": "16020"
      },
      {
        "fr": "Dely Ibrahim",
        "ar": "دالي ابراهيم",
        "postCode": "16023"
      },
      {
        "fr": "Djasr Kasentina",
        "ar": "جسر قسنطينة",
        "postCode": "16026"
      },
      {
        "fr": "Douera",
        "ar": "دويرة",
        "postCode": "16054"
      },
      {
        "fr": "Draria",
        "ar": "درارية",
        "postCode": "16053"
      },
      {
        "fr": "El Achour",
        "ar": "العاشور",
        "postCode": "16052"
      },
      {
        "fr": "El Biar",
        "ar": "الآبيار",
        "postCode": "16010"
      },
      {
        "fr": "El Hammamet",
        "ar": "الحمامات",
        "postCode": "16024"
      },
      {
        "fr": "El Harrach",
        "ar": "الحراش",
        "postCode": "16013"
      },
      {
        "fr": "El Madania",
        "ar": "المدنية",
        "postCode": "16003"
      },
      {
        "fr": "El Magharia",
        "ar": "المقرية",
        "postCode": "16031"
      },
      {
        "fr": "El Mouradia",
        "ar": "المرادية",
        "postCode": "16027"
      },
      {
        "fr": "Haraoua",
        "ar": "هراوة",
        "postCode": "16041"
      },
      {
        "fr": "Hussein Dey",
        "ar": "حسين داي",
        "postCode": "16017"
      },
      {
        "fr": "Hydra",
        "ar": "حيدرة",
        "postCode": "16028"
      },
      {
        "fr": "Khracia",
        "ar": "خرايسية",
        "postCode": "16056"
      },
      {
        "fr": "Kouba",
        "ar": "القبة",
        "postCode": "16018"
      },
      {
        "fr": "Les Eucalyptus",
        "ar": "الكليتوس",
        "postCode": "16033"
      },
      {
        "fr": "Mahelma",
        "ar": "محالمة",
        "postCode": "16047"
      },
      {
        "fr": "Marsa",
        "ar": "المرسى",
        "postCode": "16040"
      },
      {
        "fr": "Mohammadia",
        "ar": "المحمدية",
        "postCode": "16029"
      },
      {
        "fr": "Oued Koriche",
        "ar": "وادي قريش",
        "postCode": "16008"
      },
      {
        "fr": "Oued Smar",
        "ar": "وادي سمار",
        "postCode": "16015"
      },
      {
        "fr": "Ouled Chebel",
        "ar": "أولاد الشبل",
        "postCode": "16036"
      },
      {
        "fr": "Ouled Fayet",
        "ar": "أولاد فايت",
        "postCode": "16051"
      },
      {
        "fr": "Rahmania",
        "ar": "رحمانية",
        "postCode": "16048"
      },
      {
        "fr": "Rais Hamidou",
        "ar": "الرايس حميدو",
        "postCode": "16025"
      },
      {
        "fr": "Reghaia",
        "ar": "الرغاية",
        "postCode": "16043"
      },
      {
        "fr": "Rouiba",
        "ar": "رويبة",
        "postCode": "16042"
      },
      {
        "fr": "Saoula",
        "ar": "السحاولة",
        "postCode": "16057"
      },
      {
        "fr": "Sidi Mhamed",
        "ar": "سيدي امحمد",
        "postCode": "16002"
      },
      {
        "fr": "Sidi Moussa",
        "ar": "سيدي موسى",
        "postCode": "16037"
      },
      {
        "fr": "Souidania",
        "ar": "سويدانية",
        "postCode": "16049"
      },
      {
        "fr": "Staoueli",
        "ar": "سطاوالي",
        "postCode": "16045"
      },
      {
        "fr": "Tassala El Merdja",
        "ar": "تسالة المرجة",
        "postCode": "16035"
      },
      {
        "fr": "Zeralda",
        "ar": "زرالدة",
        "postCode": "16046"
      }
    ]
  },
  {
    "code": "17",
    "name_fr": "Djelfa",
    "name_ar": "الجلفة",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Ain Chouhada",
        "ar": "عين الشهداء",
        "postCode": "17023"
      },
      {
        "fr": "Ain El Ibel",
        "ar": "عين الابل",
        "postCode": "17030"
      },
      {
        "fr": "Ain Maabed",
        "ar": "عين معبد",
        "postCode": "17005"
      },
      {
        "fr": "Amourah",
        "ar": "عمورة",
        "postCode": "17034"
      },
      {
        "fr": "Beni Yacoub",
        "ar": "بن يعقوب",
        "postCode": "17027"
      },
      {
        "fr": "Bouira Lahdeb",
        "ar": "بويرة الأحداب",
        "postCode": "17009"
      },
      {
        "fr": "Charef",
        "ar": "الشارف",
        "postCode": "17026"
      },
      {
        "fr": "Dar Chouikh",
        "ar": "دار الشيوخ",
        "postCode": "17025"
      },
      {
        "fr": "Djelfa",
        "ar": "الجلفة",
        "postCode": "17001"
      },
      {
        "fr": "Douis",
        "ar": "الدويس",
        "postCode": "17015"
      },
      {
        "fr": "El Guedid",
        "ar": "القديد",
        "postCode": "17003"
      },
      {
        "fr": "El Idrissia",
        "ar": "الإدريسية",
        "postCode": "17014"
      },
      {
        "fr": "El Khemis",
        "ar": "الخميس",
        "postCode": "17011"
      },
      {
        "fr": "Feidh El Botma",
        "ar": "فيض البطمة",
        "postCode": "17007"
      },
      {
        "fr": "Guettara",
        "ar": "قتارة",
        "postCode": "17018"
      },
      {
        "fr": "Hassi Bahbah",
        "ar": "حاسي بحبح",
        "postCode": "17004"
      },
      {
        "fr": "Hassi El Euch",
        "ar": "حاسي العش",
        "postCode": "17016"
      },
      {
        "fr": "M'Liliha",
        "ar": "المليليحة",
        "postCode": "17013"
      },
      {
        "fr": "Moudjebara",
        "ar": "مجبرة",
        "postCode": "17002"
      },
      {
        "fr": "Oum Laadham",
        "ar": "ام العظام",
        "postCode": "17024"
      },
      {
        "fr": "Sidi Baizid",
        "ar": "سيدي بايزيد",
        "postCode": "17012"
      },
      {
        "fr": "Tadmit",
        "ar": "تعضميت",
        "postCode": "17036"
      },
      {
        "fr": "Zaafrane",
        "ar": "الزعفران",
        "postCode": "17028"
      },
      {
        "fr": "Zaccar",
        "ar": "زكار",
        "postCode": "17010"
      }
    ]
  },
  {
    "code": "18",
    "name_fr": "Jijel",
    "name_ar": "جيجل",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Bordj T'her",
        "ar": "برج الطهر",
        "postCode": "18026"
      },
      {
        "fr": "Boudria Beni Yadjis",
        "ar": "بودريعة بن ياجيس",
        "postCode": "18022"
      },
      {
        "fr": "Bouraoui Belhadef",
        "ar": "بوراوي بلهادف",
        "postCode": "18016"
      },
      {
        "fr": "Boussif Ouled Askeur",
        "ar": "أولاد عسكر",
        "postCode": "18019"
      },
      {
        "fr": "Chahna",
        "ar": "الشحنة",
        "postCode": "18008"
      },
      {
        "fr": "Chekfa",
        "ar": "الشقفة",
        "postCode": "18007"
      },
      {
        "fr": "Djemaa Beni Habibi",
        "ar": "الجمعة بني حبيبي",
        "postCode": "18025"
      },
      {
        "fr": "Djmila",
        "ar": "جيملة",
        "postCode": "18017"
      },
      {
        "fr": "El Ancer",
        "ar": "العنصر",
        "postCode": "18012"
      },
      {
        "fr": "El Aouana",
        "ar": "العوانة",
        "postCode": "18003"
      },
      {
        "fr": "El Kennar Nouchfi",
        "ar": "القنار",
        "postCode": "18020"
      },
      {
        "fr": "El Milia",
        "ar": "الميلية",
        "postCode": "18009"
      },
      {
        "fr": "Emir Abdelkader",
        "ar": "الامير عبد القادر",
        "postCode": "18006"
      },
      {
        "fr": "Erraguene",
        "ar": "إراڨن",
        "postCode": "18002"
      },
      {
        "fr": "Ghebala",
        "ar": "غبالة",
        "postCode": "18015"
      },
      {
        "fr": "Jijel",
        "ar": "جيجل",
        "postCode": "18001"
      },
      {
        "fr": "Kaous",
        "ar": "قاوس",
        "postCode": "18014"
      },
      {
        "fr": "Kemir Oued Adjoul",
        "ar": "بني بلعيد",
        "postCode": "18023"
      },
      {
        "fr": "Ouadjana",
        "ar": "وجانة",
        "postCode": "18028"
      },
      {
        "fr": "Ouled Rabah",
        "ar": "ولاد رابح",
        "postCode": "18027"
      },
      {
        "fr": "Ouled Yahia Khadrouch",
        "ar": "اولاد يحيى",
        "postCode": "18021"
      },
      {
        "fr": "Selma Benziada",
        "ar": "سلمى بن زيادة",
        "postCode": "18018"
      },
      {
        "fr": "Settara",
        "ar": "السطارة",
        "postCode": "18011"
      },
      {
        "fr": "Sidi Abdelaziz",
        "ar": "سيدي عبد العزيز",
        "postCode": "18013"
      },
      {
        "fr": "Sidi Maarouf",
        "ar": "سيدي معروف",
        "postCode": "18010"
      },
      {
        "fr": "Taher",
        "ar": "الطاهير",
        "postCode": "18005"
      },
      {
        "fr": "Texena",
        "ar": "تاكسنة",
        "postCode": "18024"
      },
      {
        "fr": "Ziamma Mansouriah",
        "ar": "زيامة منصورية",
        "postCode": "18004"
      }
    ]
  },
  {
    "code": "19",
    "name_fr": "Setif",
    "name_ar": "سطيف",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain Abessa",
        "ar": "عين عباسـة",
        "postCode": "19014"
      },
      {
        "fr": "Ain Arnat",
        "ar": "عين أرنـات",
        "postCode": "19026"
      },
      {
        "fr": "Ain Azal",
        "ar": "عين أزال",
        "postCode": "19040"
      },
      {
        "fr": "Ain El Kebira",
        "ar": "عين الكبيرة",
        "postCode": "19002"
      },
      {
        "fr": "Ain Lahdjar",
        "ar": "عين لحجـر",
        "postCode": "19018"
      },
      {
        "fr": "Ain Legraj",
        "ar": "عين لڨراج",
        "postCode": "19013"
      },
      {
        "fr": "Ain Oulmane",
        "ar": "عين ولمان",
        "postCode": "19028"
      },
      {
        "fr": "Ain Roua",
        "ar": "عين الروى",
        "postCode": "19006"
      },
      {
        "fr": "Ain Sebt",
        "ar": "عين السبت",
        "postCode": "19049"
      },
      {
        "fr": "Ait Naoual Mezada",
        "ar": "آيت نوال مزادة",
        "postCode": "19051"
      },
      {
        "fr": "Ait Tizi",
        "ar": "آيت تيزي",
        "postCode": "19054"
      },
      {
        "fr": "Amoucha",
        "ar": "عموشة",
        "postCode": "19027"
      },
      {
        "fr": "Babor",
        "ar": "بابور",
        "postCode": "19016"
      },
      {
        "fr": "Bazer Sakhra",
        "ar": "بازر الصخرة",
        "postCode": "19031"
      },
      {
        "fr": "Beidha Bordj",
        "ar": "بيضاء برج",
        "postCode": "19029"
      },
      {
        "fr": "Belaa",
        "ar": "البلاعة",
        "postCode": "19025"
      },
      {
        "fr": "Beni Aziz",
        "ar": "بني عزيز",
        "postCode": "19003"
      },
      {
        "fr": "Beni Chebana",
        "ar": "بني شبانة",
        "postCode": "19009"
      },
      {
        "fr": "Beni Fouda",
        "ar": "بني فودة",
        "postCode": "19044"
      },
      {
        "fr": "Beni Hocine",
        "ar": "بني حسين",
        "postCode": "19053"
      },
      {
        "fr": "Beni Mouhli",
        "ar": "إيث موحلي",
        "postCode": "19046"
      },
      {
        "fr": "Beni Ouartilane",
        "ar": "بني ورتيلان",
        "postCode": "19022"
      },
      {
        "fr": "Bir El Arch",
        "ar": "بئر العرش",
        "postCode": "19008"
      },
      {
        "fr": "Bir Haddada",
        "ar": "بئر حدادة",
        "postCode": "19034"
      },
      {
        "fr": "Bouandas",
        "ar": "بوعنداس",
        "postCode": "19030"
      },
      {
        "fr": "Bougaa",
        "ar": "بوقاعـة",
        "postCode": "19043"
      },
      {
        "fr": "Bousselam",
        "ar": "بوسلام",
        "postCode": "19019"
      },
      {
        "fr": "Boutaleb",
        "ar": "بوطالب",
        "postCode": "19005"
      },
      {
        "fr": "Dehamcha",
        "ar": "الدهامشة",
        "postCode": "19015"
      },
      {
        "fr": "Djemila",
        "ar": "جميلـة",
        "postCode": "19021"
      },
      {
        "fr": "Draa Kebila",
        "ar": "ذراع قبيلة",
        "postCode": "19007"
      },
      {
        "fr": "El Eulma",
        "ar": "العلمة",
        "postCode": "19020"
      },
      {
        "fr": "El Ouldja",
        "ar": "الولجـة",
        "postCode": "19059"
      },
      {
        "fr": "El Ouricia",
        "ar": "الأورسية",
        "postCode": "19037"
      },
      {
        "fr": "Guellal",
        "ar": "قلال",
        "postCode": "19048"
      },
      {
        "fr": "Guelta Zerka",
        "ar": "القلتة الزرقاء",
        "postCode": "19056"
      },
      {
        "fr": "Guenzet",
        "ar": "ڨنزات",
        "postCode": "19041"
      },
      {
        "fr": "Guidjel",
        "ar": "قجــال",
        "postCode": "19017"
      },
      {
        "fr": "Hamma",
        "ar": "حــامة",
        "postCode": "19011"
      },
      {
        "fr": "Hammam Essokhna",
        "ar": "حمــام السخنة",
        "postCode": "19032"
      },
      {
        "fr": "Hammam Guergour",
        "ar": "حمام قرقور",
        "postCode": "19050"
      },
      {
        "fr": "Harbil",
        "ar": "حربيل",
        "postCode": "19036"
      },
      {
        "fr": "Ksar El Abtal",
        "ar": "قصرالأبطال",
        "postCode": "19052"
      },
      {
        "fr": "Maaouia",
        "ar": "معـاويـة",
        "postCode": "19012"
      },
      {
        "fr": "Maouklane",
        "ar": "موكلان",
        "postCode": "19055"
      },
      {
        "fr": "Mezloug",
        "ar": "مزلوق",
        "postCode": "19033"
      },
      {
        "fr": "Oued El Barad",
        "ar": "واد البارد",
        "postCode": "19057"
      },
      {
        "fr": "Ouled Addouane",
        "ar": "أولاد عدوان",
        "postCode": "19024"
      },
      {
        "fr": "Ouled Sabor",
        "ar": "أولاد صـابر",
        "postCode": "19047"
      },
      {
        "fr": "Ouled Sidi Ahmed",
        "ar": "أولاد سي أحمد",
        "postCode": "19004"
      },
      {
        "fr": "Ouled Tebben",
        "ar": "أولاد تبــان",
        "postCode": "19010"
      },
      {
        "fr": "Rosfa",
        "ar": "الرصفة",
        "postCode": "19023"
      },
      {
        "fr": "Salah Bey",
        "ar": "صـالح باي",
        "postCode": "19039"
      },
      {
        "fr": "Serdj El Ghoul",
        "ar": "سرج الغول",
        "postCode": "19035"
      },
      {
        "fr": "Setif",
        "ar": "سطيف‎",
        "postCode": "19001"
      },
      {
        "fr": "Tachouda",
        "ar": "تاشودة",
        "postCode": "19045"
      },
      {
        "fr": "Talaifacene",
        "ar": "تالة إيفاسن",
        "postCode": "19042"
      },
      {
        "fr": "Taya",
        "ar": "طاية",
        "postCode": "19058"
      },
      {
        "fr": "Tella",
        "ar": "التلة",
        "postCode": "19060"
      },
      {
        "fr": "Tizi Nbechar",
        "ar": "تيزي نبشار",
        "postCode": "19038"
      }
    ]
  },
  {
    "code": "20",
    "name_fr": "Saida",
    "name_ar": "سعيدة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain El Hadjar",
        "ar": "عين الحجر",
        "postCode": "20003"
      },
      {
        "fr": "Ain Sekhouna",
        "ar": "العين السخونة",
        "postCode": "20013"
      },
      {
        "fr": "Ain Soltane",
        "ar": "عين السلطان",
        "postCode": "20016"
      },
      {
        "fr": "Doui Thabet",
        "ar": "دوى ثابت",
        "postCode": "20002"
      },
      {
        "fr": "El Hassasna",
        "ar": "حساسنة",
        "postCode": "20010"
      },
      {
        "fr": "Hounet",
        "ar": "هونت",
        "postCode": "20007"
      },
      {
        "fr": "Maamora",
        "ar": "معمورة",
        "postCode": "20011"
      },
      {
        "fr": "Moulay Larbi",
        "ar": "موالي العربي",
        "postCode": "20005"
      },
      {
        "fr": "Ouled Brahim",
        "ar": "أولاد ابراھيم",
        "postCode": "20014"
      },
      {
        "fr": "Ouled Khaled",
        "ar": "أولاد خالد",
        "postCode": "20004"
      },
      {
        "fr": "Saida",
        "ar": "سعيدة",
        "postCode": "20001"
      },
      {
        "fr": "Sidi Ahmed",
        "ar": "سيدي أحمد",
        "postCode": "20012"
      },
      {
        "fr": "Sidi Amar",
        "ar": "يدي عمر",
        "postCode": "20008"
      },
      {
        "fr": "Sidi Boubekeur",
        "ar": "سيدي بوبكر",
        "postCode": "20009"
      },
      {
        "fr": "Tircine",
        "ar": "تيرسين",
        "postCode": "20015"
      },
      {
        "fr": "Youb",
        "ar": "يوب",
        "postCode": "20006"
      }
    ]
  },
  {
    "code": "21",
    "name_fr": "Skikda",
    "name_ar": "سكيكدة",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain Bouziane",
        "ar": "عين بوزيان",
        "postCode": "21022"
      },
      {
        "fr": "Ain Cherchar",
        "ar": "عين شرشار",
        "postCode": "21006"
      },
      {
        "fr": "Ain Kechra",
        "ar": "عين قشرة",
        "postCode": "21027"
      },
      {
        "fr": "Ain Zouit",
        "ar": "عين زويت",
        "postCode": "21002"
      },
      {
        "fr": "Azzaba",
        "ar": "عزابة",
        "postCode": "21004"
      },
      {
        "fr": "Bein El Ouiden",
        "ar": "بين الويدان",
        "postCode": "21029"
      },
      {
        "fr": "Bekkouche Lakhdar",
        "ar": "بكوش لخضر",
        "postCode": "21007"
      },
      {
        "fr": "Ben Azzouz",
        "ar": "بن عزوز",
        "postCode": "21008"
      },
      {
        "fr": "Beni Bachir",
        "ar": "بني بشير",
        "postCode": "21024"
      },
      {
        "fr": "Beni Oulbane",
        "ar": "بني والبان",
        "postCode": "21021"
      },
      {
        "fr": "Beni Zid",
        "ar": "بنى زيد",
        "postCode": "21011"
      },
      {
        "fr": "Bouchtata",
        "ar": "بوشطاطة",
        "postCode": "21034"
      },
      {
        "fr": "Cheraia",
        "ar": "الشرايع",
        "postCode": "21031"
      },
      {
        "fr": "Collo",
        "ar": "القل",
        "postCode": "21010"
      },
      {
        "fr": "Djendel",
        "ar": "جندل",
        "postCode": "21005"
      },
      {
        "fr": "El Ghedir",
        "ar": "الغدير",
        "postCode": "21033"
      },
      {
        "fr": "El Hadaik",
        "ar": "الحدايق",
        "postCode": "21003"
      },
      {
        "fr": "El Harrouch",
        "ar": "الحروش",
        "postCode": "21016"
      },
      {
        "fr": "El Marsa",
        "ar": "المرسى",
        "postCode": "21038"
      },
      {
        "fr": "Emdjez Edchich",
        "ar": "مجاز الدشيش",
        "postCode": "21020"
      },
      {
        "fr": "Es Sebt",
        "ar": "السبت",
        "postCode": "21009"
      },
      {
        "fr": "Filfila",
        "ar": "فلفلة",
        "postCode": "21030"
      },
      {
        "fr": "Hamadi Krouma",
        "ar": "حمادي كرومة",
        "postCode": "21037"
      },
      {
        "fr": "Kanoua",
        "ar": "قنواع",
        "postCode": "21032"
      },
      {
        "fr": "Kerkera",
        "ar": "كركرة",
        "postCode": "21012"
      },
      {
        "fr": "Kheneg Mayoum",
        "ar": "خنق مايوم",
        "postCode": "21036"
      },
      {
        "fr": "Oued Zehour",
        "ar": "وادي الزهور",
        "postCode": "21014"
      },
      {
        "fr": "Ouldja Boulbalout",
        "ar": "الولجة بو البلوط",
        "postCode": "21035"
      },
      {
        "fr": "Ouled Attia",
        "ar": "أولاد عطية",
        "postCode": "21013"
      },
      {
        "fr": "Ouled Hebaba",
        "ar": "أولاد حبابة",
        "postCode": "21018"
      },
      {
        "fr": "Oum Toub",
        "ar": "أم الطوب",
        "postCode": "21028"
      },
      {
        "fr": "Ramdane Djamel",
        "ar": "رمضان جمال",
        "postCode": "21023"
      },
      {
        "fr": "Salah Bouchaour",
        "ar": "صالح بوالشعور",
        "postCode": "21025"
      },
      {
        "fr": "Sidi Mezghiche",
        "ar": "سيدي مزغيش",
        "postCode": "21019"
      },
      {
        "fr": "Skikda",
        "ar": "سكيكدة",
        "postCode": "21001"
      },
      {
        "fr": "Tamalous",
        "ar": "تمالوس",
        "postCode": "21026"
      },
      {
        "fr": "Zerdazas",
        "ar": "زردازة",
        "postCode": "21017"
      },
      {
        "fr": "Zitouna",
        "ar": "الزيتونة",
        "postCode": "21015"
      }
    ]
  },
  {
    "code": "22",
    "name_fr": "Sidi Bel Abbes",
    "name_ar": "سيدي بلعباس",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Adden",
        "ar": "عين عدان",
        "postCode": "22030"
      },
      {
        "fr": "Ain El Berd",
        "ar": "عين البرد",
        "postCode": "22028"
      },
      {
        "fr": "Ain Kada",
        "ar": "عين قادة",
        "postCode": "22025"
      },
      {
        "fr": "Ain Thrid",
        "ar": "عين التريد",
        "postCode": "22015"
      },
      {
        "fr": "Ain Tindamine",
        "ar": "عين تندامين",
        "postCode": "22024"
      },
      {
        "fr": "Amarnas",
        "ar": "العمارنة",
        "postCode": "22012"
      },
      {
        "fr": "Badredine El Mokrani",
        "ar": "بدر الدين المقراني",
        "postCode": "22009"
      },
      {
        "fr": "Belarbi",
        "ar": "بلعربي",
        "postCode": "22042"
      },
      {
        "fr": "Ben Badis",
        "ar": "ابن باديس",
        "postCode": "22045"
      },
      {
        "fr": "Benachiba Chelia",
        "ar": "بن عشيبة شلية",
        "postCode": "22051"
      },
      {
        "fr": "Bir El Hammam",
        "ar": "بئر الحمام",
        "postCode": "22048"
      },
      {
        "fr": "Boudjebaa El Bordj",
        "ar": "بوجبهة البرج",
        "postCode": "22038"
      },
      {
        "fr": "Boukhanafis",
        "ar": "بوخنفيس",
        "postCode": "22007"
      },
      {
        "fr": "Chetouane Belaila",
        "ar": "شطوان بلايلة",
        "postCode": "22047"
      },
      {
        "fr": "Dhaya",
        "ar": "الظاية",
        "postCode": "22032"
      },
      {
        "fr": "El Hacaiba",
        "ar": "الحصيبة",
        "postCode": "22019"
      },
      {
        "fr": "Hassi Dahou",
        "ar": "حاسي دحو",
        "postCode": "22052"
      },
      {
        "fr": "Hassi Zehana",
        "ar": "حاسي زهانة",
        "postCode": "22020"
      },
      {
        "fr": "Lamtar",
        "ar": "لمطار",
        "postCode": "22034"
      },
      {
        "fr": "Makedra",
        "ar": "مكدرة",
        "postCode": "22016"
      },
      {
        "fr": "Marhoum",
        "ar": "مرحوم",
        "postCode": "22010"
      },
      {
        "fr": "Mcid",
        "ar": "مسيد",
        "postCode": "22026"
      },
      {
        "fr": "Merine",
        "ar": "مرين",
        "postCode": "22022"
      },
      {
        "fr": "Mezaourou",
        "ar": "مزاورو",
        "postCode": "22006"
      },
      {
        "fr": "Mostefa Ben Brahim",
        "ar": "مصطفى بن ابراهيم",
        "postCode": "22004"
      },
      {
        "fr": "Moulay Slissen",
        "ar": "مولاي سليسن",
        "postCode": "22018"
      },
      {
        "fr": "Oued Sbaa",
        "ar": "واد السبع",
        "postCode": "22037"
      },
      {
        "fr": "Oued Sefioun",
        "ar": "واد سفيون",
        "postCode": "22043"
      },
      {
        "fr": "Oued Taourira",
        "ar": "واد تاوريرة",
        "postCode": "22031"
      },
      {
        "fr": "Ras El Ma",
        "ar": "رأس الماء",
        "postCode": "22023"
      },
      {
        "fr": "Redjem Demouche",
        "ar": "رجم دموش",
        "postCode": "22050"
      },
      {
        "fr": "Sehala Thaoura",
        "ar": "سهالة الثورة",
        "postCode": "22039"
      },
      {
        "fr": "Sfissef",
        "ar": "سفيزف",
        "postCode": "22029"
      },
      {
        "fr": "Sidi Ali Benyoub",
        "ar": "سيدي علي بن يوب",
        "postCode": "22046"
      },
      {
        "fr": "Sidi Ali Boussidi",
        "ar": "سيدي علي بوسيدي",
        "postCode": "22008"
      },
      {
        "fr": "Sidi Bel Abbes",
        "ar": "سيدي بلعباس",
        "postCode": "22001"
      },
      {
        "fr": "Sidi Brahim",
        "ar": "سيدي ابراهيم",
        "postCode": "22003"
      },
      {
        "fr": "Sidi Chaib",
        "ar": "سيدي شعيب",
        "postCode": "22035"
      },
      {
        "fr": "Sidi Dahou",
        "ar": "سيدي دحو",
        "postCode": "22036"
      },
      {
        "fr": "Sidi Hamadouche",
        "ar": "سيدي حمادوش",
        "postCode": "22041"
      },
      {
        "fr": "Sidi Khaled",
        "ar": "سيدي خالد",
        "postCode": "22027"
      },
      {
        "fr": "Sidi Lahcene",
        "ar": "سيدي لحسن",
        "postCode": "22014"
      },
      {
        "fr": "Sidi Yacoub",
        "ar": "سيدي يعقوب",
        "postCode": "22040"
      },
      {
        "fr": "Tabia",
        "ar": "طابية",
        "postCode": "22021"
      },
      {
        "fr": "Tafissour",
        "ar": "تفسور",
        "postCode": "22011"
      },
      {
        "fr": "Taoudmout",
        "ar": "تاودموت",
        "postCode": "22049"
      },
      {
        "fr": "Teghalimet",
        "ar": "تغاليمت",
        "postCode": "22044"
      },
      {
        "fr": "Telagh",
        "ar": "تلاغ",
        "postCode": "22005"
      },
      {
        "fr": "Tenira",
        "ar": "تنيرة",
        "postCode": "22017"
      },
      {
        "fr": "Tessala",
        "ar": "تسالة",
        "postCode": "22002"
      },
      {
        "fr": "Tilmouni",
        "ar": "تلموني",
        "postCode": "22013"
      },
      {
        "fr": "Zerouala",
        "ar": "زروالة",
        "postCode": "22033"
      }
    ]
  },
  {
    "code": "23",
    "name_fr": "Annaba",
    "name_ar": "عنابة",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain Berda",
        "ar": "عين الباردة",
        "postCode": "23009"
      },
      {
        "fr": "Annaba",
        "ar": "عنابة",
        "postCode": "23001"
      },
      {
        "fr": "Berrahel",
        "ar": "برحال",
        "postCode": "23002"
      },
      {
        "fr": "Chetaibi",
        "ar": "شطايبي",
        "postCode": "23010"
      },
      {
        "fr": "Cheurfa",
        "ar": "الشرفة",
        "postCode": "23007"
      },
      {
        "fr": "El Bouni",
        "ar": "البوني",
        "postCode": "23005"
      },
      {
        "fr": "El Hadjar",
        "ar": "الحجار",
        "postCode": "23003"
      },
      {
        "fr": "Eulma",
        "ar": "العلمة",
        "postCode": "23004"
      },
      {
        "fr": "Oued El Aneb",
        "ar": "وادي العنب",
        "postCode": "23006"
      },
      {
        "fr": "Seraidi",
        "ar": "سرايدي",
        "postCode": "23008"
      },
      {
        "fr": "Sidi Amer",
        "ar": "سيدي عمار",
        "postCode": "23011"
      },
      {
        "fr": "Treat",
        "ar": "التريعات",
        "postCode": "23012"
      }
    ]
  },
  {
    "code": "24",
    "name_fr": "Guelma",
    "name_ar": "قالمة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Ben Beida",
        "ar": "عين بن بيضاء",
        "postCode": "24014"
      },
      {
        "fr": "Ain Larbi",
        "ar": "عين العربى",
        "postCode": "24023"
      },
      {
        "fr": "Ain Makhlouf",
        "ar": "عين مخلوف",
        "postCode": "24013"
      },
      {
        "fr": "Ain Reggada",
        "ar": "عين رقادة",
        "postCode": "24032"
      },
      {
        "fr": "Ain Sandel",
        "ar": "عين صندل",
        "postCode": "24007"
      },
      {
        "fr": "Belkhir",
        "ar": "بلخير",
        "postCode": "24010"
      },
      {
        "fr": "Ben Djarah",
        "ar": "بن جراح",
        "postCode": "24011"
      },
      {
        "fr": "Beni Mezline",
        "ar": "بني مزلين",
        "postCode": "24016"
      },
      {
        "fr": "Bordj Sabat",
        "ar": "برج صباط",
        "postCode": "24021"
      },
      {
        "fr": "Bou Hachana",
        "ar": "بوحشانة",
        "postCode": "24017"
      },
      {
        "fr": "Bou Hamdane",
        "ar": "بوحمدان",
        "postCode": "24012"
      },
      {
        "fr": "Bouati Mahmoud",
        "ar": "بوعاتي محمود",
        "postCode": "24003"
      },
      {
        "fr": "Bouchegouf",
        "ar": "بوشقوف",
        "postCode": "24025"
      },
      {
        "fr": "Boumahra Ahmed",
        "ar": "بومهرة أحمد",
        "postCode": "24031"
      },
      {
        "fr": "Dahouara",
        "ar": "الدهوارة",
        "postCode": "24009"
      },
      {
        "fr": "Djeballah Khemissi",
        "ar": "جبالة لخميسي",
        "postCode": "24034"
      },
      {
        "fr": "El Fedjoudj",
        "ar": "الفجوج",
        "postCode": "24020"
      },
      {
        "fr": "Guelaat Bou Sbaa",
        "ar": "قلعة بوصبع",
        "postCode": "24018"
      },
      {
        "fr": "Guelma",
        "ar": "قالمة",
        "postCode": "24001"
      },
      {
        "fr": "Hammam Maskhoutine",
        "ar": "حمام مسخوطين",
        "postCode": "24019"
      },
      {
        "fr": "Hamman Nbail",
        "ar": "حمام النبايل",
        "postCode": "24022"
      },
      {
        "fr": "Heliopolis",
        "ar": "ھيليوبوليس",
        "postCode": "24026"
      },
      {
        "fr": "Houari Boumediene",
        "ar": "هواري بومدين",
        "postCode": "24027"
      },
      {
        "fr": "Khezara",
        "ar": "خزارة",
        "postCode": "24015"
      },
      {
        "fr": "Medjez Amar",
        "ar": "مجاز عمار",
        "postCode": "24024"
      },
      {
        "fr": "Medjez Sfa",
        "ar": "مجاز الصفاء",
        "postCode": "24030"
      },
      {
        "fr": "Nechmaya",
        "ar": "نشماية",
        "postCode": "24002"
      },
      {
        "fr": "Oued Cheham",
        "ar": "وادي الشحم",
        "postCode": "24033"
      },
      {
        "fr": "Oued Fragha",
        "ar": "وادي فراغة",
        "postCode": "24006"
      },
      {
        "fr": "Oued Zenati",
        "ar": "وادي الزناتي",
        "postCode": "24004"
      },
      {
        "fr": "Ras El Agba",
        "ar": "راس العقبة",
        "postCode": "24008"
      },
      {
        "fr": "Roknia",
        "ar": "الركنية",
        "postCode": "24028"
      },
      {
        "fr": "Salaoua Announa",
        "ar": "سلاوة عنونة",
        "postCode": "24029"
      },
      {
        "fr": "Tamlouka",
        "ar": "تاملوكة",
        "postCode": "24005"
      }
    ]
  },
  {
    "code": "25",
    "name_fr": "Constantine",
    "name_ar": "قسنطينة",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain Abid",
        "ar": "عين عبيد",
        "postCode": "25007"
      },
      {
        "fr": "Ain Smara",
        "ar": "عين سمارة",
        "postCode": "25010"
      },
      {
        "fr": "Beni Hamiden",
        "ar": "بني حميدان",
        "postCode": "25008"
      },
      {
        "fr": "Constantine",
        "ar": "قسنطينة",
        "postCode": "25001"
      },
      {
        "fr": "Didouche Mourad",
        "ar": "ديدوش مراد",
        "postCode": "25005"
      },
      {
        "fr": "El Khroub",
        "ar": "الخروب",
        "postCode": "25006"
      },
      {
        "fr": "Hamma Bouziane",
        "ar": "حامة بوزيان",
        "postCode": "25002"
      },
      {
        "fr": "Ibn Badis",
        "ar": "إبن باديس",
        "postCode": "25003"
      },
      {
        "fr": "Ibn Ziad",
        "ar": "ابن زياد",
        "postCode": "25012"
      },
      {
        "fr": "Mesaoud Boudjeriou",
        "ar": "مسعود بوجريو",
        "postCode": "25011"
      },
      {
        "fr": "Ouled Rahmoune",
        "ar": "أولاد رحمون",
        "postCode": "25009"
      },
      {
        "fr": "Zighoud Youcef",
        "ar": "زيغود يوسف",
        "postCode": "25004"
      }
    ]
  },
  {
    "code": "26",
    "name_fr": "Medea",
    "name_ar": "المدية",
    "deliveryFeeDZD": 550,
    "communes": [
      {
        "fr": "Ain Boucif",
        "ar": "عين بوسيف",
        "postCode": "26004"
      },
      {
        "fr": "Ain Ouksir",
        "ar": "عين القصير",
        "postCode": "26041"
      },
      {
        "fr": "Aissaouia",
        "ar": "العيساوية",
        "postCode": "26005"
      },
      {
        "fr": "Baata",
        "ar": "بعطة",
        "postCode": "26024"
      },
      {
        "fr": "Benchicao",
        "ar": "بن شكاو",
        "postCode": "26030"
      },
      {
        "fr": "Beni Slimane",
        "ar": "بني سليمان",
        "postCode": "26046"
      },
      {
        "fr": "Berrouaghia",
        "ar": "البرواڨية",
        "postCode": "26047"
      },
      {
        "fr": "Bir Ben Laabed",
        "ar": "بئر بن العابد",
        "postCode": "26056"
      },
      {
        "fr": "Boghar",
        "ar": "بوغار",
        "postCode": "26025"
      },
      {
        "fr": "Bouaiche",
        "ar": "بوعيش",
        "postCode": "26010"
      },
      {
        "fr": "Bouaichoune",
        "ar": "بوعيشون",
        "postCode": "26059"
      },
      {
        "fr": "Bouchrahil",
        "ar": "بوشراحيل",
        "postCode": "26021"
      },
      {
        "fr": "Boughezoul",
        "ar": "بوغزول",
        "postCode": "26051"
      },
      {
        "fr": "Bouskene",
        "ar": "بوسكن",
        "postCode": "26019"
      },
      {
        "fr": "Chelalet El Adhaoura",
        "ar": "شلالة العذاورة",
        "postCode": "26018"
      },
      {
        "fr": "Cheniguel",
        "ar": "شنيڨل",
        "postCode": "26040"
      },
      {
        "fr": "Derrag",
        "ar": "دراڨ",
        "postCode": "26008"
      },
      {
        "fr": "Deux Bassins",
        "ar": "فج الحوضين",
        "postCode": "26053"
      },
      {
        "fr": "Djouab",
        "ar": "جواب",
        "postCode": "26037"
      },
      {
        "fr": "Draa Essamar",
        "ar": "ذراع السمار",
        "postCode": "26054"
      },
      {
        "fr": "El Azizia",
        "ar": "العزيزية",
        "postCode": "26036"
      },
      {
        "fr": "El Guelbelkebir",
        "ar": "القلب الكبير",
        "postCode": "26009"
      },
      {
        "fr": "El Hamdania",
        "ar": "الحمدانية",
        "postCode": "26016"
      },
      {
        "fr": "El Ouinet",
        "ar": "العوينات",
        "postCode": "26057"
      },
      {
        "fr": "Hannacha",
        "ar": "حناشة",
        "postCode": "26060"
      },
      {
        "fr": "Kef Lakhdar",
        "ar": "الكاف الأخضر",
        "postCode": "26017"
      },
      {
        "fr": "Khams Djouamaa",
        "ar": "خمس جوامع",
        "postCode": "26063"
      },
      {
        "fr": "Medea",
        "ar": "المدية",
        "postCode": "26001"
      },
      {
        "fr": "Medjebar",
        "ar": "مجبر",
        "postCode": "26062"
      },
      {
        "fr": "Meftaha",
        "ar": "المفاتحة",
        "postCode": "26049"
      },
      {
        "fr": "Meghraoua",
        "ar": "مغراوة",
        "postCode": "26039"
      },
      {
        "fr": "Mezerena",
        "ar": "مزغنة",
        "postCode": "26011"
      },
      {
        "fr": "Mihoub",
        "ar": "ميهوب",
        "postCode": "26050"
      },
      {
        "fr": "Ouamri",
        "ar": "عوامري",
        "postCode": "26043"
      },
      {
        "fr": "Oued Harbil",
        "ar": "وادي حربيل",
        "postCode": "26029"
      },
      {
        "fr": "Ouled Bouachra",
        "ar": "أولاد بوعشرة",
        "postCode": "26027"
      },
      {
        "fr": "Ouled Brahim",
        "ar": "أولاد إبراهيم",
        "postCode": "26012"
      },
      {
        "fr": "Ouled Deide",
        "ar": "أولاد دايد",
        "postCode": "26006"
      },
      {
        "fr": "Ouled Hellal",
        "ar": "أولاد هلال",
        "postCode": "26022"
      },
      {
        "fr": "Ouled Maaref",
        "ar": "أولاد معرف",
        "postCode": "26003"
      },
      {
        "fr": "Oum El Djalil",
        "ar": "أم الجليل",
        "postCode": "26042"
      },
      {
        "fr": "Ouzera",
        "ar": "وزرة",
        "postCode": "26002"
      },
      {
        "fr": "Rebaia",
        "ar": "الربعية",
        "postCode": "26020"
      },
      {
        "fr": "Sedraia",
        "ar": "سدراية",
        "postCode": "26061"
      },
      {
        "fr": "Seghouane",
        "ar": "سغوان",
        "postCode": "26048"
      },
      {
        "fr": "Si Mahdjoub",
        "ar": "سى المحجوب",
        "postCode": "26044"
      },
      {
        "fr": "Sidi Damed",
        "ar": "سيدي دامد",
        "postCode": "26031"
      },
      {
        "fr": "Sidi Errabia",
        "ar": "سيدي الربيع",
        "postCode": "26055"
      },
      {
        "fr": "Sidi Naamane",
        "ar": "سيدي نعمان",
        "postCode": "26026"
      },
      {
        "fr": "Sidi Zahar",
        "ar": "سيدي زهار",
        "postCode": "26028"
      },
      {
        "fr": "Sidi Ziane",
        "ar": "سيدي زيان",
        "postCode": "26014"
      },
      {
        "fr": "Souagui",
        "ar": "السواڨي",
        "postCode": "26033"
      },
      {
        "fr": "Tablat",
        "ar": "تابلاط",
        "postCode": "26052"
      },
      {
        "fr": "Tafraout",
        "ar": "تافراوت",
        "postCode": "26023"
      },
      {
        "fr": "Tamesguida",
        "ar": "تمزڨيدة",
        "postCode": "26015"
      },
      {
        "fr": "Tizi Mahdi",
        "ar": "تيزي المهدي",
        "postCode": "26013"
      },
      {
        "fr": "Tlatet Eddouair",
        "ar": "ثلاثة الدوائر",
        "postCode": "26045"
      },
      {
        "fr": "Zoubiria",
        "ar": "الزبيرية",
        "postCode": "26034"
      }
    ]
  },
  {
    "code": "27",
    "name_fr": "Mostaganem",
    "name_ar": "مستغانم",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Abdelmalek Ramdane",
        "ar": "عبد المالك رمضان",
        "postCode": "27013"
      },
      {
        "fr": "Achaacha",
        "ar": "عشعاشة",
        "postCode": "27017"
      },
      {
        "fr": "Ain Boudinar",
        "ar": "عين بودينار",
        "postCode": "27028"
      },
      {
        "fr": "Ain Nouissy",
        "ar": "عين نويسي",
        "postCode": "27005"
      },
      {
        "fr": "Ain Sidi Cherif",
        "ar": "عين سيدي شريف",
        "postCode": "27021"
      },
      {
        "fr": "Ain Tadles",
        "ar": "عين تادلس",
        "postCode": "27007"
      },
      {
        "fr": "Bouguirat",
        "ar": "بوقيراط",
        "postCode": "27019"
      },
      {
        "fr": "El Hassiane",
        "ar": "الحسيان",
        "postCode": "27032"
      },
      {
        "fr": "Fornaka",
        "ar": "فرناكة",
        "postCode": "27003"
      },
      {
        "fr": "Hadjadj",
        "ar": "حجاج",
        "postCode": "27014"
      },
      {
        "fr": "Hassi Maameche",
        "ar": "حاسي مماش",
        "postCode": "27006"
      },
      {
        "fr": "Khadra",
        "ar": "خضراء",
        "postCode": "27018"
      },
      {
        "fr": "Kheiredine",
        "ar": "خير الدين",
        "postCode": "27011"
      },
      {
        "fr": "Mansourah",
        "ar": "منصورة",
        "postCode": "27023"
      },
      {
        "fr": "Mesra",
        "ar": "ماسرة",
        "postCode": "27022"
      },
      {
        "fr": "Mezghrane",
        "ar": "مزغران",
        "postCode": "27027"
      },
      {
        "fr": "Mostaganem",
        "ar": "مستغانم",
        "postCode": "27001"
      },
      {
        "fr": "Nekmaria",
        "ar": "نقمارية",
        "postCode": "27015"
      },
      {
        "fr": "Oued El Kheir",
        "ar": "واد الخير",
        "postCode": "27009"
      },
      {
        "fr": "Ouled Boughalem",
        "ar": "أوالد بوغالم",
        "postCode": "27025"
      },
      {
        "fr": "Ouled Maallah",
        "ar": "أولاد مع اللّه",
        "postCode": "27026"
      },
      {
        "fr": "Safsaf",
        "ar": "صفصاف",
        "postCode": "27030"
      },
      {
        "fr": "Sayada",
        "ar": "صيادة",
        "postCode": "27002"
      },
      {
        "fr": "Sidi Ali",
        "ar": "سيدي علي",
        "postCode": "27012"
      },
      {
        "fr": "Sidi Bellater",
        "ar": "سيدي بلعاتر",
        "postCode": "27010"
      },
      {
        "fr": "Sidi Lakhdar",
        "ar": "سيدي لخضر",
        "postCode": "27016"
      },
      {
        "fr": "Sirat",
        "ar": "سيرات",
        "postCode": "27020"
      },
      {
        "fr": "Souaflia",
        "ar": "سوافلية",
        "postCode": "27024"
      },
      {
        "fr": "Sour",
        "ar": "صور",
        "postCode": "27008"
      },
      {
        "fr": "Stidia",
        "ar": "ستيدية",
        "postCode": "27004"
      },
      {
        "fr": "Tazgait",
        "ar": "تزقايت",
        "postCode": "27029"
      },
      {
        "fr": "Touahria",
        "ar": "طواھيرية",
        "postCode": "27031"
      }
    ]
  },
  {
    "code": "28",
    "name_fr": "M'Sila",
    "name_ar": "المسيلة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Fares",
        "ar": "عين فارس",
        "postCode": "28037"
      },
      {
        "fr": "Ain Khadra",
        "ar": "عين الخضراء",
        "postCode": "28013"
      },
      {
        "fr": "Beni Ilmane",
        "ar": "بنى يلمان",
        "postCode": "28045"
      },
      {
        "fr": "Benzouh",
        "ar": "بن الزوه",
        "postCode": "28035"
      },
      {
        "fr": "Berhoum",
        "ar": "برهوم",
        "postCode": "28012"
      },
      {
        "fr": "Bir Foda",
        "ar": "بير الفضة",
        "postCode": "28036"
      },
      {
        "fr": "Chellal",
        "ar": "شلال",
        "postCode": "28009"
      },
      {
        "fr": "El Hamel",
        "ar": "الهامل",
        "postCode": "28027"
      },
      {
        "fr": "El Houamed",
        "ar": "الحوامد",
        "postCode": "28026"
      },
      {
        "fr": "Khoubana",
        "ar": "خبانة",
        "postCode": "28007"
      },
      {
        "fr": "M'cif",
        "ar": "مسيف",
        "postCode": "28008"
      },
      {
        "fr": "Maadid",
        "ar": "المعاضيد",
        "postCode": "28002"
      },
      {
        "fr": "Medjedel",
        "ar": "مجدل",
        "postCode": "28042"
      },
      {
        "fr": "Msila",
        "ar": "المسيلة",
        "postCode": "28001"
      },
      {
        "fr": "Mtarfa",
        "ar": "مطارفة",
        "postCode": "28006"
      },
      {
        "fr": "Ouanougha",
        "ar": "ونوغة",
        "postCode": "28019"
      },
      {
        "fr": "Oued Chair",
        "ar": "محمد بوضياف",
        "postCode": "28034"
      },
      {
        "fr": "Ouled Addi Guebala",
        "ar": "اولاد عدي لقبالة",
        "postCode": "28014"
      },
      {
        "fr": "Ouled Atia",
        "ar": "منعة",
        "postCode": "28039"
      },
      {
        "fr": "Ouled Derradj",
        "ar": "أولاد دراج",
        "postCode": "28004"
      },
      {
        "fr": "Ouled Mansour",
        "ar": "أولاد منصور",
        "postCode": "28028"
      },
      {
        "fr": "Ouled Slimane",
        "ar": "أولاد سليمان",
        "postCode": "28025"
      },
      {
        "fr": "Oultene",
        "ar": "ولتام",
        "postCode": "28046"
      },
      {
        "fr": "Sidi Aissa",
        "ar": "سيدي عيسى",
        "postCode": "28016"
      },
      {
        "fr": "Sidi Hadjeres",
        "ar": "سيدي ھجرس",
        "postCode": "28018"
      },
      {
        "fr": "Sidi Mhamed",
        "ar": "سيدي محمد",
        "postCode": "28038"
      },
      {
        "fr": "Souamaa",
        "ar": "الصوامع",
        "postCode": "28040"
      },
      {
        "fr": "Tarmount",
        "ar": "تارمونت",
        "postCode": "28005"
      },
      {
        "fr": "Zarzour",
        "ar": "الزرزور",
        "postCode": "28033"
      }
    ]
  },
  {
    "code": "29",
    "name_fr": "Mascara",
    "name_ar": "معسكر",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain Fares",
        "ar": "عين فارس",
        "postCode": "29024"
      },
      {
        "fr": "Ain Fekan",
        "ar": "عين فكان",
        "postCode": "29018"
      },
      {
        "fr": "Ain Ferah",
        "ar": "عين فراح",
        "postCode": "29011"
      },
      {
        "fr": "Ain Frass",
        "ar": "عين فراس",
        "postCode": "29025"
      },
      {
        "fr": "Alaimia",
        "ar": "العلايمية",
        "postCode": "29028"
      },
      {
        "fr": "Aouf",
        "ar": "عوف",
        "postCode": "29023"
      },
      {
        "fr": "Benian",
        "ar": "بنيان",
        "postCode": "29019"
      },
      {
        "fr": "Bou Hanifia",
        "ar": "بوحنيفية",
        "postCode": "29002"
      },
      {
        "fr": "Bou Henni",
        "ar": "بوهني",
        "postCode": "29037"
      },
      {
        "fr": "Chorfa",
        "ar": "الشرفة",
        "postCode": "29043"
      },
      {
        "fr": "El Bordj",
        "ar": "البرج",
        "postCode": "29017"
      },
      {
        "fr": "El Gaada",
        "ar": "القعدة",
        "postCode": "29029"
      },
      {
        "fr": "El Ghomri",
        "ar": "الغمري",
        "postCode": "29034"
      },
      {
        "fr": "El Hachem",
        "ar": "الهاشم",
        "postCode": "29007"
      },
      {
        "fr": "El Keurt",
        "ar": "الكرط",
        "postCode": "29040"
      },
      {
        "fr": "El Mamounia",
        "ar": "المامونية",
        "postCode": "29039"
      },
      {
        "fr": "El Menaouer",
        "ar": "المناور",
        "postCode": "29021"
      },
      {
        "fr": "Ferraguig",
        "ar": "فرقيق",
        "postCode": "29033"
      },
      {
        "fr": "Froha",
        "ar": "فروحة",
        "postCode": "29013"
      },
      {
        "fr": "Gharrous",
        "ar": "غروس",
        "postCode": "29041"
      },
      {
        "fr": "Gherdjoum",
        "ar": "ڤرجوم",
        "postCode": "29042"
      },
      {
        "fr": "Ghriss",
        "ar": "غريس",
        "postCode": "29012"
      },
      {
        "fr": "Guettena",
        "ar": "القيطنة",
        "postCode": "29038"
      },
      {
        "fr": "Hacine",
        "ar": "حسين",
        "postCode": "29004"
      },
      {
        "fr": "Khalouia",
        "ar": "خلوية",
        "postCode": "29020"
      },
      {
        "fr": "Makdha",
        "ar": "ماقضة",
        "postCode": "29015"
      },
      {
        "fr": "Maoussa",
        "ar": "ماوسة",
        "postCode": "29005"
      },
      {
        "fr": "Mascara",
        "ar": "مـعـسـكـر",
        "postCode": "29001"
      },
      {
        "fr": "Matemore",
        "ar": "مطمور",
        "postCode": "29014"
      },
      {
        "fr": "Moctadouz",
        "ar": "مقطع الدوز",
        "postCode": "29036"
      },
      {
        "fr": "Mohammadia",
        "ar": "المحمدية",
        "postCode": "29031"
      },
      {
        "fr": "Nesmot",
        "ar": "نسموط",
        "postCode": "29045"
      },
      {
        "fr": "Oggaz",
        "ar": "عقاز",
        "postCode": "29027"
      },
      {
        "fr": "Oued El Abtal",
        "ar": "واد الأبطال",
        "postCode": "29010"
      },
      {
        "fr": "Oued Taria",
        "ar": "واد التاغية",
        "postCode": "29022"
      },
      {
        "fr": "Ras Ain Amirouche",
        "ar": "رأس العين عميروش",
        "postCode": "29044"
      },
      {
        "fr": "Sedjerara",
        "ar": "سجرارة",
        "postCode": "29035"
      },
      {
        "fr": "Sehailia",
        "ar": "سحايلية",
        "postCode": "29047"
      },
      {
        "fr": "Sidi Abdeldjebar",
        "ar": "سيدي عبد الجبار",
        "postCode": "29046"
      },
      {
        "fr": "Sidi Abdelmoumene",
        "ar": "سيدي عبد المومن",
        "postCode": "29032"
      },
      {
        "fr": "Sidi Boussaid",
        "ar": "سيدي بوسعيد",
        "postCode": "29016"
      },
      {
        "fr": "Sidi Kada",
        "ar": "سيدي قادة",
        "postCode": "29008"
      },
      {
        "fr": "Sig",
        "ar": "سيڨ",
        "postCode": "29026"
      },
      {
        "fr": "Teghennif",
        "ar": "تيغنيف",
        "postCode": "29006"
      },
      {
        "fr": "Tizi",
        "ar": "تيزي",
        "postCode": "29003"
      },
      {
        "fr": "Zahana",
        "ar": "زھانة",
        "postCode": "29030"
      },
      {
        "fr": "Zelmata",
        "ar": "زلماطة",
        "postCode": "29009"
      }
    ]
  },
  {
    "code": "30",
    "name_fr": "Ouargla",
    "name_ar": "ورقلة",
    "deliveryFeeDZD": 850,
    "communes": [
      {
        "fr": "Ain Beida",
        "ar": "عين البيضاء",
        "postCode": "30002"
      },
      {
        "fr": "Balidat Ameur",
        "ar": "بليدة عامر",
        "postCode": "30006"
      },
      {
        "fr": "El Borma",
        "ar": "البرمة",
        "postCode": "30021"
      },
      {
        "fr": "Hassi Ben Abdellah",
        "ar": "حاسي بن عبد ﷲ",
        "postCode": "30012"
      },
      {
        "fr": "Hassi Messaoud",
        "ar": "حاسي مسعود",
        "postCode": "30004"
      },
      {
        "fr": "Ngoussa",
        "ar": "نقوسة",
        "postCode": "30003"
      },
      {
        "fr": "Ouargla",
        "ar": "ورڨلة",
        "postCode": "30001"
      },
      {
        "fr": "Rouissat",
        "ar": "الرويسات",
        "postCode": "30005"
      },
      {
        "fr": "Sidi Khouiled",
        "ar": "سيدي خويلد",
        "postCode": "30011"
      }
    ]
  },
  {
    "code": "31",
    "name_fr": "Oran",
    "name_ar": "وهران",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain Biya",
        "ar": "عين البية",
        "postCode": "31026"
      },
      {
        "fr": "Ain Kerma",
        "ar": "عين الكرمة",
        "postCode": "31025"
      },
      {
        "fr": "Ain Turk",
        "ar": "عيْن التُرْكْ",
        "postCode": "31009"
      },
      {
        "fr": "Arzew",
        "ar": "أرزيو",
        "postCode": "31006"
      },
      {
        "fr": "Ben Freha",
        "ar": "بن فريحة",
        "postCode": "31020"
      },
      {
        "fr": "Bethioua",
        "ar": "ﺑﻃﻴﻭة",
        "postCode": "31007"
      },
      {
        "fr": "Bir El Djir",
        "ar": "بئر الجير",
        "postCode": "31003"
      },
      {
        "fr": "Boufatis",
        "ar": "بوفاطيس",
        "postCode": "31014"
      },
      {
        "fr": "Bousfer",
        "ar": "بوسفر",
        "postCode": "31016"
      },
      {
        "fr": "Boutlelis",
        "ar": "بوتليليس",
        "postCode": "31024"
      },
      {
        "fr": "El Ancar",
        "ar": "العنصر",
        "postCode": "31010"
      },
      {
        "fr": "El Braya",
        "ar": "ألبْرَيَ",
        "postCode": "31018"
      },
      {
        "fr": "El Karma",
        "ar": "الكرمة",
        "postCode": "31017"
      },
      {
        "fr": "Es Senia",
        "ar": "السانية",
        "postCode": "31005"
      },
      {
        "fr": "Gdyel",
        "ar": "ڨديل",
        "postCode": "31002"
      },
      {
        "fr": "Hassi Ben Okba",
        "ar": "حاسي بن عقبة",
        "postCode": "31019"
      },
      {
        "fr": "Hassi Bounif",
        "ar": "حاسيْ بُونِيف",
        "postCode": "31004"
      },
      {
        "fr": "Hassi Mefsoukh",
        "ar": "حاسي مفسوخ",
        "postCode": "31021"
      },
      {
        "fr": "Marsat El Hadjadj",
        "ar": "مَرس ألحَجَاج",
        "postCode": "31008"
      },
      {
        "fr": "Mers El Kebir",
        "ar": "المرسى الكبير",
        "postCode": "31015"
      },
      {
        "fr": "Messerghin",
        "ar": "مسرغين",
        "postCode": "31023"
      },
      {
        "fr": "Oran",
        "ar": "وهران",
        "postCode": "31001"
      },
      {
        "fr": "Oued Tlelat",
        "ar": "وادى تليلات",
        "postCode": "31011"
      },
      {
        "fr": "Sidi Ben Yabka",
        "ar": "سيدي بن يبقى",
        "postCode": "31022"
      },
      {
        "fr": "Sidi Chami",
        "ar": "سيدي الشحمي",
        "postCode": "31013"
      },
      {
        "fr": "Tafraoui",
        "ar": "طفراوي",
        "postCode": "31012"
      }
    ]
  },
  {
    "code": "32",
    "name_fr": "El Bayadh",
    "name_ar": "البيض",
    "deliveryFeeDZD": 850,
    "communes": [
      {
        "fr": "Boualem",
        "ar": "بوعلام",
        "postCode": "32006"
      },
      {
        "fr": "Bougtoub",
        "ar": "بوقطب",
        "postCode": "32010"
      },
      {
        "fr": "Brezina",
        "ar": "بريزينة",
        "postCode": "32004"
      },
      {
        "fr": "Cheguig",
        "ar": "الشقيق",
        "postCode": "32017"
      },
      {
        "fr": "El Bayadh",
        "ar": "الـبـيـض",
        "postCode": "32001"
      },
      {
        "fr": "El Bnoud",
        "ar": "البنود",
        "postCode": "32016"
      },
      {
        "fr": "El Kheither",
        "ar": "الخيثر",
        "postCode": "32011"
      },
      {
        "fr": "Ghassoul",
        "ar": "غسول",
        "postCode": "32005"
      },
      {
        "fr": "Kef El Ahmar",
        "ar": "الكاف الاحمر",
        "postCode": "32012"
      },
      {
        "fr": "Krakda",
        "ar": "كراكدة",
        "postCode": "32015"
      },
      {
        "fr": "Rogassa",
        "ar": "روقاصة",
        "postCode": "32002"
      },
      {
        "fr": "Sidi Ameur",
        "ar": "سيدي عامر",
        "postCode": "32018"
      },
      {
        "fr": "Sidi Slimane",
        "ar": "سيدي سليمان",
        "postCode": "32021"
      },
      {
        "fr": "Sidi Tifour",
        "ar": "سيدي طيفور",
        "postCode": "32022"
      },
      {
        "fr": "Stitten",
        "ar": "ستيتين",
        "postCode": "32003"
      },
      {
        "fr": "Tousmouline",
        "ar": "توسمولين",
        "postCode": "32020"
      }
    ]
  },
  {
    "code": "33",
    "name_fr": "Illizi",
    "name_ar": "إليزي",
    "deliveryFeeDZD": 1050,
    "communes": [
      {
        "fr": "Bordj Omar Driss",
        "ar": "برج عمر ادريس",
        "postCode": "33004"
      },
      {
        "fr": "Debdeb",
        "ar": "دبداب",
        "postCode": "33003"
      },
      {
        "fr": "Illizi",
        "ar": "إلـيـزي",
        "postCode": "33001"
      },
      {
        "fr": "In Amenas",
        "ar": "إن أميناس",
        "postCode": "33006"
      }
    ]
  },
  {
    "code": "34",
    "name_fr": "Bordj Bou Arreridj",
    "name_ar": "برج بوعريريج",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain Taghrout",
        "ar": "عين تاغروت",
        "postCode": "34008"
      },
      {
        "fr": "Ain Tesra",
        "ar": "عين تسرة",
        "postCode": "34030"
      },
      {
        "fr": "Belimour",
        "ar": "بليمور",
        "postCode": "34012"
      },
      {
        "fr": "Ben Daoud",
        "ar": "بن داود",
        "postCode": "34006"
      },
      {
        "fr": "Bir Kasdali",
        "ar": "بئر قصد علي",
        "postCode": "34031"
      },
      {
        "fr": "Bordj Bou Arreridj",
        "ar": "برج بوعريريج",
        "postCode": "34001"
      },
      {
        "fr": "Bordj Ghdir",
        "ar": "برج غدير",
        "postCode": "34009"
      },
      {
        "fr": "Bordj Zemoura",
        "ar": "برج زمورة",
        "postCode": "34003"
      },
      {
        "fr": "Colla",
        "ar": "القلة",
        "postCode": "34025"
      },
      {
        "fr": "Djaafra",
        "ar": "جعافرة",
        "postCode": "34015"
      },
      {
        "fr": "El Ach",
        "ar": "العش",
        "postCode": "34027"
      },
      {
        "fr": "El Achir",
        "ar": "العشير",
        "postCode": "34007"
      },
      {
        "fr": "El Anseur",
        "ar": "العناصر",
        "postCode": "34028"
      },
      {
        "fr": "El Hamadia",
        "ar": "الحمادية",
        "postCode": "34011"
      },
      {
        "fr": "El Main",
        "ar": "إلماين",
        "postCode": "34016"
      },
      {
        "fr": "El Mhir",
        "ar": "المھير",
        "postCode": "34005"
      },
      {
        "fr": "Ghilassa",
        "ar": "غيلاسة",
        "postCode": "34032"
      },
      {
        "fr": "Haraza",
        "ar": "الحرازة",
        "postCode": "34034"
      },
      {
        "fr": "Hasnaoua",
        "ar": "حسناوة",
        "postCode": "34019"
      },
      {
        "fr": "Khelil",
        "ar": "خليل",
        "postCode": "34020"
      },
      {
        "fr": "Ksour",
        "ar": "القصور",
        "postCode": "34022"
      },
      {
        "fr": "Mansoura",
        "ar": "منصورة",
        "postCode": "34004"
      },
      {
        "fr": "Medjana",
        "ar": "مجانة",
        "postCode": "34013"
      },
      {
        "fr": "Ouled Brahem",
        "ar": "أولاد ابراھم",
        "postCode": "34017"
      },
      {
        "fr": "Ouled Dahmane",
        "ar": "أولاد دحمان",
        "postCode": "34018"
      },
      {
        "fr": "Ouled Sidi Brahim",
        "ar": "آث سيذى پراهم.",
        "postCode": "34023"
      },
      {
        "fr": "Rabta",
        "ar": "الرابطة",
        "postCode": "34033"
      },
      {
        "fr": "Ras El Oued",
        "ar": "رأس الوادي",
        "postCode": "34002"
      },
      {
        "fr": "Sidi Embarek",
        "ar": "سيدي مبارك",
        "postCode": "34010"
      },
      {
        "fr": "Tafreg",
        "ar": "تفرڨ",
        "postCode": "34024"
      },
      {
        "fr": "Taglait",
        "ar": "تاقلعيت",
        "postCode": "34021"
      },
      {
        "fr": "Teniet En Nasr",
        "ar": "ثنية النصر",
        "postCode": "34014"
      },
      {
        "fr": "Tesmart",
        "ar": "تسمارت",
        "postCode": "34029"
      },
      {
        "fr": "Tixter",
        "ar": "تقصطر",
        "postCode": "34026"
      }
    ]
  },
  {
    "code": "35",
    "name_fr": "Boumerdes",
    "name_ar": "بومرداس",
    "deliveryFeeDZD": 500,
    "communes": [
      {
        "fr": "Afir",
        "ar": "أفير",
        "postCode": "35004"
      },
      {
        "fr": "Ammal",
        "ar": "عمال",
        "postCode": "35029"
      },
      {
        "fr": "Baghlia",
        "ar": "بغلية",
        "postCode": "35006"
      },
      {
        "fr": "Ben Choud",
        "ar": "بن شود",
        "postCode": "35027"
      },
      {
        "fr": "Beni Amrane",
        "ar": "بنى عمران",
        "postCode": "35030"
      },
      {
        "fr": "Bordj Menaiel",
        "ar": "برج منايل",
        "postCode": "35005"
      },
      {
        "fr": "Boudouaou",
        "ar": "بودواو",
        "postCode": "35002"
      },
      {
        "fr": "Boudouaou El Bahri",
        "ar": "بودواو البحرى",
        "postCode": "35032"
      },
      {
        "fr": "Boumerdes",
        "ar": "بومرداس",
        "postCode": "35001"
      },
      {
        "fr": "Bouzegza Keddara",
        "ar": "بوزقزة قدارة",
        "postCode": "35022"
      },
      {
        "fr": "Chabet El Ameur",
        "ar": "شعبة العامر",
        "postCode": "35014"
      },
      {
        "fr": "Corso",
        "ar": "قورصو",
        "postCode": "35019"
      },
      {
        "fr": "Dellys",
        "ar": "دلس",
        "postCode": "35028"
      },
      {
        "fr": "Djinet",
        "ar": "جنات",
        "postCode": "35009"
      },
      {
        "fr": "El Kharrouba",
        "ar": "الخروبة",
        "postCode": "35038"
      },
      {
        "fr": "Hammedi",
        "ar": "حمادى",
        "postCode": "35036"
      },
      {
        "fr": "Isser",
        "ar": "يسر",
        "postCode": "35010"
      },
      {
        "fr": "Khemis El Khechna",
        "ar": "خميس الخشنة",
        "postCode": "35037"
      },
      {
        "fr": "Laghata",
        "ar": "لقاطة",
        "postCode": "35035"
      },
      {
        "fr": "Larbatache",
        "ar": "الأربعطاش",
        "postCode": "35021"
      },
      {
        "fr": "Naciria",
        "ar": "الناصرية",
        "postCode": "35008"
      },
      {
        "fr": "Ouled Aissa",
        "ar": "أولاد عيسى",
        "postCode": "35026"
      },
      {
        "fr": "Ouled Hedadj",
        "ar": "أولاد ھداج",
        "postCode": "35033"
      },
      {
        "fr": "Ouled Moussa",
        "ar": "أولاد موسى",
        "postCode": "35020"
      },
      {
        "fr": "Si Mustapha",
        "ar": "سي مصطفى",
        "postCode": "35012"
      },
      {
        "fr": "Sidi Daoud",
        "ar": "سيدي داود",
        "postCode": "35007"
      },
      {
        "fr": "Souk El Had",
        "ar": "سوق الحد",
        "postCode": "35031"
      },
      {
        "fr": "Taourga",
        "ar": "تورقة",
        "postCode": "35025"
      },
      {
        "fr": "Thenia",
        "ar": "الثنية",
        "postCode": "35015"
      },
      {
        "fr": "Tidjelabine",
        "ar": "تيجلابين",
        "postCode": "35013"
      },
      {
        "fr": "Timezrit",
        "ar": "تمزريت",
        "postCode": "35018"
      },
      {
        "fr": "Zemmouri",
        "ar": "زموري",
        "postCode": "35011"
      }
    ]
  },
  {
    "code": "36",
    "name_fr": "El Tarf",
    "name_ar": "الطارف",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain El Assel",
        "ar": "عين العسل",
        "postCode": "36006"
      },
      {
        "fr": "Ain Kerma",
        "ar": "عين الكرمة",
        "postCode": "36021"
      },
      {
        "fr": "Asfour",
        "ar": "عصفور",
        "postCode": "36017"
      },
      {
        "fr": "Ben Mhidi",
        "ar": "بن مهيدى",
        "postCode": "36003"
      },
      {
        "fr": "Berrihane",
        "ar": "برحان",
        "postCode": "36010"
      },
      {
        "fr": "Besbes",
        "ar": "البسباس",
        "postCode": "36016"
      },
      {
        "fr": "Bougous",
        "ar": "بوقوس",
        "postCode": "36004"
      },
      {
        "fr": "Bouhadjar",
        "ar": "بوحجار",
        "postCode": "36002"
      },
      {
        "fr": "Bouteldja",
        "ar": "بوثلجة",
        "postCode": "36008"
      },
      {
        "fr": "Chebaita Mokhtar",
        "ar": "شبيطة مختار",
        "postCode": "36015"
      },
      {
        "fr": "Chefia",
        "ar": "الشافية",
        "postCode": "36012"
      },
      {
        "fr": "Chihani",
        "ar": "شهانى",
        "postCode": "36014"
      },
      {
        "fr": "Drean",
        "ar": "الذرعان",
        "postCode": "36013"
      },
      {
        "fr": "Echatt",
        "ar": "الشط",
        "postCode": "36018"
      },
      {
        "fr": "El Aioun",
        "ar": "العيون",
        "postCode": "36007"
      },
      {
        "fr": "El Kala",
        "ar": "القالة",
        "postCode": "36005"
      },
      {
        "fr": "El Tarf",
        "ar": "الطارف",
        "postCode": "36001"
      },
      {
        "fr": "Hammam Beni Salah",
        "ar": "حمام بنى صالح",
        "postCode": "36023"
      },
      {
        "fr": "Lac Des Oiseaux",
        "ar": "بحيرة الطيور",
        "postCode": "36011"
      },
      {
        "fr": "Oued Zitoun",
        "ar": "وادى الزيتون",
        "postCode": "36022"
      },
      {
        "fr": "Raml Souk",
        "ar": "رمل سوق",
        "postCode": "36024"
      },
      {
        "fr": "Souarekh",
        "ar": "السوارخ",
        "postCode": "36009"
      },
      {
        "fr": "Zerizer",
        "ar": "زريزر",
        "postCode": "36019"
      },
      {
        "fr": "Zitouna",
        "ar": "الزيتونة",
        "postCode": "36020"
      }
    ]
  },
  {
    "code": "37",
    "name_fr": "Tindouf",
    "name_ar": "تندوف",
    "deliveryFeeDZD": 1050,
    "communes": [
      {
        "fr": "Oum El Assel",
        "ar": "أم العسل",
        "postCode": "37002"
      },
      {
        "fr": "Tindouf",
        "ar": "تندوف",
        "postCode": "37001"
      }
    ]
  },
  {
    "code": "38",
    "name_fr": "Tissemsilt",
    "name_ar": "تيسمسيلت",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ammari",
        "ar": "عمارى",
        "postCode": "38013"
      },
      {
        "fr": "Beni Chaib",
        "ar": "بنى شعيب",
        "postCode": "38005"
      },
      {
        "fr": "Beni Lahcene",
        "ar": "بنى لحسن",
        "postCode": "38022"
      },
      {
        "fr": "Bordj Bou Naama",
        "ar": "برج بونعامة",
        "postCode": "38002"
      },
      {
        "fr": "Bordj El Emir Abdelkader",
        "ar": "برج الامير عبد القادر",
        "postCode": "38009"
      },
      {
        "fr": "Boucaid",
        "ar": "بوقايد",
        "postCode": "38021"
      },
      {
        "fr": "Khemisti",
        "ar": "خميستى",
        "postCode": "38011"
      },
      {
        "fr": "Larbaa",
        "ar": "الاربعاء",
        "postCode": "38016"
      },
      {
        "fr": "Lardjem",
        "ar": "لارجم",
        "postCode": "38006"
      },
      {
        "fr": "Layoune",
        "ar": "العيون",
        "postCode": "38010"
      },
      {
        "fr": "Lazharia",
        "ar": "الازھرية",
        "postCode": "38004"
      },
      {
        "fr": "Maasem",
        "ar": "المعاصم",
        "postCode": "38017"
      },
      {
        "fr": "Melaab",
        "ar": "ملعب",
        "postCode": "38007"
      },
      {
        "fr": "Ouled Bessem",
        "ar": "أولاد بسام",
        "postCode": "38012"
      },
      {
        "fr": "Sidi Abed",
        "ar": "سيدي عابد",
        "postCode": "38018"
      },
      {
        "fr": "Sidi Boutouchent",
        "ar": "سيدي بوتوشنت",
        "postCode": "38015"
      },
      {
        "fr": "Sidi Lantri",
        "ar": "سيدي العنترى",
        "postCode": "38008"
      },
      {
        "fr": "Sidi Slimane",
        "ar": "سيدي سليمان",
        "postCode": "38020"
      },
      {
        "fr": "Tamalaht",
        "ar": "تاملاحت",
        "postCode": "38019"
      },
      {
        "fr": "Theniet El Had",
        "ar": "ثنية الاحد",
        "postCode": "38003"
      },
      {
        "fr": "Tissemsilt",
        "ar": "تـيـسـمـسـيـلـت",
        "postCode": "38001"
      },
      {
        "fr": "Youssoufia",
        "ar": "اليوسفية",
        "postCode": "38014"
      }
    ]
  },
  {
    "code": "39",
    "name_fr": "El Oued",
    "name_ar": "الوادي",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Bayadha",
        "ar": "البياضة",
        "postCode": "39004"
      },
      {
        "fr": "Beni Guecha",
        "ar": "بن ڨشة",
        "postCode": "39019"
      },
      {
        "fr": "Debila",
        "ar": "الدبيلة",
        "postCode": "39011"
      },
      {
        "fr": "Douar El Ma",
        "ar": "دوار الماء",
        "postCode": "39015"
      },
      {
        "fr": "El Mghair",
        "ar": "المغير",
        "postCode": "39027"
      },
      {
        "fr": "El Ogla",
        "ar": "العقلة",
        "postCode": "39025"
      },
      {
        "fr": "El Oued",
        "ar": "الوادي",
        "postCode": "39001"
      },
      {
        "fr": "Guemar",
        "ar": "ڨمار",
        "postCode": "39006"
      },
      {
        "fr": "Hamraia",
        "ar": "الحمراية",
        "postCode": "39009"
      },
      {
        "fr": "Hassani Abdelkrim",
        "ar": "بلدية حساني عبد الكريم",
        "postCode": "39012"
      },
      {
        "fr": "Hassi Khelifa",
        "ar": "حاسى خليفة",
        "postCode": "39013"
      },
      {
        "fr": "Kouinine",
        "ar": "كوينين",
        "postCode": "39007"
      },
      {
        "fr": "Magrane",
        "ar": "المڨرن",
        "postCode": "39018"
      },
      {
        "fr": "Mih Ouansa",
        "ar": "مية ونسة",
        "postCode": "39026"
      },
      {
        "fr": "Mrara",
        "ar": "مرارة",
        "postCode": "39022"
      },
      {
        "fr": "Nakhla",
        "ar": "النخلة",
        "postCode": "39005"
      },
      {
        "fr": "Oued El Alenda",
        "ar": "وادى العلندة",
        "postCode": "39003"
      },
      {
        "fr": "Ourmas",
        "ar": "أورماس",
        "postCode": "39020"
      },
      {
        "fr": "Reguiba",
        "ar": "الرڨيبة",
        "postCode": "39008"
      },
      {
        "fr": "Robbah",
        "ar": "رباح",
        "postCode": "39002"
      },
      {
        "fr": "Sidi Aoun",
        "ar": "سيدي عون",
        "postCode": "39016"
      },
      {
        "fr": "Sidi Khellil",
        "ar": "سيدي خليل",
        "postCode": "39023"
      },
      {
        "fr": "Taghzout",
        "ar": "تغزوت",
        "postCode": "39010"
      },
      {
        "fr": "Taleb Larbi",
        "ar": "طالب العربي",
        "postCode": "39014"
      },
      {
        "fr": "Trifaoui",
        "ar": "تريفاوى",
        "postCode": "39017"
      }
    ]
  },
  {
    "code": "40",
    "name_fr": "Khenchela",
    "name_ar": "خنشلة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Touila",
        "ar": "عين الطويلة",
        "postCode": "40006"
      },
      {
        "fr": "Babar",
        "ar": "بابار",
        "postCode": "40013"
      },
      {
        "fr": "Baghai",
        "ar": "بغاي",
        "postCode": "40004"
      },
      {
        "fr": "Bouhmama",
        "ar": "بوحمامة",
        "postCode": "40008"
      },
      {
        "fr": "Chelia",
        "ar": "شلية",
        "postCode": "40021"
      },
      {
        "fr": "Cherchar",
        "ar": "ششار",
        "postCode": "40011"
      },
      {
        "fr": "Djellal",
        "ar": "جلال",
        "postCode": "40012"
      },
      {
        "fr": "El Hamma",
        "ar": "الحامة",
        "postCode": "40005"
      },
      {
        "fr": "El Mahmal",
        "ar": "المحمل",
        "postCode": "40017"
      },
      {
        "fr": "El Oueldja",
        "ar": "الولجة",
        "postCode": "40009"
      },
      {
        "fr": "Ensigha",
        "ar": "انسيغة",
        "postCode": "40015"
      },
      {
        "fr": "Kais",
        "ar": "قايس",
        "postCode": "40003"
      },
      {
        "fr": "Khenchela",
        "ar": "خنشلة",
        "postCode": "40001"
      },
      {
        "fr": "Khirane",
        "ar": "خيران",
        "postCode": "40020"
      },
      {
        "fr": "Msara",
        "ar": "أمصارة",
        "postCode": "40018"
      },
      {
        "fr": "Mtoussa",
        "ar": "متوسة",
        "postCode": "40002"
      },
      {
        "fr": "Ouled Rechache",
        "ar": "أولاد رشاش",
        "postCode": "40016"
      },
      {
        "fr": "Remila",
        "ar": "الرميلة",
        "postCode": "40010"
      },
      {
        "fr": "Tamza",
        "ar": "تامزة",
        "postCode": "40014"
      },
      {
        "fr": "Taouzianat",
        "ar": "تاوزيانت",
        "postCode": "40007"
      },
      {
        "fr": "Yabous",
        "ar": "يابوس",
        "postCode": "40019"
      }
    ]
  },
  {
    "code": "41",
    "name_fr": "Souk Ahras",
    "name_ar": "سوق أهراس",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Soltane",
        "ar": "عين السلطان",
        "postCode": "41018"
      },
      {
        "fr": "Ain Zana",
        "ar": "عين الزانة",
        "postCode": "41017"
      },
      {
        "fr": "Bir Bouhouche",
        "ar": "بئر بوحوش",
        "postCode": "41014"
      },
      {
        "fr": "Drea",
        "ar": "الدريعة",
        "postCode": "41009"
      },
      {
        "fr": "Haddada",
        "ar": "الحدادة",
        "postCode": "41010"
      },
      {
        "fr": "Hanancha",
        "ar": "الحنانشة",
        "postCode": "41003"
      },
      {
        "fr": "Khedara",
        "ar": "لخضارة",
        "postCode": "41011"
      },
      {
        "fr": "Khemissa",
        "ar": "خميسة",
        "postCode": "41023"
      },
      {
        "fr": "Mdaourouche",
        "ar": "مداوروش",
        "postCode": "41015"
      },
      {
        "fr": "Mechroha",
        "ar": "المشروحة",
        "postCode": "41004"
      },
      {
        "fr": "Merahna",
        "ar": "المراهنة",
        "postCode": "41012"
      },
      {
        "fr": "Oued Keberit",
        "ar": "وادى الكبريت",
        "postCode": "41024"
      },
      {
        "fr": "Ouled Driss",
        "ar": "أولاد ادريس",
        "postCode": "41005"
      },
      {
        "fr": "Ouled Moumen",
        "ar": "أولاد مؤمن",
        "postCode": "41013"
      },
      {
        "fr": "Oum El Adhaim",
        "ar": "أم العظائم",
        "postCode": "41016"
      },
      {
        "fr": "Quillen",
        "ar": "ويلان",
        "postCode": "41019"
      },
      {
        "fr": "Ragouba",
        "ar": "الرقوبة",
        "postCode": "41022"
      },
      {
        "fr": "Safel El Ouiden",
        "ar": "سافل الويدان",
        "postCode": "41021"
      },
      {
        "fr": "Sedrata",
        "ar": "سدراتة",
        "postCode": "41002"
      },
      {
        "fr": "Sidi Fredj",
        "ar": "سيدي فرج",
        "postCode": "41020"
      },
      {
        "fr": "Souk Ahras",
        "ar": "سوق أهراس",
        "postCode": "41001"
      },
      {
        "fr": "Taoura",
        "ar": "تاورة",
        "postCode": "41008"
      },
      {
        "fr": "Terraguelt",
        "ar": "ترقالت",
        "postCode": "41025"
      },
      {
        "fr": "Tiffech",
        "ar": "تيفاش",
        "postCode": "41006"
      },
      {
        "fr": "Zaarouria",
        "ar": "الزعرورية",
        "postCode": "41007"
      },
      {
        "fr": "Zouabi",
        "ar": "الزوابى",
        "postCode": "41026"
      }
    ]
  },
  {
    "code": "42",
    "name_fr": "Tipaza",
    "name_ar": "تيبازة",
    "deliveryFeeDZD": 500,
    "communes": [
      {
        "fr": "Aghabal",
        "ar": "أغابال",
        "postCode": "42010"
      },
      {
        "fr": "Ahmer El Ain",
        "ar": "أحمر العين",
        "postCode": "42027"
      },
      {
        "fr": "Ain Tagourait",
        "ar": "عين تڨورايت",
        "postCode": "42017"
      },
      {
        "fr": "Attatba",
        "ar": "الحطاطبة",
        "postCode": "42036"
      },
      {
        "fr": "Beni Milleuk",
        "ar": "بني ميلك",
        "postCode": "42041"
      },
      {
        "fr": "Bou Haroun",
        "ar": "بوهارون",
        "postCode": "42030"
      },
      {
        "fr": "Bou Ismail",
        "ar": "بو اسماعيل",
        "postCode": "42026"
      },
      {
        "fr": "Bourkika",
        "ar": "بورقيقة",
        "postCode": "42005"
      },
      {
        "fr": "Chaiba",
        "ar": "الشعيبة",
        "postCode": "42016"
      },
      {
        "fr": "Cherchel",
        "ar": "شرشال",
        "postCode": "42022"
      },
      {
        "fr": "Damous",
        "ar": "الداموس",
        "postCode": "42023"
      },
      {
        "fr": "Douaouda",
        "ar": "دواودة",
        "postCode": "42004"
      },
      {
        "fr": "Fouka",
        "ar": "فوكة",
        "postCode": "42025"
      },
      {
        "fr": "Gouraya",
        "ar": "ڨورايا",
        "postCode": "42014"
      },
      {
        "fr": "Hadjerat Ennous",
        "ar": "حجرة النص",
        "postCode": "42042"
      },
      {
        "fr": "Hadjout",
        "ar": "حجوط",
        "postCode": "42012"
      },
      {
        "fr": "Khemisti",
        "ar": "خميستي",
        "postCode": "42006"
      },
      {
        "fr": "Kolea",
        "ar": "القليعة",
        "postCode": "42035"
      },
      {
        "fr": "Larhat",
        "ar": "الأرهاط",
        "postCode": "42003"
      },
      {
        "fr": "Menaceur",
        "ar": "مناصر",
        "postCode": "42002"
      },
      {
        "fr": "Messelmoun",
        "ar": "مسلمون",
        "postCode": "42033"
      },
      {
        "fr": "Meurad",
        "ar": "مراد",
        "postCode": "42024"
      },
      {
        "fr": "Nodor",
        "ar": "الناظور",
        "postCode": "42015"
      },
      {
        "fr": "Sidi Amar",
        "ar": "سيدي عمر",
        "postCode": "42013"
      },
      {
        "fr": "Sidi Ghiles",
        "ar": "سيدي غيلاس",
        "postCode": "42032"
      },
      {
        "fr": "Sidi Rached",
        "ar": "سيدي راشد",
        "postCode": "42034"
      },
      {
        "fr": "Sidi Semiane",
        "ar": "سيدي سميان",
        "postCode": "42040"
      },
      {
        "fr": "Tipaza",
        "ar": "تيبازة",
        "postCode": "42001"
      }
    ]
  },
  {
    "code": "43",
    "name_fr": "Mila",
    "name_ar": "ميلة",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ahmed Rachedi",
        "ar": "أحمد راشدي",
        "postCode": "43011"
      },
      {
        "fr": "Ain Beida Harriche",
        "ar": "عين البيضاء حريش",
        "postCode": "43030"
      },
      {
        "fr": "Ain Mellouk",
        "ar": "عين ملوك",
        "postCode": "43005"
      },
      {
        "fr": "Ain Tine",
        "ar": "عين التين",
        "postCode": "43025"
      },
      {
        "fr": "Amira Arras",
        "ar": "عميرة أراس",
        "postCode": "43022"
      },
      {
        "fr": "Benyahia Abderrahmane",
        "ar": "بن يحيى عبد الرحمان",
        "postCode": "43009"
      },
      {
        "fr": "Bouhatem",
        "ar": "بوحاتم",
        "postCode": "43014"
      },
      {
        "fr": "Chelghoum Laid",
        "ar": "شلغوم العيد",
        "postCode": "43003"
      },
      {
        "fr": "Chigara",
        "ar": "الشيقارة",
        "postCode": "43032"
      },
      {
        "fr": "Derradji Bousselah",
        "ar": "دراحي بوصلاح",
        "postCode": "43020"
      },
      {
        "fr": "El Mechira",
        "ar": "المشيرة",
        "postCode": "43026"
      },
      {
        "fr": "Elayadi Barbes",
        "ar": "العياضى برباس",
        "postCode": "43029"
      },
      {
        "fr": "Ferdjioua",
        "ar": "فرجيوة",
        "postCode": "43002"
      },
      {
        "fr": "Grarem Gouga",
        "ar": "القرارم قوقة",
        "postCode": "43017"
      },
      {
        "fr": "Hamala",
        "ar": "حمالة",
        "postCode": "43024"
      },
      {
        "fr": "Mila",
        "ar": "ميلة",
        "postCode": "43001"
      },
      {
        "fr": "Minar Zarza",
        "ar": "مينار زرزة",
        "postCode": "43021"
      },
      {
        "fr": "Oued Athmenia",
        "ar": "وادي العثمانية",
        "postCode": "43004"
      },
      {
        "fr": "Oued Endja",
        "ar": "وادى النجاء",
        "postCode": "43010"
      },
      {
        "fr": "Oued Seguen",
        "ar": "وادى سقان",
        "postCode": "43007"
      },
      {
        "fr": "Ouled Khalouf",
        "ar": "أولاد خلوف",
        "postCode": "43012"
      },
      {
        "fr": "Rouached",
        "ar": "رواشد",
        "postCode": "43015"
      },
      {
        "fr": "Sidi Khelifa",
        "ar": "سيدي خليفة",
        "postCode": "43027"
      },
      {
        "fr": "Sidi Merouane",
        "ar": "سيدي مروان",
        "postCode": "43018"
      },
      {
        "fr": "Tadjenanet",
        "ar": "تاجنانت",
        "postCode": "43008"
      },
      {
        "fr": "Tassadane Haddada",
        "ar": "تسدان حدادة",
        "postCode": "43019"
      },
      {
        "fr": "Telerghma",
        "ar": "تلاغمة",
        "postCode": "43006"
      },
      {
        "fr": "Terrai Bainen",
        "ar": "ترعى بينان",
        "postCode": "43023"
      },
      {
        "fr": "Tessala Lamatai",
        "ar": "تسالة لمطاي",
        "postCode": "43016"
      },
      {
        "fr": "Tiberguent",
        "ar": "تيبرقنت",
        "postCode": "43013"
      },
      {
        "fr": "Yahia Beniguecha",
        "ar": "يحيى بنى قشة",
        "postCode": "43031"
      },
      {
        "fr": "Zeghaia",
        "ar": "زغاية",
        "postCode": "43028"
      }
    ]
  },
  {
    "code": "44",
    "name_fr": "Ain Defla",
    "name_ar": "عين الدفلى",
    "deliveryFeeDZD": 550,
    "communes": [
      {
        "fr": "Ain Benian",
        "ar": "عين البنيان",
        "postCode": "44026"
      },
      {
        "fr": "Ain Bouyahia",
        "ar": "عين بويحى",
        "postCode": "44033"
      },
      {
        "fr": "Ain Defla",
        "ar": "عين دفلة - عين الدفلى",
        "postCode": "44001"
      },
      {
        "fr": "Ain Lechiakh",
        "ar": "عين االشياخ",
        "postCode": "44014"
      },
      {
        "fr": "Ain Soltane",
        "ar": "عين السلطان",
        "postCode": "44020"
      },
      {
        "fr": "Ain Torki",
        "ar": "عين التركى",
        "postCode": "44023"
      },
      {
        "fr": "Arib",
        "ar": "عريب",
        "postCode": "44006"
      },
      {
        "fr": "Barbouche",
        "ar": "بربوش",
        "postCode": "44028"
      },
      {
        "fr": "Bathia",
        "ar": "بطحية",
        "postCode": "44031"
      },
      {
        "fr": "Belaas",
        "ar": "بالعاص",
        "postCode": "44036"
      },
      {
        "fr": "Ben Allal",
        "ar": "بن علال",
        "postCode": "44025"
      },
      {
        "fr": "Bir Ouled Khelifa",
        "ar": "بئر ولد خليفة",
        "postCode": "44019"
      },
      {
        "fr": "Bordj Emir Khaled",
        "ar": "برج الأمير خالد",
        "postCode": "44022"
      },
      {
        "fr": "Boumedfaa",
        "ar": "بومدفع",
        "postCode": "44003"
      },
      {
        "fr": "Bourached",
        "ar": "بوراشد",
        "postCode": "44009"
      },
      {
        "fr": "Djelida",
        "ar": "جليدة",
        "postCode": "44007"
      },
      {
        "fr": "Djemaa Ouled Chikh",
        "ar": "جمعة أولاد الشيخ",
        "postCode": "44029"
      },
      {
        "fr": "Djendel",
        "ar": "جندل",
        "postCode": "44012"
      },
      {
        "fr": "El Abadia",
        "ar": "العبادية",
        "postCode": "44011"
      },
      {
        "fr": "El Amra",
        "ar": "العامرة",
        "postCode": "44008"
      },
      {
        "fr": "El Attaf",
        "ar": "العطاف",
        "postCode": "44010"
      },
      {
        "fr": "El Hassania",
        "ar": "الحسنية",
        "postCode": "44018"
      },
      {
        "fr": "El Maine",
        "ar": "الماين",
        "postCode": "44034"
      },
      {
        "fr": "Hammam Righa",
        "ar": "حمام ريغة",
        "postCode": "44005"
      },
      {
        "fr": "Hoceinia",
        "ar": "حسينية",
        "postCode": "44027"
      },
      {
        "fr": "Khemis Miliana",
        "ar": "خميس مليانة",
        "postCode": "44004"
      },
      {
        "fr": "Mekhatria",
        "ar": "المخاطرية",
        "postCode": "44030"
      },
      {
        "fr": "Miliana",
        "ar": "مليانة",
        "postCode": "44002"
      },
      {
        "fr": "Oued Chorfa",
        "ar": "وادى الشرفاء",
        "postCode": "44013"
      },
      {
        "fr": "Oued Djemaa",
        "ar": "وادى جمعة",
        "postCode": "44015"
      },
      {
        "fr": "Rouina",
        "ar": "روينة",
        "postCode": "44016"
      },
      {
        "fr": "Sidi Lakhdar",
        "ar": "سيدي لخضر",
        "postCode": "44024"
      },
      {
        "fr": "Tachta Zegagha",
        "ar": "تاشتة زقاغة",
        "postCode": "44032"
      },
      {
        "fr": "Tarik Ibn Ziad",
        "ar": "طارق بن زياد",
        "postCode": "44021"
      },
      {
        "fr": "Tiberkanine",
        "ar": "تبركانين",
        "postCode": "44035"
      },
      {
        "fr": "Zeddine",
        "ar": "زدين",
        "postCode": "44017"
      }
    ]
  },
  {
    "code": "45",
    "name_fr": "Naama",
    "name_ar": "النعامة",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Ain Ben Khelil",
        "ar": "عين بن خليل",
        "postCode": "45009"
      },
      {
        "fr": "Ain Sefra",
        "ar": "عين الصفراء",
        "postCode": "45003"
      },
      {
        "fr": "Assela",
        "ar": "عسلة",
        "postCode": "45007"
      },
      {
        "fr": "Djeniane Bourzeg",
        "ar": "جنين بورزق",
        "postCode": "45008"
      },
      {
        "fr": "El Biod",
        "ar": "البيوض",
        "postCode": "45012"
      },
      {
        "fr": "Kasdir",
        "ar": "قصدير",
        "postCode": "45011"
      },
      {
        "fr": "Makman Ben Amer",
        "ar": "مكمن بن عمر",
        "postCode": "45010"
      },
      {
        "fr": "Mechria",
        "ar": "مشرية",
        "postCode": "45002"
      },
      {
        "fr": "Moghrar",
        "ar": "مغرار",
        "postCode": "45006"
      },
      {
        "fr": "Naama",
        "ar": "النــعـامـة",
        "postCode": "45001"
      },
      {
        "fr": "Sfissifa",
        "ar": "صفيصيفة",
        "postCode": "45005"
      },
      {
        "fr": "Tiout",
        "ar": "تيوت",
        "postCode": "45004"
      }
    ]
  },
  {
    "code": "46",
    "name_fr": "Ain Temouchent",
    "name_ar": "عين تموشنت",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Aghlal",
        "ar": "أغلال",
        "postCode": "46007"
      },
      {
        "fr": "Ain El Arbaa",
        "ar": "عين الاربعاء",
        "postCode": "46009"
      },
      {
        "fr": "Ain Kihal",
        "ar": "عين الكيحل",
        "postCode": "46003"
      },
      {
        "fr": "Ain Temouchent",
        "ar": "عـيـن تـمـوشـنـت",
        "postCode": "46001"
      },
      {
        "fr": "Ain Tolba",
        "ar": "عين الطلبة",
        "postCode": "46018"
      },
      {
        "fr": "Aoubellil",
        "ar": "عقب الليل",
        "postCode": "46013"
      },
      {
        "fr": "Beni Saf",
        "ar": "بني صاف",
        "postCode": "46023"
      },
      {
        "fr": "Bou Zedjar",
        "ar": "بوزجار",
        "postCode": "46005"
      },
      {
        "fr": "Chaabet El Ham",
        "ar": "شعبة اللحم",
        "postCode": "46002"
      },
      {
        "fr": "Chentouf",
        "ar": "شنتوف",
        "postCode": "46011"
      },
      {
        "fr": "El Amria",
        "ar": "العامرية",
        "postCode": "46019"
      },
      {
        "fr": "El Emir Abdelkader",
        "ar": "الأمير عبد القادر",
        "postCode": "46027"
      },
      {
        "fr": "El Malah",
        "ar": "المالح",
        "postCode": "46014"
      },
      {
        "fr": "El Messaid",
        "ar": "المساعيد",
        "postCode": "46028"
      },
      {
        "fr": "Hammam Bouhadjar",
        "ar": "حمام بو حجر",
        "postCode": "46004"
      },
      {
        "fr": "Hassasna",
        "ar": "الحساسنة",
        "postCode": "46021"
      },
      {
        "fr": "Hassi El Ghella",
        "ar": "حاسى الغلة",
        "postCode": "46020"
      },
      {
        "fr": "Oued Berkeche",
        "ar": "وادى برقش",
        "postCode": "46006"
      },
      {
        "fr": "Oued Sabah",
        "ar": "وادى الصباح",
        "postCode": "46016"
      },
      {
        "fr": "Ouled Boudjemaa",
        "ar": "أولاد بوجمعة",
        "postCode": "46017"
      },
      {
        "fr": "Ouled Kihal",
        "ar": "أولاد الكيحل",
        "postCode": "46022"
      },
      {
        "fr": "Oulhaca El Gheraba",
        "ar": "ولهاصة الغرابة",
        "postCode": "46025"
      },
      {
        "fr": "Sidi Ben Adda",
        "ar": "سيدي بن عدة",
        "postCode": "46012"
      },
      {
        "fr": "Sidi Boumediene",
        "ar": "سيدي بومدين",
        "postCode": "46015"
      },
      {
        "fr": "Sidi Ouriache",
        "ar": "سيدي وريلش",
        "postCode": "46026"
      },
      {
        "fr": "Sidi Safi",
        "ar": "سيدي الصافي",
        "postCode": "46024"
      },
      {
        "fr": "Tamzoura",
        "ar": "تامزوغة",
        "postCode": "46010"
      },
      {
        "fr": "Terga",
        "ar": "تارقة",
        "postCode": "46008"
      }
    ]
  },
  {
    "code": "47",
    "name_fr": "Ghardaia",
    "name_ar": "غرداية",
    "deliveryFeeDZD": 850,
    "communes": [
      {
        "fr": "Berriane",
        "ar": "بريان",
        "postCode": "47004"
      },
      {
        "fr": "Bounoura",
        "ar": "بونورة",
        "postCode": "47010"
      },
      {
        "fr": "Dhayet Bendhahoua",
        "ar": "ضاية بن ضحوة",
        "postCode": "47003"
      },
      {
        "fr": "El Atteuf",
        "ar": "العطف",
        "postCode": "47007"
      },
      {
        "fr": "El Guerrara",
        "ar": "الڨرارة",
        "postCode": "47006"
      },
      {
        "fr": "El Meniaa",
        "ar": "المنيعة",
        "postCode": "47002"
      },
      {
        "fr": "Ghardaia",
        "ar": "غرداية",
        "postCode": "47001"
      },
      {
        "fr": "Mansoura",
        "ar": "منصورة",
        "postCode": "47013"
      },
      {
        "fr": "Metlili",
        "ar": "متليلي الشعانبة",
        "postCode": "47005"
      },
      {
        "fr": "Sebseb",
        "ar": "سبسب",
        "postCode": "47009"
      },
      {
        "fr": "Zelfana",
        "ar": "زلفانة",
        "postCode": "47008"
      }
    ]
  },
  {
    "code": "48",
    "name_fr": "Relizane",
    "name_ar": "غليزان",
    "deliveryFeeDZD": 600,
    "communes": [
      {
        "fr": "Ain Rahma",
        "ar": "عين الرحمة",
        "postCode": "48024"
      },
      {
        "fr": "Ain Tarek",
        "ar": "عين طارق",
        "postCode": "48019"
      },
      {
        "fr": "Ammi Moussa",
        "ar": "عمي موسى",
        "postCode": "48011"
      },
      {
        "fr": "Belaassel Bouzegza",
        "ar": "بلعسل بوزقزة",
        "postCode": "48003"
      },
      {
        "fr": "Bendaoud",
        "ar": "بن داود",
        "postCode": "48035"
      },
      {
        "fr": "Beni Dergoun",
        "ar": "بني درقن",
        "postCode": "48013"
      },
      {
        "fr": "Beni Zentis",
        "ar": "بني زنتيس",
        "postCode": "48030"
      },
      {
        "fr": "Dar Ben Abdellah",
        "ar": "دار بن عبد الله",
        "postCode": "48032"
      },
      {
        "fr": "Djidiouia",
        "ar": "جيديوة",
        "postCode": "48014"
      },
      {
        "fr": "El Guettar",
        "ar": "القطارة",
        "postCode": "48015"
      },
      {
        "fr": "El Hamadna",
        "ar": "الحمادنة",
        "postCode": "48007"
      },
      {
        "fr": "El Hassi",
        "ar": "الحاسى",
        "postCode": "48033"
      },
      {
        "fr": "El Matmar",
        "ar": "المطمار",
        "postCode": "48017"
      },
      {
        "fr": "El Ouldja",
        "ar": "العلجة",
        "postCode": "48036"
      },
      {
        "fr": "Had Echkalla",
        "ar": "حد الشقالة",
        "postCode": "48034"
      },
      {
        "fr": "Hamri",
        "ar": "الحمري",
        "postCode": "48016"
      },
      {
        "fr": "Kalaa",
        "ar": "قلعة",
        "postCode": "48023"
      },
      {
        "fr": "Lahlef",
        "ar": "لحلاف",
        "postCode": "48029"
      },
      {
        "fr": "Mazouna",
        "ar": "مازونة",
        "postCode": "48022"
      },
      {
        "fr": "Mediouna",
        "ar": "مديونة",
        "postCode": "48009"
      },
      {
        "fr": "Mendes",
        "ar": "مندس",
        "postCode": "48028"
      },
      {
        "fr": "Merdja Sidi Abed",
        "ar": "مرجة سيدي عابد",
        "postCode": "48037"
      },
      {
        "fr": "Ouarizane",
        "ar": "ﻭﺍﺭﻳﺯﺍﻥ",
        "postCode": "48021"
      },
      {
        "fr": "Oued El Djemaa",
        "ar": "وادى الجمعة",
        "postCode": "48026"
      },
      {
        "fr": "Oued Essalem",
        "ar": "وادي السلام",
        "postCode": "48020"
      },
      {
        "fr": "Oued Rhiou",
        "ar": "وادي رهيو",
        "postCode": "48002"
      },
      {
        "fr": "Ouled Aiche",
        "ar": "أولاد يعيش",
        "postCode": "48005"
      },
      {
        "fr": "Ouled Sidi Mihoub",
        "ar": "أولاد سيدي ميهوب",
        "postCode": "48038"
      },
      {
        "fr": "Ramka",
        "ar": "رمكة",
        "postCode": "48027"
      },
      {
        "fr": "Relizane",
        "ar": "غيليزان",
        "postCode": "48001"
      },
      {
        "fr": "Sidi Khettab",
        "ar": "سيدي خطاب",
        "postCode": "48010"
      },
      {
        "fr": "Sidi Lazreg",
        "ar": "سيدي لزرق",
        "postCode": "48006"
      },
      {
        "fr": "Sidi Mhamed Ben Ali",
        "ar": "سيدي امحمد بن علي",
        "postCode": "48008"
      },
      {
        "fr": "Sidi Mhamed Ben Aouda",
        "ar": "سيدي بن عودة",
        "postCode": "48018"
      },
      {
        "fr": "Sidi Saada",
        "ar": "سيدي سعادة",
        "postCode": "48004"
      },
      {
        "fr": "Souk El Haad",
        "ar": "سوق الحد",
        "postCode": "48031"
      },
      {
        "fr": "Yellel",
        "ar": "يلل",
        "postCode": "48025"
      },
      {
        "fr": "Zemmoura",
        "ar": "زمورة",
        "postCode": "48012"
      }
    ]
  },
  {
    "code": "49",
    "name_fr": "El M'ghair",
    "name_ar": "المغير",
    "deliveryFeeDZD": 950,
    "communes": [
      {
        "fr": "Aougrout",
        "ar": "أوقروت",
        "postCode": "49023"
      },
      {
        "fr": "Charouine",
        "ar": "شروين",
        "postCode": "49003"
      },
      {
        "fr": "Deldoul",
        "ar": "دﻟﺪول",
        "postCode": "49017"
      },
      {
        "fr": "Ksar Kaddour",
        "ar": "قصر قدور",
        "postCode": "49007"
      },
      {
        "fr": "Metarfa",
        "ar": "المطارفة",
        "postCode": "49020"
      },
      {
        "fr": "Ouled Aissa",
        "ar": "أولاد عيسى",
        "postCode": "49027"
      },
      {
        "fr": "Ouled Said",
        "ar": "أولاد سعيد",
        "postCode": "49010"
      },
      {
        "fr": "Talmine",
        "ar": "Talmine",
        "postCode": "49024"
      },
      {
        "fr": "Timimoun",
        "ar": "تيميمون",
        "postCode": "49009"
      },
      {
        "fr": "Tinerkouk",
        "ar": "زاوية دباغ",
        "postCode": "49016"
      }
    ]
  },
  {
    "code": "50",
    "name_fr": "El Menia",
    "name_ar": "المنيعة",
    "deliveryFeeDZD": 1050,
    "communes": [
      {
        "fr": "Bordj Badji Mokhtar",
        "ar": "برج باجي مختار",
        "postCode": "50025"
      },
      {
        "fr": "Timiaouine",
        "ar": "تيمياوين",
        "postCode": "50028"
      }
    ]
  },
  {
    "code": "51",
    "name_fr": "Ouled Djellal",
    "name_ar": "أولاد جلال",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Besbes",
        "ar": "البسباس",
        "postCode": "51007"
      },
      {
        "fr": "Chaiba",
        "ar": "الشعيبة",
        "postCode": "51005"
      },
      {
        "fr": "Doucen",
        "ar": "الدوسن",
        "postCode": "51009"
      },
      {
        "fr": "Ouled Djellal",
        "ar": "أولاد جلال",
        "postCode": "51005"
      },
      {
        "fr": "Ras El Miaad",
        "ar": "راس الميعاد",
        "postCode": "51006"
      },
      {
        "fr": "Ras El Miad",
        "ar": "راس الميعاد",
        "postCode": "51003"
      },
      {
        "fr": "Sidi Khaled",
        "ar": "سيدي خالد",
        "postCode": "51008"
      }
    ]
  },
  {
    "code": "52",
    "name_fr": "Bordj Baji Mokhtar",
    "name_ar": "برج باجي مختار",
    "deliveryFeeDZD": 950,
    "communes": [
      {
        "fr": "Beni Abbes",
        "ar": "بني عباس",
        "postCode": "52007"
      },
      {
        "fr": "Beni Ikhlef",
        "ar": "بني يخلف",
        "postCode": "52003"
      },
      {
        "fr": "El Ouata",
        "ar": "الوطى",
        "postCode": "52014"
      },
      {
        "fr": "Igli",
        "ar": "إقلي",
        "postCode": "52011"
      },
      {
        "fr": "Kerzaz",
        "ar": "كرزاز",
        "postCode": "52018"
      },
      {
        "fr": "Ksabi",
        "ar": "قصابى",
        "postCode": "52019"
      },
      {
        "fr": "Ouled Khoudir",
        "ar": "أولاد خدير",
        "postCode": "52003"
      },
      {
        "fr": "Tabelbala",
        "ar": "تبلبلة",
        "postCode": "52010"
      },
      {
        "fr": "Tamtert",
        "ar": "تامترت",
        "postCode": "52002"
      },
      {
        "fr": "Timoudi",
        "ar": "تيمودى",
        "postCode": "52005"
      }
    ]
  },
  {
    "code": "53",
    "name_fr": "Béni Abbès",
    "name_ar": "بني عباس",
    "deliveryFeeDZD": 950,
    "communes": [
      {
        "fr": "Foggaret Ezzaouia",
        "ar": "فقارة الزوى",
        "postCode": "53010"
      },
      {
        "fr": "In Ghar",
        "ar": "عـيـن غــار",
        "postCode": "53003"
      },
      {
        "fr": "In Salah",
        "ar": "عين صالح",
        "postCode": "53008"
      }
    ]
  },
  {
    "code": "54",
    "name_fr": "Timimoun",
    "name_ar": "تيميمون",
    "deliveryFeeDZD": 1050,
    "communes": [
      {
        "fr": "In Guezzam",
        "ar": "عين قزام",
        "postCode": "54004"
      },
      {
        "fr": "Tin Zaouatine",
        "ar": "تين زواتين",
        "postCode": "54002"
      }
    ]
  },
  {
    "code": "55",
    "name_fr": "Touggourt",
    "name_ar": "تقرت",
    "deliveryFeeDZD": 850,
    "communes": [
      {
        "fr": "Benaceur",
        "ar": "بن ناصر",
        "postCode": "55017"
      },
      {
        "fr": "Blidet Amor",
        "ar": "بلدة عمر",
        "postCode": "55006"
      },
      {
        "fr": "El Allia",
        "ar": "العالية",
        "postCode": "55020"
      },
      {
        "fr": "El Hadjira",
        "ar": "الحجيرة",
        "postCode": "55014"
      },
      {
        "fr": "Hadjira",
        "ar": "الحجيرة",
        "postCode": "55012"
      },
      {
        "fr": "Megarine",
        "ar": "المقارين",
        "postCode": "55019"
      },
      {
        "fr": "Mnaguer",
        "ar": "المنقر",
        "postCode": "55018"
      },
      {
        "fr": "Nezla",
        "ar": "نزلة",
        "postCode": "55008"
      },
      {
        "fr": "Sidi Slimane",
        "ar": "سيدي سليمان",
        "postCode": "55010"
      },
      {
        "fr": "Taibet",
        "ar": "الطيبات",
        "postCode": "55015"
      },
      {
        "fr": "Tamacine",
        "ar": "تماسين",
        "postCode": "55016"
      },
      {
        "fr": "Tebesbest",
        "ar": "تبسبست",
        "postCode": "55007"
      },
      {
        "fr": "Temacine",
        "ar": "تماسين",
        "postCode": "55005"
      },
      {
        "fr": "Touggourt",
        "ar": "توقرت",
        "postCode": "55013"
      },
      {
        "fr": "Zaouia El Abidia",
        "ar": "الزاوية العابدية",
        "postCode": "55009"
      }
    ]
  },
  {
    "code": "56",
    "name_fr": "Djanet",
    "name_ar": "جانت",
    "deliveryFeeDZD": 1050,
    "communes": [
      {
        "fr": "Bordj El Haouas",
        "ar": "برج الحواس",
        "postCode": "56002"
      },
      {
        "fr": "Bordj El Haouasse",
        "ar": "برج الحواس",
        "postCode": "56005"
      },
      {
        "fr": "Djanet",
        "ar": "جانت",
        "postCode": "56002"
      }
    ]
  },
  {
    "code": "57",
    "name_fr": "In Salah",
    "name_ar": "عين صالح",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Djamaa",
        "ar": "جامعة",
        "postCode": "57028"
      },
      {
        "fr": "El M'Ghair",
        "ar": "المغير",
        "postCode": "57001"
      },
      {
        "fr": "M'Rara",
        "ar": "مرارة",
        "postCode": "57008"
      },
      {
        "fr": "Oum Touyour",
        "ar": "أم الطيور",
        "postCode": "57029"
      },
      {
        "fr": "Sidi Amrane",
        "ar": "سيدي عمران",
        "postCode": "57030"
      },
      {
        "fr": "Sidi Khelil",
        "ar": "سيدي خليل",
        "postCode": "57003"
      },
      {
        "fr": "Still",
        "ar": "سطيل",
        "postCode": "57021"
      },
      {
        "fr": "Tendla",
        "ar": "تندلة",
        "postCode": "57024"
      },
      {
        "fr": "Tenedla",
        "ar": "تندلة",
        "postCode": "57007"
      }
    ]
  },
  {
    "code": "58",
    "name_fr": "In Guezzam",
    "name_ar": "عين قزام",
    "deliveryFeeDZD": 850,
    "communes": [
      {
        "fr": "El Meniaa",
        "ar": "المنيعة",
        "postCode": "58001"
      },
      {
        "fr": "Hassi Fehal",
        "ar": "حاسي الفحل",
        "postCode": "58011"
      },
      {
        "fr": "Hassi Gara",
        "ar": "حاسي قارة",
        "postCode": "58012"
      }
    ]
  },
  {
    "code": "59",
    "name_fr": "Aflou",
    "name_ar": "آفلو",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Aflou",
        "ar": "أفلو",
        "postCode": "59019"
      },
      {
        "fr": "Ain Sidi Ali",
        "ar": "عين سيدي علي",
        "postCode": "59011"
      },
      {
        "fr": "Beidha",
        "ar": "بيضاء",
        "postCode": "59012"
      },
      {
        "fr": "Brida",
        "ar": "بريدة",
        "postCode": "59013"
      },
      {
        "fr": "El Ghicha",
        "ar": "الغيشة",
        "postCode": "59014"
      },
      {
        "fr": "Gueltat Sidi Saad",
        "ar": "قلتة سيدي سعد",
        "postCode": "59010"
      },
      {
        "fr": "Hadj Mechri",
        "ar": "الحاج المشري",
        "postCode": "59007"
      },
      {
        "fr": "Oued M'Zi",
        "ar": "وادي مزي",
        "postCode": "59011"
      },
      {
        "fr": "Oued Morra",
        "ar": "وادي مرة",
        "postCode": "59021"
      },
      {
        "fr": "Sebgag",
        "ar": "سبقاق",
        "postCode": "59016"
      },
      {
        "fr": "Sidi Bouzid",
        "ar": "سيدي بوزيد",
        "postCode": "59024"
      },
      {
        "fr": "Taouiala",
        "ar": "تاويالة",
        "postCode": "59009"
      }
    ]
  },
  {
    "code": "60",
    "name_fr": "Barika",
    "name_ar": "بريكة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Abdelkader Azil",
        "ar": "عبد القادر عزيل",
        "postCode": "60003"
      },
      {
        "fr": "Barika",
        "ar": "بريكة",
        "postCode": "60042"
      },
      {
        "fr": "Bitam",
        "ar": "بيطام",
        "postCode": "60014"
      },
      {
        "fr": "Djerma",
        "ar": "جرمة",
        "postCode": "60013"
      },
      {
        "fr": "El Djazzar",
        "ar": "الجزار",
        "postCode": "60006"
      },
      {
        "fr": "El Madher",
        "ar": "المعذر",
        "postCode": "60007"
      },
      {
        "fr": "Mdoukal",
        "ar": "مدوكل",
        "postCode": "60007"
      },
      {
        "fr": "Ouled Ammar",
        "ar": "أولاد عمار",
        "postCode": "60056"
      },
      {
        "fr": "Seggana",
        "ar": "سقانة",
        "postCode": "60029"
      },
      {
        "fr": "Tilatou",
        "ar": "تيلاطو",
        "postCode": "60004"
      }
    ]
  },
  {
    "code": "61",
    "name_fr": "El Kantara",
    "name_ar": "القنطرة",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Ain Zaatout",
        "ar": "عين زعطوط",
        "postCode": "61018"
      },
      {
        "fr": "Branis",
        "ar": "البرانس",
        "postCode": "61003"
      },
      {
        "fr": "Djemourah",
        "ar": "جمورة",
        "postCode": "61005"
      },
      {
        "fr": "El Kantara",
        "ar": "القنطرة",
        "postCode": "61017"
      },
      {
        "fr": "El Outaya",
        "ar": "لوطاية",
        "postCode": "61019"
      }
    ]
  },
  {
    "code": "62",
    "name_fr": "Bir El Ater",
    "name_ar": "بئر العاتر",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Bir El Ater",
        "ar": "بئر العاتر",
        "postCode": "62002"
      },
      {
        "fr": "El Ogla",
        "ar": "العقلة",
        "postCode": "62013"
      },
      {
        "fr": "Ferkane",
        "ar": "فـــــــركـــــان",
        "postCode": "62028"
      },
      {
        "fr": "Negrine",
        "ar": "نقرين",
        "postCode": "62009"
      },
      {
        "fr": "Ogla Melha",
        "ar": "العقلة المالحة",
        "postCode": "62003"
      }
    ]
  },
  {
    "code": "63",
    "name_fr": "El Aricha",
    "name_ar": "العريشة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "El Aricha",
        "ar": "العريشة",
        "postCode": "63032"
      },
      {
        "fr": "El Bouihi",
        "ar": "البويهي",
        "postCode": "63004"
      },
      {
        "fr": "El Gor",
        "ar": "الغور",
        "postCode": "63010"
      },
      {
        "fr": "Sidi Djillali",
        "ar": "سيدي الجيلالي",
        "postCode": "63003"
      }
    ]
  },
  {
    "code": "64",
    "name_fr": "Ksar Chellala",
    "name_ar": "قصر الشلالة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Bougara",
        "ar": "بوقرة",
        "postCode": "64040"
      },
      {
        "fr": "Hamadia",
        "ar": "الحمادية",
        "postCode": "64035"
      },
      {
        "fr": "Ksar Chellala",
        "ar": "قصر الشلالة",
        "postCode": "64029"
      },
      {
        "fr": "Rechaiga",
        "ar": "الرشايقة",
        "postCode": "64030"
      },
      {
        "fr": "Serghine",
        "ar": "سرغين",
        "postCode": "64039"
      },
      {
        "fr": "Sidi Abdelghani",
        "ar": "سيدي عبد الغنى",
        "postCode": "64017"
      },
      {
        "fr": "Zmalet El Emir Abdelkader",
        "ar": "زمالة الأمير عبد القادر",
        "postCode": "64002"
      }
    ]
  },
  {
    "code": "65",
    "name_fr": "Ain Oussera",
    "name_ar": "عين وسارة",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Ain Fekka",
        "ar": "عين افقة",
        "postCode": "65035"
      },
      {
        "fr": "Ain Oussera",
        "ar": "عين وسارة",
        "postCode": "65031"
      },
      {
        "fr": "Benhar",
        "ar": "بنهار",
        "postCode": "65032"
      },
      {
        "fr": "Birine",
        "ar": "البيرين",
        "postCode": "65008"
      },
      {
        "fr": "Bouira Lahdab",
        "ar": "بويرة الأحدب",
        "postCode": "65003"
      },
      {
        "fr": "El Khemis",
        "ar": "الخميس",
        "postCode": "65004"
      },
      {
        "fr": "Guernini",
        "ar": "القرنيني",
        "postCode": "65021"
      },
      {
        "fr": "Had Sahary",
        "ar": "حد الصحاري",
        "postCode": "65020"
      },
      {
        "fr": "Hassi Fedoul",
        "ar": "حاسي فدول",
        "postCode": "65033"
      },
      {
        "fr": "Sidi Ladjel",
        "ar": "سيدي لعجال",
        "postCode": "65019"
      }
    ]
  },
  {
    "code": "66",
    "name_fr": "Messad",
    "name_ar": "مسعد",
    "deliveryFeeDZD": 750,
    "communes": [
      {
        "fr": "Amourah",
        "ar": "عمورة",
        "postCode": "66006"
      },
      {
        "fr": "Deldoul",
        "ar": "دلدول",
        "postCode": "66029"
      },
      {
        "fr": "Faydh El Botma",
        "ar": "فيض البطمة",
        "postCode": "66003"
      },
      {
        "fr": "Guettara",
        "ar": "القطارة",
        "postCode": "66004"
      },
      {
        "fr": "Messaad",
        "ar": "مسعد",
        "postCode": "66017"
      },
      {
        "fr": "Messad",
        "ar": "مسعد",
        "postCode": "66001"
      },
      {
        "fr": "Om El Adham",
        "ar": "أم العظام",
        "postCode": "66008"
      },
      {
        "fr": "Sed Rahal",
        "ar": "سد رحال",
        "postCode": "66006"
      },
      {
        "fr": "Selmana",
        "ar": "سلمانة",
        "postCode": "66022"
      }
    ]
  },
  {
    "code": "67",
    "name_fr": "Ksar El Boukhari",
    "name_ar": "قصر البخاري",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain Boucif",
        "ar": "عين بوسيف",
        "postCode": "67003"
      },
      {
        "fr": "Ain El Kessir",
        "ar": "عين القصير",
        "postCode": "67015"
      },
      {
        "fr": "Aziz",
        "ar": "عزيز",
        "postCode": "67032"
      },
      {
        "fr": "Boghar",
        "ar": "بوغار",
        "postCode": "67010"
      },
      {
        "fr": "Bouaiche",
        "ar": "بوعيش",
        "postCode": "67005"
      },
      {
        "fr": "Boughezoul",
        "ar": "بوغزول",
        "postCode": "67018"
      },
      {
        "fr": "Chahbounia",
        "ar": "الشهبونية",
        "postCode": "67038"
      },
      {
        "fr": "Chellalet El Adhaoura",
        "ar": "شلالة العذاورة",
        "postCode": "67007"
      },
      {
        "fr": "Cheniguel",
        "ar": "شنيقل",
        "postCode": "67014"
      },
      {
        "fr": "Derrag",
        "ar": "دراق",
        "postCode": "67004"
      },
      {
        "fr": "El Omaria",
        "ar": "العمارية",
        "postCode": "67007"
      },
      {
        "fr": "El Ouinet",
        "ar": "العوينات",
        "postCode": "67019"
      },
      {
        "fr": "Kef Lakhdar",
        "ar": "الكاف الأخضر",
        "postCode": "67006"
      },
      {
        "fr": "Ksar El Boukhari",
        "ar": "قصر البخاري",
        "postCode": "67035"
      },
      {
        "fr": "M'fatha",
        "ar": "مفاتحة",
        "postCode": "67017"
      },
      {
        "fr": "Ouled Antar",
        "ar": "أولاد عنتر",
        "postCode": "67058"
      },
      {
        "fr": "Ouled Hellal",
        "ar": "أولاد هلال",
        "postCode": "67008"
      },
      {
        "fr": "Ouled Maaref",
        "ar": "أولاد معرف",
        "postCode": "67002"
      },
      {
        "fr": "Oum El Djellil",
        "ar": "أم الجليل",
        "postCode": "67016"
      },
      {
        "fr": "Saneg",
        "ar": "سانڨ",
        "postCode": "67064"
      },
      {
        "fr": "Sidi Damed",
        "ar": "سيدي دامد",
        "postCode": "67011"
      },
      {
        "fr": "Tafraout",
        "ar": "تفراوت",
        "postCode": "67009"
      }
    ]
  },
  {
    "code": "68",
    "name_fr": "Bou Saada",
    "name_ar": "بوسعادة",
    "deliveryFeeDZD": 650,
    "communes": [
      {
        "fr": "Ain El Hadjel",
        "ar": "عين الحجل",
        "postCode": "68017"
      },
      {
        "fr": "Ain El Melh",
        "ar": "عين الملح",
        "postCode": "68041"
      },
      {
        "fr": "Ain Errich",
        "ar": "عين الريش",
        "postCode": "68044"
      },
      {
        "fr": "Ain Fares",
        "ar": "عين فارس",
        "postCode": "68013"
      },
      {
        "fr": "Ain Rich",
        "ar": "عين الريش",
        "postCode": "68015"
      },
      {
        "fr": "Amjedel",
        "ar": "أمجدل",
        "postCode": "68016"
      },
      {
        "fr": "Belaiba",
        "ar": "بلعايبة",
        "postCode": "68015"
      },
      {
        "fr": "Ben Srour",
        "ar": "بن سرور",
        "postCode": "68024"
      },
      {
        "fr": "Benzouh",
        "ar": "بنزوه",
        "postCode": "68023"
      },
      {
        "fr": "Bir El Fodda",
        "ar": "بير الفضة",
        "postCode": "68012"
      },
      {
        "fr": "Bou Saada",
        "ar": "بوسعادة",
        "postCode": "68020"
      },
      {
        "fr": "Bouti Sayah",
        "ar": "بوطي السايح",
        "postCode": "68031"
      },
      {
        "fr": "Dehahna",
        "ar": "الدهاهنة",
        "postCode": "68030"
      },
      {
        "fr": "Djebel M'saad",
        "ar": "جبل أمساعد",
        "postCode": "68018"
      },
      {
        "fr": "Djebel Messaad",
        "ar": "جبل مساعد",
        "postCode": "68047"
      },
      {
        "fr": "El Hamel",
        "ar": "الهامل",
        "postCode": "68002"
      },
      {
        "fr": "Hammam Dhalaa",
        "ar": "حمـام الضلعة",
        "postCode": "68003"
      },
      {
        "fr": "Houamed",
        "ar": "الحوامد",
        "postCode": "68006"
      },
      {
        "fr": "Khettouti Sed Djir",
        "ar": "خطوطي سد الجير",
        "postCode": "68032"
      },
      {
        "fr": "Khoubana",
        "ar": "خبانة",
        "postCode": "68004"
      },
      {
        "fr": "M'Sif",
        "ar": "مسيف",
        "postCode": "68005"
      },
      {
        "fr": "Maarif",
        "ar": "المعاريف",
        "postCode": "68029"
      },
      {
        "fr": "Magra",
        "ar": "مقرة",
        "postCode": "68011"
      },
      {
        "fr": "Mohammed Boudiaf",
        "ar": "محمد بوضياف",
        "postCode": "68010"
      },
      {
        "fr": "Ouled Atia",
        "ar": "أولاد عطية",
        "postCode": "68017"
      },
      {
        "fr": "Ouled Madhi",
        "ar": "أولاد مـاضي",
        "postCode": "68010"
      },
      {
        "fr": "Ouled Sidi Brahim",
        "ar": "أولاد سيدي ابراهيم",
        "postCode": "68021"
      },
      {
        "fr": "Ouled Slimane",
        "ar": "أولاد سليمان",
        "postCode": "68008"
      },
      {
        "fr": "Oultene",
        "ar": "ولتام",
        "postCode": "68003"
      },
      {
        "fr": "Sidi Ameur",
        "ar": "سيدي عامر",
        "postCode": "68022"
      },
      {
        "fr": "Sidi M'hamed",
        "ar": "سيدي امحمد",
        "postCode": "68014"
      },
      {
        "fr": "Slim",
        "ar": "سليم",
        "postCode": "68043"
      },
      {
        "fr": "Tamsa",
        "ar": "تامسة",
        "postCode": "68023"
      },
      {
        "fr": "Zarzour",
        "ar": "الزرزور",
        "postCode": "68009"
      }
    ]
  },
  {
    "code": "69",
    "name_fr": "El Abiodh Sidi Cheikh",
    "name_ar": "الأبيض سيدي الشيخ",
    "deliveryFeeDZD": 850,
    "communes": [
      {
        "fr": "Ain El Orak",
        "ar": "عين العراك",
        "postCode": "69008"
      },
      {
        "fr": "Arbaouat",
        "ar": "أربوات",
        "postCode": "69009"
      },
      {
        "fr": "Boussemghoun",
        "ar": "بوسمغون",
        "postCode": "69013"
      },
      {
        "fr": "Chellala",
        "ar": "شلالة",
        "postCode": "69014"
      },
      {
        "fr": "El Abiodh Sidi Cheikh",
        "ar": "الابيض سيدي الشيخ",
        "postCode": "69007"
      },
      {
        "fr": "El Bnoud",
        "ar": "البنود",
        "postCode": "69006"
      },
      {
        "fr": "El Mahra",
        "ar": "المهرة",
        "postCode": "69007"
      },
      {
        "fr": "El Mehara",
        "ar": "المھارة",
        "postCode": "69019"
      }
    ]
  }
];
