export type Locale = "fr" | "ar";

export interface Dictionary {
  nav: {
    home: string;
    shop: string;
    collections: string;
    packs: string;
    buildPack: string;
    about: string;
    contact: string;
    admin: string;
    searchPlaceholder: string;
    cart: string;
    switchLang: string;
    freeShippingNotice: string;
  };
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
    shopNow: string;
    discoverPacks: string;
    artisanalBadge: string;
  };
  shop: {
    title: string;
    subtitle: string;
    filterGender: string;
    allGenders: string;
    men: string;
    women: string;
    unisex: string;
    filterFamily: string;
    allFamilies: string;
    filterSeason: string;
    allSeasons: string;
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
    sortBy: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    startingFrom: string;
    quickAdd: string;
    viewDetails: string;
    size: string;
    notes: string;
    classification: string;
    inStock: string;
    outOfStock: string;
  };
  product: {
    bottleSize: string;
    quantity: string;
    addToCart: string;
    deliveryInfo: string;
    composition: string;
    olfactoryPyramid: string;
    topNotes: string;
    heartNotes: string;
    baseNotes: string;
    guaranteedQuality: string;
    concentrationDesc: string;
  };
  packs: {
    title: string;
    subtitle: string;
    predefinedTitle: string;
    customTitle: string;
    buildYourOwn: string;
    step1: string;
    step2: string;
    step3: string;
    selectFragrances: string;
    includedBottles: string;
    packSavings: string;
  };
  cart: {
    title: string;
    emptyMessage: string;
    continueShopping: string;
    subtotal: string;
    deliveryEstimate: string;
    total: string;
    checkout: string;
    cashOnDelivery: string;
  };
  checkout: {
    title: string;
    fullName: string;
    phone: string;
    wilaya: string;
    commune: string;
    address: string;
    notes: string;
    placeOrder: string;
    orderSuccess: string;
    deliveryCalculated: string;
  };
  footer: {
    brandStatement: string;
    wilayaDeliveryNote: string;
    quickLinks: string;
    customerCare: string;
    legal: string;
    copyright: string;
  };
  admin: {
    dashboard: string;
    sales: string;
    orders: string;
    catalog: string;
    perfumes: string;
    packs: string;
    inventory: string;
    production: string;
    settings: string;
    totalRevenue: string;
    confirmedRevenue: string;
    deliveredRevenue: string;
    pendingOrders: string;
  };
}
