import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'en' | 'mk';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LANGUAGE_STORAGE_KEY = 'dysnomia_language';
const DEFAULT_LANGUAGE: Language = 'en';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

// Translation files will be loaded here
const translations: Record<Language, Record<string, Record<string, string>>> = {
  en: {
    common: {
      home: 'Home',
      shop: 'Shop',
      collections: 'Collections',
      newArrivals: 'New Arrivals',
      topSellers: 'Top Sellers',
      aboutUs: 'About Us',
      about: 'About',
      cart: 'Cart',
      checkout: 'Checkout',
      wishlist: 'Wishlist',
      search: 'Search',
      account: 'Account',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      continueShopping: 'Continue Shopping',
      proceedToCheckout: 'Proceed to Checkout',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      required: 'Required',
      optional: 'Optional',
      viewAll: 'View all',
      pieces: 'pieces',
    },
    home: {
      // Hero
      tagline: 'Art • Design • Lifestyle',
      heroDescription: 'Where contemporary art meets modern living. Discover unique artworks and decorative pieces crafted with care, style, and sustainability.',
      exploreCollection: 'Explore Collection',
      ourStory: 'Our Story',
      scroll: 'Scroll',
      // USP Section
      whyChoose: 'Why Choose',
      contemporaryArt: 'Contemporary Art',
      contemporaryArtDesc: 'Curated collection of modern masterpieces',
      uniqueArtworks: 'Unique Artworks',
      uniqueArtworksDesc: 'One-of-a-kind pieces from talented artists',
      designAesthetics: 'Design & Aesthetics',
      designAestheticsDesc: 'Style that transforms your space',
      ecoFriendly: 'Eco-Friendly',
      ecoFriendlyDesc: 'Sustainable materials & production',
      homeDecor: 'Home Décor',
      homeDecorDesc: 'Decorative pieces for every room',
      // Gallery Tour
      exploreOurWorld: 'Explore Our World',
      galleryTour: 'Gallery',
      galleryTourAccent: 'Tour',
      galleryTourDesc: 'Discover our live collections sourced directly from the Dysnomia catalog.',
      featuredSeries: 'Featured Series',
      curatedSet: 'Curated Set',
      viewCollection: 'View Collection',
      viewAllCollections: 'View All Collections',
      collectionsEmpty: 'Curated collections will appear here once you create them.',
      // Brand Story
      ourStoryLabel: 'Our Story',
      aboutDysnomia: 'About Dysnomia',
      brandStoryP1: 'Dysnomia Art Gallery is a modern space where art, design, and lifestyle come together. We offer unique artworks and decorative pieces crafted with care, style, and high-quality materials.',
      brandStoryP2: 'With a focus on aesthetics, eco-friendly production, and original design, Dysnomia brings beauty and inspiration into every home. Our curated collection features everything from contemporary art to abstract pieces, each selected to transform your living spaces.',
      brandStoryP3: 'We believe that art should be accessible to everyone. That\'s why we work directly with talented artists from around the world, offering limited edition works and exclusive collaborations that you won\'t find anywhere else.',
      brandQuote: 'Where contemporary art meets modern living',
      brandSupport: 'Need assistance? Our support team is here to help you find the perfect pieces for your home or office.',
      // Product Carousel
      featuredArtworks: 'Featured Artworks',
      limitedEdition: 'Limited Edition',
      featuredEmpty: 'Featured artworks will appear here once you mark products as featured.',
      roomPreview: 'Room Preview',
    },
    product: {
      addToCart: 'Add to Cart',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      selectSize: 'Select Size',
      selectType: 'Select Print Type',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      sold: 'Sold',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      description: 'Description',
      details: 'Details',
      deliveryReturns: 'Delivery & Returns',
      support: 'Support',
      sizeGuide: 'Size Guide',
      productId: 'Product ID',
      originalArtwork: 'Original Artwork',
      clickToZoom: 'Click to zoom',
    },
    cart: {
      yourCart: 'Your Cart',
      emptyCart: 'Your cart is empty',
      emptyCartMessage: 'Looks like you haven\'t added anything to your cart yet.',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      shippingCalculated: 'Calculated at checkout',
      total: 'Total',
      removeItem: 'Remove item',
      updateQuantity: 'Update quantity',
    },
    checkout: {
      checkout: 'Checkout',
      contactInfo: 'Contact Information',
      shippingAddress: 'Shipping Address',
      orderNotes: 'Order Notes',
      paymentMethod: 'Payment Method',
      payOnDelivery: 'Pay on Delivery',
      payOnDeliveryDesc: 'Pay with cash when your order arrives',
      placeOrder: 'Place Order',
      orderSummary: 'Order Summary',
      email: 'Email',
      phone: 'Phone',
      fullName: 'Full Name',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal Code',
      country: 'Country',
      orderNotesPlaceholder: 'Notes about your order (optional)',
    },
    order: {
      orderConfirmation: 'Order Confirmation',
      thankYou: 'Thank you for your order!',
      orderNumber: 'Order Number',
      orderReceived: 'We\'ve received your order and will contact you shortly.',
      orderDetails: 'Order Details',
      status: 'Status',
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    },
    reviews: {
      reviews: 'Reviews',
      writeReview: 'Write a Review',
      noReviews: 'No reviews yet',
      beFirstToReview: 'Be the first to review this product',
      rating: 'Rating',
      reviewTitle: 'Review Title',
      reviewContent: 'Your Review',
      submitReview: 'Submit Review',
      thankYouReview: 'Thank you for your review!',
      reviewPending: 'Your review is pending approval.',
    },
    account: {
      myAccount: 'My Account',
      orderHistory: 'Order History',
      savedItems: 'Saved Items',
      settings: 'Settings',
      noOrders: 'You haven\'t placed any orders yet.',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      emailAddress: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: 'Don\'t have an account?',
    },
    topSellers: {
      title: 'Top Sellers',
      heroTitle: 'Customer',
      heroTitleAccent: 'Favorites',
      heroDescription: 'Discover our most loved artworks. These bestselling pieces have captured the hearts of art enthusiasts and transformed countless spaces into stunning galleries.',
      shopAll: 'Shop All',
      viewCollections: 'View Collections',
      featuredLabel: '#1 Bestseller',
      filterAll: 'All Top Sellers',
      filterUnder200: 'Under €200',
      filterUnder500: 'Under €500',
      filterPremium: 'Premium',
      artwork: 'artwork',
      artworks: 'artworks',
      noArtworks: 'No artworks found',
      noArtworksMessage: 'Try adjusting your filters to find what you\'re looking for.',
      clearFilters: 'Clear Filters',
      whyChooseUs: 'Why Choose Us',
      trustedByThousands: 'Trusted by Thousands',
      curatedSelection: 'Curated Selection',
      curatedSelectionDesc: 'Every piece is handpicked by our expert curators for quality and style.',
      freeShipping: 'Free Shipping',
      freeShippingDesc: 'Enjoy free delivery on all orders over €50 across Europe.',
      premiumQuality: 'Premium Quality',
      premiumQualityDesc: 'Gallery-grade prints on archival paper with museum-quality frames.',
    },
  },
  mk: {
    common: {
      home: 'Дома',
      shop: 'Продавница',
      collections: 'Колекции',
      newArrivals: 'Нови Производи',
      topSellers: 'Најпродавани',
      aboutUs: 'За Нас',
      about: 'За Нас',
      cart: 'Кошничка',
      checkout: 'Наплата',
      wishlist: 'Листа на Желби',
      search: 'Пребарај',
      account: 'Сметка',
      login: 'Најава',
      register: 'Регистрација',
      logout: 'Одјава',
      continueShopping: 'Продолжи со Купување',
      proceedToCheckout: 'Продолжи кон Наплата',
      loading: 'Се вчитува...',
      error: 'Грешка',
      success: 'Успешно',
      cancel: 'Откажи',
      save: 'Зачувај',
      delete: 'Избриши',
      edit: 'Уреди',
      view: 'Прегледај',
      close: 'Затвори',
      back: 'Назад',
      next: 'Следно',
      previous: 'Претходно',
      submit: 'Поднеси',
      required: 'Задолжително',
      optional: 'Опционално',
      viewAll: 'Прегледај сè',
      pieces: 'парчиња',
    },
    home: {
      // Hero
      tagline: 'Уметност • Дизајн • Животен Стил',
      heroDescription: 'Каде современата уметност се среќава со модерното живеење. Откријте уникатни уметнички дела и декоративни парчиња изработени со грижа, стил и одржливост.',
      exploreCollection: 'Истражи Колекција',
      ourStory: 'Нашата Приказна',
      scroll: 'Скролај',
      // USP Section
      whyChoose: 'Зошто Да Изберете',
      contemporaryArt: 'Современа Уметност',
      contemporaryArtDesc: 'Курирана колекција на модерни ремек-дела',
      uniqueArtworks: 'Уникатни Дела',
      uniqueArtworksDesc: 'Единствени парчиња од талентирани уметници',
      designAesthetics: 'Дизајн и Естетика',
      designAestheticsDesc: 'Стил што го трансформира вашиот простор',
      ecoFriendly: 'Еко-Пријателски',
      ecoFriendlyDesc: 'Одржливи материјали и производство',
      homeDecor: 'Домашен Декор',
      homeDecorDesc: 'Декоративни парчиња за секоја соба',
      // Gallery Tour
      exploreOurWorld: 'Истражете Го Нашиот Свет',
      galleryTour: 'Галериска',
      galleryTourAccent: 'Тура',
      galleryTourDesc: 'Откријте ги нашите живи колекции директно од каталогот на Dysnomia.',
      featuredSeries: 'Истакната Серија',
      curatedSet: 'Курирана Колекција',
      viewCollection: 'Прегледај Колекција',
      viewAllCollections: 'Прегледај Сите Колекции',
      collectionsEmpty: 'Курираните колекции ќе се појават тука откако ќе ги креирате.',
      // Brand Story
      ourStoryLabel: 'Нашата Приказна',
      aboutDysnomia: 'За Dysnomia',
      brandStoryP1: 'Dysnomia Art Gallery е модерен простор каде уметноста, дизајнот и животниот стил се спојуваат. Нудиме уникатни уметнички дела и декоративни парчиња изработени со грижа, стил и висококвалитетни материјали.',
      brandStoryP2: 'Со фокус на естетика, еко-пријателско производство и оригинален дизајн, Dysnomia носи убавина и инспирација во секој дом. Нашата курирана колекција вклучува сè од современа уметност до апстрактни дела, секое избрано да ги трансформира вашите животни простори.',
      brandStoryP3: 'Веруваме дека уметноста треба да биде достапна за сите. Затоа работиме директно со талентирани уметници од целиот свет, нудејќи лимитирани изданија и ексклузивни соработки што нема да ги најдете никаде на друго место.',
      brandQuote: 'Каде современата уметност се среќава со модерното живеење',
      brandSupport: 'Ви треба помош? Нашиот тим за поддршка е тука да ви помогне да ги најдете совршените парчиња за вашиот дом или канцеларија.',
      // Product Carousel
      featuredArtworks: 'Истакнати Дела',
      limitedEdition: 'Лимитирано Издание',
      featuredEmpty: 'Истакнатите уметнички дела ќе се појават тука откако ќе означите производи како истакнати.',
      roomPreview: 'Преглед во Соба',
    },
    product: {
      addToCart: 'Додај во Кошничка',
      addToWishlist: 'Додај во Листа на Желби',
      removeFromWishlist: 'Отстрани од Листа на Желби',
      selectSize: 'Избери Големина',
      selectType: 'Избери Тип на Печатење',
      inStock: 'На Залиха',
      outOfStock: 'Нема на Залиха',
      sold: 'Продадено',
      price: 'Цена',
      quantity: 'Количина',
      total: 'Вкупно',
      description: 'Опис',
      details: 'Детали',
      deliveryReturns: 'Достава и Враќање',
      support: 'Поддршка',
      sizeGuide: 'Водич за Големина',
      productId: 'ID на Производ',
      originalArtwork: 'Оригинално Уметничко Дело',
      clickToZoom: 'Кликни за зумирање',
    },
    cart: {
      yourCart: 'Твојата Кошничка',
      emptyCart: 'Твојата кошничка е празна',
      emptyCartMessage: 'Изгледа дека сè уште немаш додадено ништо во кошничката.',
      subtotal: 'Меѓузбир',
      shipping: 'Достава',
      shippingCalculated: 'Пресметано при наплата',
      total: 'Вкупно',
      removeItem: 'Отстрани производ',
      updateQuantity: 'Ажурирај количина',
    },
    checkout: {
      checkout: 'Наплата',
      contactInfo: 'Контакт Информации',
      shippingAddress: 'Адреса за Достава',
      orderNotes: 'Забелешки за Нарачката',
      paymentMethod: 'Начин на Плаќање',
      payOnDelivery: 'Плаќање при Достава',
      payOnDeliveryDesc: 'Плати во готово кога ќе пристигне нарачката',
      placeOrder: 'Направи Нарачка',
      orderSummary: 'Преглед на Нарачка',
      email: 'Е-пошта',
      phone: 'Телефон',
      fullName: 'Целосно Име',
      address: 'Адреса',
      city: 'Град',
      postalCode: 'Поштенски Код',
      country: 'Држава',
      orderNotesPlaceholder: 'Забелешки за нарачката (опционално)',
    },
    order: {
      orderConfirmation: 'Потврда на Нарачка',
      thankYou: 'Ви благодариме за нарачката!',
      orderNumber: 'Број на Нарачка',
      orderReceived: 'Ја примивме вашата нарачка и ќе ве контактираме наскоро.',
      orderDetails: 'Детали за Нарачка',
      status: 'Статус',
      pending: 'Во Обработка',
      confirmed: 'Потврдено',
      shipped: 'Испратено',
      delivered: 'Доставено',
      cancelled: 'Откажано',
    },
    reviews: {
      reviews: 'Рецензии',
      writeReview: 'Напиши Рецензија',
      noReviews: 'Сè уште нема рецензии',
      beFirstToReview: 'Биди прв што ќе остави рецензија за овој производ',
      rating: 'Оценка',
      reviewTitle: 'Наслов на Рецензија',
      reviewContent: 'Твојата Рецензија',
      submitReview: 'Поднеси Рецензија',
      thankYouReview: 'Ви благодариме за рецензијата!',
      reviewPending: 'Вашата рецензија чека одобрување.',
    },
    account: {
      myAccount: 'Моја Сметка',
      orderHistory: 'Историја на Нарачки',
      savedItems: 'Зачувани Производи',
      settings: 'Поставки',
      noOrders: 'Сè уште немате направено нарачки.',
    },
    auth: {
      signIn: 'Најави се',
      signUp: 'Регистрирај се',
      forgotPassword: 'Заборавена Лозинка?',
      resetPassword: 'Ресетирај Лозинка',
      emailAddress: 'Е-пошта',
      password: 'Лозинка',
      confirmPassword: 'Потврди Лозинка',
      createAccount: 'Креирај Сметка',
      alreadyHaveAccount: 'Веќе имаш сметка?',
      dontHaveAccount: 'Немаш сметка?',
    },
    topSellers: {
      title: 'Најпродавани',
      heroTitle: 'Омилени',
      heroTitleAccent: 'Производи',
      heroDescription: 'Откријте ги нашите најсакани уметнички дела. Овие бестселери ги освоија срцата на љубителите на уметноста и трансформираа безброј простори во прекрасни галерии.',
      shopAll: 'Купи Сè',
      viewCollections: 'Прегледај Колекции',
      featuredLabel: '#1 Бестселер',
      filterAll: 'Сите Најпродавани',
      filterUnder200: 'Под €200',
      filterUnder500: 'Под €500',
      filterPremium: 'Премиум',
      artwork: 'уметничко дело',
      artworks: 'уметнички дела',
      noArtworks: 'Не се пронајдени уметнички дела',
      noArtworksMessage: 'Пробајте да ги прилагодите филтрите за да го најдете тоа што го барате.',
      clearFilters: 'Исчисти Филтри',
      whyChooseUs: 'Зошто Ние',
      trustedByThousands: 'Доверба од Илјадници',
      curatedSelection: 'Курирана Селекција',
      curatedSelectionDesc: 'Секое парче е рачно избрано од нашите експерти куратори за квалитет и стил.',
      freeShipping: 'Бесплатна Достава',
      freeShippingDesc: 'Уживајте во бесплатна достава за сите нарачки над €50 низ Европа.',
      premiumQuality: 'Премиум Квалитет',
      premiumQualityDesc: 'Галериски печатења на архивска хартија со рамки од музејски квалитет.',
    },
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'mk') return stored;
      return DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const parts = key.split('.');
    if (parts.length !== 2) return key;

    const [namespace, translationKey] = parts;
    const namespaceTranslations = translations[language]?.[namespace];

    if (!namespaceTranslations) return key;
    return namespaceTranslations[translationKey] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
