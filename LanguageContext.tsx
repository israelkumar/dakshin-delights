
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Language = 'en' | 'ta';

const en = {
  skipToContent: 'Skip to main content',
  loading: 'Loading...',
  nav: {
    home: 'Home',
    menu: 'Menu',
    myOrders: 'My Orders',
    studio: 'Studio',
    theme: 'Theme',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    cart: 'Cart',
  },
  home: {
    heroBadge: 'Authentic South Indian',
    heroTitle: 'Tradition Served on a',
    heroTitleHighlight: 'Banana Leaf',
    heroDesc:
      'Experience the rich heritage of homemade recipes crafted by Chef Amara. Stone-ground spices, fermented batters, and love delivered to your doorstep.',
    viewFullMenu: 'View Full Menu',
    exploreStory: 'Explore Our Story',
    offerTitle: 'Buy 2 Dosas, Get 1 Filter Coffee',
    offerTitleHighlight: 'FREE!',
    offerDesc: 'Experience the perfect South Indian breakfast combo today.',
    orderNow: 'Order Now',
    mustTry: 'Must Try',
    ourSpecialties: 'Our Signature Specialties',
    chefHandsBehind: 'The Hands Behind the Flavor',
    meetChefAmara: 'Meet Chef Amara',
    yearsOfCraft: 'Years of Craft',
    chefBio1:
      'Growing up in the heart of Tamil Nadu, Amara learned the secret of perfectly fermented batter and the exact moment to toast mustard seeds from her grandmother.',
    chefBio2:
      "Every spice mix at Dakshin Delights is ground using traditional stone tools to preserve the essential oils and aroma that industrial processing loses. We don't just cook; we preserve a legacy.",
    chefName: 'Chef Amara Krishnan',
    chefTitle: 'Founder & Head Chef',
    customerStories: 'Customer Stories',
    loveLetters: 'Love Letters from Our Kitchen',
    testimonials: [
      {
        name: 'Ramesh K.',
        text: '"The Podi Dosa took me straight back to my childhood in Chennai. Truly authentic flavor profile!"',
      },
      {
        name: 'Priya S.',
        text: '"Fast delivery and the Sambar was still piping hot. The packing is very eco-friendly too."',
      },
      {
        name: 'Arun J.',
        text: '"Finally, a cloud kitchen that doesn\'t compromise on the quality of oil. Tastes just like home."',
      },
    ],
  },
  menu: {
    categories: 'Categories',
    all: 'All',
    breakfast: 'Breakfast',
    riceDishes: 'Rice Dishes',
    snacks: 'Snacks',
    desserts: 'Desserts',
    refineSearch: 'Refine Search',
    dietary: 'Dietary',
    vegetarianOnly: 'Vegetarian Only',
    nonVegetarian: 'Non-Vegetarian',
    spiceLevel: 'Spice Level',
    mild: 'Mild',
    medium: 'Medium',
    spicy: 'Spicy',
    clearAllFilters: 'Clear all filters',
    authenticMenu: 'Authentic',
    menuLabel: 'Menu',
    menuSubtitle: 'Traditional recipes from the heart of Tamil Nadu and Kerala',
    itemsFound: (n: number) => `${n} item${n !== 1 ? 's' : ''} found`,
    noItems: 'No dishes found',
    noItemsDesc: "Try adjusting your filters to find what you're looking for.",
    error: 'Something went wrong',
    tryAgain: 'Try Again',
    clearFilters: 'Clear Filters',
  },
  menuCard: {
    addToCart: 'Add to Cart',
    veg: 'VEG',
    nonVeg: 'NON-VEG',
  },
  checkout: {
    title: 'Checkout',
    emptyTitle: 'Your cart is empty',
    emptyDesc: 'Add some delicious items from our menu!',
    browseMenu: 'Browse Menu',
    contact: 'Contact',
    address: 'Address',
    payment: 'Payment',
    contactDetails: 'Contact Details',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    phoneNumber: 'Phone Number',
    deliveryAddress: 'Delivery Address',
    selectAddress: 'Select delivery address',
    paymentMethod: 'Payment Method',
    selectPayment: 'Select payment method',
    creditDebitCard: 'Credit or Debit Card',
    upi: 'UPI (PhonePe, GPay)',
    cashOnDelivery: 'Cash on Delivery',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    taxes: 'Taxes (5%)',
    grandTotal: 'Grand Total',
    placeOrder: 'PLACE ORDER',
    placingOrder: 'PLACING ORDER...',
    remove: 'Remove',
    home: 'Home',
    work: 'Work',
  },
  footer: {
    description:
      'Bringing the essence of South Indian kitchens to your home. Pure, authentic, and soulful.',
    quickLinks: 'Quick Links',
    fullMenu: 'Full Menu',
    trackOrder: 'Track Order',
    aiStudio: 'AI Studio',
    operatingHours: 'Operating Hours',
    monFri: 'Mon - Fri',
    satSun: 'Sat - Sun',
    findUs: 'Find Us',
    address: '12th Main, Indiranagar, Bangalore',
    copyright: '© 2024 Dakshin Delights Cloud Kitchen. All rights reserved.',
    terms: 'Terms',
    cookies: 'Cookies',
  },
  langToggle: 'தமிழ்',
};

export type Translations = typeof en;

const ta: Translations = {
  skipToContent: 'முக்கிய உள்ளடக்கத்திற்கு செல்',
  loading: 'ஏற்றுகிறது...',
  nav: {
    home: 'முகப்பு',
    menu: 'மெனு',
    myOrders: 'என் ஆர்டர்கள்',
    studio: 'ஸ்டுடியோ',
    theme: 'தீம்',
    openMenu: 'மெனுவை திற',
    closeMenu: 'மெனுவை மூடு',
    cart: 'கார்ட்',
  },
  home: {
    heroBadge: 'உண்மையான தென்னிந்திய',
    heroTitle: 'வாழை இலையில் பரிமாறும்',
    heroTitleHighlight: 'மரபு',
    heroDesc:
      'சமையல்காரர் அமரா உருவாக்கிய வீட்டு சமையல் வழிமுறைகளின் பணக்கார பாரம்பரியத்தை அனுபவியுங்கள். கல்லில் அரைத்த மசாலாக்கள், புளிக்க வைத்த மாவுகள், மற்றும் அன்புடன் உங்கள் வீட்டு வாசலில் டெலிவரி.',
    viewFullMenu: 'முழு மெனுவைப் பார்க்க',
    exploreStory: 'எங்கள் கதையை ஆராயுங்கள்',
    offerTitle: '2 தோசை வாங்கினால், 1 ஃபில்டர் காபி',
    offerTitleHighlight: 'இலவசம்!',
    offerDesc: 'இன்று சிறந்த தென்னிந்திய காலை உணவு கலவையை அனுபவியுங்கள்.',
    orderNow: 'இப்போதே ஆர்டர் செய்க',
    mustTry: 'கட்டாயம் சாப்பிட வேண்டியது',
    ourSpecialties: 'எங்கள் சிறப்பு உணவுகள்',
    chefHandsBehind: 'சுவையின் பின்னால் உள்ள கரங்கள்',
    meetChefAmara: 'சமையல்காரர் அமராவை சந்தியுங்கள்',
    yearsOfCraft: 'ஆண்டுகள் திறமை',
    chefBio1:
      'தமிழ்நாட்டின் நெஞ்சத்தில் வளர்ந்த அமரா, நன்கு புளிக்க வைத்த மாவின் ரகசியத்தையும், கடுகு வேகவைக்க சரியான தருணத்தையும் தன் பாட்டியிடமிருந்து கற்றுக்கொண்டார்.',
    chefBio2:
      'தக்ஷிண் டிலைட்ஸில் ஒவ்வொரு மசாலா கலவையும் பாரம்பரிய கல் கருவிகளைப் பயன்படுத்தி அரைக்கப்படுகிறது — தொழில்துறை செயலாக்கம் இழக்கும் அத்தியாவசிய எண்ணெய்கள் மற்றும் வாசனையை பாதுகாக்க. நாங்கள் சமைக்கவில்லை; நாங்கள் ஒரு மரபைப் பாதுகாக்கிறோம்.',
    chefName: 'சமையல்காரர் அமரா கிருஷ்ணன்',
    chefTitle: 'நிறுவனர் & தலைமை சமையல்காரர்',
    customerStories: 'வாடிக்கையாளர் கதைகள்',
    loveLetters: 'எங்கள் சமையலறையிலிருந்து அன்பு கடிதங்கள்',
    testimonials: [
      {
        name: 'ரமேஷ் க.',
        text: '"போடி தோசை என்னை நேரடியாக சென்னையில் என் குழந்தைப் பருவத்திற்கு அழைத்துச் சென்றது. உண்மையிலேயே உண்மையான சுவை!"',
      },
      {
        name: 'பிரியா ஸ்.',
        text: '"வேகமான டெலிவரி மற்றும் சாம்பார் இன்னும் சூடாக இருந்தது. பேக்கிங் மிகவும் சுற்றுச்சூழல் நட்பாக உள்ளது."',
      },
      {
        name: 'அருண் ஜ.',
        text: '"இறுதியாக, எண்ணெய் தரத்தில் சமரசம் செய்யாத ஒரு கிளவுட் கிட்சன். வீட்டில் சாப்பிடுவது போல் சுவைக்கிறது."',
      },
    ],
  },
  menu: {
    categories: 'வகைகள்',
    all: 'அனைத்தும்',
    breakfast: 'காலை உணவு',
    riceDishes: 'அரிசி உணவுகள்',
    snacks: 'சிற்றுண்டி',
    desserts: 'இனிப்புகள்',
    refineSearch: 'தேடலை சுத்தப்படுத்து',
    dietary: 'உணவு முறை',
    vegetarianOnly: 'சைவம் மட்டும்',
    nonVegetarian: 'அசைவம்',
    spiceLevel: 'காரத்தன்மை',
    mild: 'மிதமான',
    medium: 'நடுத்தர',
    spicy: 'காரமான',
    clearAllFilters: 'அனைத்து வடிகட்டிகளையும் அழி',
    authenticMenu: 'உண்மையான',
    menuLabel: 'மெனு',
    menuSubtitle:
      'தமிழ்நாடு மற்றும் கேரளாவின் நெஞ்சத்தில் இருந்து வரும் பாரம்பரிய சமையல் வழிமுறைகள்',
    itemsFound: (n: number) => `${n} பொருட்கள் கண்டுபிடிக்கப்பட்டன`,
    noItems: 'உணவுகள் இல்லை',
    noItemsDesc: 'நீங்கள் தேடுவதை கண்டுபிடிக்க உங்கள் வடிகட்டிகளை சரிசெய்யவும்.',
    error: 'ஏதோ தவறாகிவிட்டது',
    tryAgain: 'மீண்டும் முயற்சி செய்க',
    clearFilters: 'வடிகட்டிகளை அழி',
  },
  menuCard: {
    addToCart: 'கார்ட்டில் சேர்',
    veg: 'சைவம்',
    nonVeg: 'அசைவம்',
  },
  checkout: {
    title: 'செக்அவுட்',
    emptyTitle: 'உங்கள் கார்ட் காலியாக உள்ளது',
    emptyDesc: 'எங்கள் மெனுவிலிருந்து சில சுவையான பொருட்களைச் சேர்க்கவும்!',
    browseMenu: 'மெனுவை உலாவு',
    contact: 'தொடர்பு',
    address: 'முகவரி',
    payment: 'கட்டணம்',
    contactDetails: 'தொடர்பு விவரங்கள்',
    fullName: 'முழு பெயர்',
    fullNamePlaceholder: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    phoneNumber: 'தொலைபேசி எண்',
    deliveryAddress: 'டெலிவரி முகவரி',
    selectAddress: 'டெலிவரி முகவரியை தேர்ந்தெடுக்கவும்',
    paymentMethod: 'கட்டண முறை',
    selectPayment: 'கட்டண முறையை தேர்ந்தெடுக்கவும்',
    creditDebitCard: 'கிரெடிட் அல்லது டெபிட் கார்டு',
    upi: 'UPI (PhonePe, GPay)',
    cashOnDelivery: 'டெலிவரியில் பணம் செலுத்துக',
    orderSummary: 'ஆர்டர் சுருக்கம்',
    subtotal: 'துணை மொத்தம்',
    taxes: 'வரிகள் (5%)',
    grandTotal: 'மொத்தத் தொகை',
    placeOrder: 'ஆர்டர் செய்க',
    placingOrder: 'ஆர்டர் செய்கிறது...',
    remove: 'அகற்று',
    home: 'வீடு',
    work: 'அலுவலகம்',
  },
  footer: {
    description:
      'தென்னிந்திய சமையலறைகளின் சாரத்தை உங்கள் வீட்டிற்கு கொண்டு வருகிறோம். தூய்மையான, உண்மையான மற்றும் ஆன்மீகமான.',
    quickLinks: 'விரைவு இணைப்புகள்',
    fullMenu: 'முழு மெனு',
    trackOrder: 'ஆர்டரை கண்காணி',
    aiStudio: 'AI ஸ்டுடியோ',
    operatingHours: 'செயல்பாட்டு நேரங்கள்',
    monFri: 'திங் - வெள்.',
    satSun: 'சனி - ஞாயி.',
    findUs: 'எங்களை கண்டுபிடி',
    address: '12வது மெயின், இந்திரா நகர், பெங்களூரு',
    copyright: '© 2024 தக்ஷிண் டிலைட்ஸ் கிளவுட் கிட்சன். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டுள்ளன.',
    terms: 'விதிமுறைகள்',
    cookies: 'குக்கீகள்',
  },
  langToggle: 'EN',
};

const translations: Record<Language, Translations> = { en, ta };

interface LanguageContextType {
  language: Language;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'ta' : 'en'));
  }, []);

  // Update document lang attribute and font for Tamil
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'ta') {
      document.body.classList.add('lang-ta');
    } else {
      document.body.classList.remove('lang-ta');
    }
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
