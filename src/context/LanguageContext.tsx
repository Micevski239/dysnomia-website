import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

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
  },
  mk: {
    common: {
      home: 'Дома',
      shop: 'Продавница',
      collections: 'Колекции',
      newArrivals: 'Нови Производи',
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

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const parts = key.split('.');
    if (parts.length !== 2) return key;

    const [namespace, translationKey] = parts;
    const namespaceTranslations = translations[language]?.[namespace];

    if (!namespaceTranslations) return key;
    return namespaceTranslations[translationKey] ?? key;
  };

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
