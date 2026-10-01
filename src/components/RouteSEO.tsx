import { useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import SEO from './SEO';

interface LocalizedText {
  en: string;
  mk: string;
}

interface RouteMeta {
  title: LocalizedText;
  description: LocalizedText;
  /** Canonical path override — used to point duplicate routes at their primary URL. */
  canonical?: string;
  noindex?: boolean;
}

const HOME_META: RouteMeta = {
  title: {
    en: 'Canvas Prints & Framed Wall Art in Macedonia',
    mk: 'Канвас слики и врамени постери за вашиот дом',
  },
  description: {
    en: 'Shop unique canvas prints, rolled canvas and framed wall art from Dysnomia Art Gallery. Sizes from 50×70 to 100×150 cm with fast delivery across Macedonia.',
    mk: 'Купете уникатни канвас слики, платна во ролна и врамени постери од Dysnomia Art Gallery. Големини од 50×70 до 100×150 см со брза достава низ Македонија.',
  },
};

const ROUTE_META: Record<string, RouteMeta> = {
  '/': HOME_META,
  // These routes currently render the same home page — canonical them to "/"
  // so they don't compete with it in search results.
  '/posters': { ...HOME_META, canonical: '/' },
  '/frames': { ...HOME_META, canonical: '/' },
  '/inspiration': { ...HOME_META, canonical: '/' },
  '/business': { ...HOME_META, canonical: '/' },
  '/artists': { ...HOME_META, canonical: '/' },
  '/stories': { ...HOME_META, canonical: '/' },
  '/shop': {
    title: { en: 'Shop All Wall Art', mk: 'Продавница — сите слики' },
    description: {
      en: 'Browse the full Dysnomia collection of canvas prints and framed wall art. Filter by style and find the perfect artwork for your living room, bedroom or office.',
      mk: 'Разгледајте ја целата колекција на канвас слики и врамени постери на Dysnomia. Пронајдете го совршеното уметничко дело за дневна соба, спална или канцеларија.',
    },
  },
  '/collections': {
    title: { en: 'Art Collections', mk: 'Колекции на слики' },
    description: {
      en: 'Explore curated art collections from Dysnomia Art Gallery — themed selections of canvas prints for every room and interior style.',
      mk: 'Истражете ги курираните колекции на Dysnomia Art Gallery — тематски избори на канвас слики за секоја просторија и стил на ентериер.',
    },
  },
  '/new-arrivals': {
    title: { en: 'New Arrivals', mk: 'Нови модели' },
    description: {
      en: 'The newest canvas prints and wall art at Dysnomia Art Gallery. Be the first to discover our latest artworks.',
      mk: 'Најновите канвас слики и ѕидна уметност во Dysnomia Art Gallery. Бидете први што ќе ги откриете нашите најнови дела.',
    },
  },
  '/kids-pictures': {
    title: { en: 'Kids Room Wall Art', mk: 'Слики за детска соба' },
    description: {
      en: 'Playful canvas prints and wall art for kids rooms. Bring colour and imagination to your child’s space with Dysnomia artworks.',
      mk: 'Разиграни канвас слики за детски соби. Внесете боја и имагинација во просторот на вашето дете со делата на Dysnomia.',
    },
  },
  '/top-sellers': {
    title: { en: 'Top Sellers', mk: 'Најпродавани слики' },
    description: {
      en: 'Our most popular canvas prints and framed artworks — the pieces customers across Macedonia love the most.',
      mk: 'Нашите најпопуларни канвас слики и врамени дела — парчињата што купувачите низ Македонија најмногу ги сакаат.',
    },
  },
  '/about': {
    title: { en: 'About Us', mk: 'За нас' },
    description: {
      en: 'The story behind Dysnomia Art Gallery — unique artworks crafted with care, style and sustainability in mind.',
      mk: 'Приказната зад Dysnomia Art Gallery — уникатни уметнички дела изработени со грижа, стил и одржливост.',
    },
  },
  '/blog': {
    title: { en: 'Blog — Wall Art & Interior Ideas', mk: 'Блог — идеи за ентериер и ѕидна уметност' },
    description: {
      en: 'Interior styling tips, wall art guides and inspiration from Dysnomia Art Gallery.',
      mk: 'Совети за уредување на ентериер, водичи за ѕидна уметност и инспирација од Dysnomia Art Gallery.',
    },
  },
  '/contact': {
    title: { en: 'Contact Us', mk: 'Контакт' },
    description: {
      en: 'Get in touch with Dysnomia Art Gallery — questions about artworks, orders or custom requests.',
      mk: 'Контактирајте ја Dysnomia Art Gallery — прашања за уметнички дела, нарачки или посебни барања.',
    },
  },
  '/shipping': {
    title: { en: 'Shipping & Returns', mk: 'Достава и враќање' },
    description: {
      en: 'Shipping times, delivery costs and the return policy for Dysnomia Art Gallery orders across Macedonia.',
      mk: 'Време на достава, трошоци за испорака и политика за враќање на нарачките од Dysnomia Art Gallery низ Македонија.',
    },
  },
  '/faq': {
    title: { en: 'Frequently Asked Questions', mk: 'Често поставувани прашања' },
    description: {
      en: 'Answers about orders, shipping, print types, sizes and returns at Dysnomia Art Gallery.',
      mk: 'Одговори за нарачки, достава, видови печат, големини и враќање кај Dysnomia Art Gallery.',
    },
  },
  '/privacy': {
    title: { en: 'Privacy Policy', mk: 'Политика за приватност' },
    description: {
      en: 'How Dysnomia Art Gallery collects, uses and protects your personal data.',
      mk: 'Како Dysnomia Art Gallery ги собира, користи и заштитува вашите лични податоци.',
    },
  },
  // Transactional / private pages — kept out of search results.
  '/unsubscribe': {
    title: { en: 'Unsubscribe', mk: 'Одјава' },
    description: HOME_META.description,
    noindex: true,
  },
  '/cart': {
    title: { en: 'Shopping Cart', mk: 'Кошничка' },
    description: HOME_META.description,
    noindex: true,
  },
  '/checkout': {
    title: { en: 'Checkout', mk: 'Плаќање' },
    description: HOME_META.description,
    noindex: true,
  },
  '/login': {
    title: { en: 'Sign In', mk: 'Најава' },
    description: HOME_META.description,
    noindex: true,
  },
  '/register': {
    title: { en: 'Create Account', mk: 'Регистрација' },
    description: HOME_META.description,
    noindex: true,
  },
  '/account': {
    title: { en: 'My Account', mk: 'Мој профил' },
    description: HOME_META.description,
    noindex: true,
  },
  '/account/orders': {
    title: { en: 'My Orders', mk: 'Мои нарачки' },
    description: HOME_META.description,
    noindex: true,
  },
  '/account/wishlist': {
    title: { en: 'My Wishlist', mk: 'Листа на желби' },
    description: HOME_META.description,
    noindex: true,
  },
  '/account/settings': {
    title: { en: 'Account Settings', mk: 'Поставки' },
    description: HOME_META.description,
    noindex: true,
  },
};

// Routes whose pages render their own <SEO> with fetched data.
const DYNAMIC_ROUTE_PATTERN = /^\/(artwork|collections|blog)\/./;

export default function RouteSEO() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  if (DYNAMIC_ROUTE_PATTERN.test(pathname)) return null;

  if (pathname.startsWith('/order-confirmation')) {
    return (
      <SEO
        title={language === 'mk' ? 'Потврда за нарачка' : 'Order Confirmation'}
        noindex
      />
    );
  }

  const normalized = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const meta = ROUTE_META[normalized];

  if (!meta) {
    return (
      <SEO
        title={language === 'mk' ? 'Страницата не е пронајдена' : 'Page Not Found'}
        noindex
      />
    );
  }

  const lang = language === 'mk' ? 'mk' : 'en';
  return (
    <SEO
      title={meta.title[lang]}
      description={meta.description[lang]}
      path={meta.canonical ?? normalized}
      noindex={meta.noindex}
    />
  );
}
