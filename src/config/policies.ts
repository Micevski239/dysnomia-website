// Returns/exchanges and shipping policy texts (client-supplied, Nov 2026).
// Single source for the /shipping page. Change the fee here only.
import type { Language } from '../context/LanguageContext';

export const SHIPPING_FEE_MKD = 150;
export const POLICY_EMAIL = 'contact_dysnomia@yahoo.com';

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  showEmail?: boolean;
}

export interface Policy {
  id: 'returns' | 'shipping';
  title: string;
  intro: string;
  sections: PolicySection[];
}

const fee = {
  en: `${SHIPPING_FEE_MKD} MKD`,
  mk: `${SHIPPING_FEE_MKD} денари`,
};

export const POLICIES: Record<Language, Policy[]> = {
  mk: [
    {
      id: 'returns',
      title: 'Политика за враќање и замена',
      intro:
        'Во Dysnomia Gallery се грижиме секој производ да биде внимателно подготвен и безбедно доставен до вас. Доколку не сте задоволни од купениот производ, можете да побарате негово враќање или замена во согласност со условите наведени подолу.',
      sections: [
        {
          heading: 'Враќање на производ',
          paragraphs: [
            'Доколку сакате да го вратите купениот производ, потребно е да нè контактирате во рок од 14 дена од денот на приемот на нарачката.',
            'По приемот и проверката на вратениот производ, ќе биде организиран поврат на уплатените средства. Бидејќи плаќањето се врши при достава, начинот на поврат на средствата ќе биде договорен со купувачот.',
          ],
        },
        {
          heading: 'Замена на производ',
          paragraphs: [
            'Доколку сакате да го замените купениот производ, можете да изберете друг производ од нашата колекција. За замена потребно е да нè контактирате во рок од 14 дена од приемот на нарачката.',
            'Доколку новиот производ има повисока или пониска цена, разликата ќе биде соодветно пресметана.',
          ],
        },
        {
          heading: 'Состојба на производот',
          paragraphs: [
            'Производот треба да биде вратен неоштетен, некористен и, доколку е можно, во оригиналната амбалажа. При враќање или замена, производот треба да биде соодветно спакуван за да се избегнат оштетувања при транспортот.',
          ],
        },
        {
          heading: 'Трошоци за враќање и замена',
          paragraphs: [
            'Трошоците за испорака при враќање или замена се на товар на купувачот, освен во случаи кога производот е доставен со оштетување или дефект. Во таков случај, трошоците ги покрива Dysnomia Gallery.',
          ],
        },
        {
          heading: 'Време на обработка и испорака',
          paragraphs: [
            'Сите производи се изработуваат по нарачка и внимателно се подготвуваат пред испорака. За подготовка на нарачката се потребни 2–4 работни дена.',
            `Доставата се врши на територијата на Македонија, а цената за достава изнесува ${fee.mk}.`,
            'Плаќањето се врши при приемот на нарачката, односно при самата достава.',
            'За време на празници или промотивни периоди, времето на подготовка може да биде малку подолго. Доколку дојде до промена, купувачот ќе биде навремено известен.',
          ],
        },
        {
          heading: 'Контакт за рекламации',
          paragraphs: ['За прашања поврзани со враќање, замена или оштетен производ, контактирајте нè преку:'],
          showEmail: true,
        },
      ],
    },
    {
      id: 'shipping',
      title: 'Политика за испорака',
      intro:
        'Dysnomia Gallery овозможува испорака на нарачки низ цела Македонија, како и во странство, преку курирски служби. Нарачаните производи се испраќаат на адресата наведена при купувањето.',
      sections: [
        {
          heading: 'Рок на испорака',
          paragraphs: [
            'Рокот на испорака во Македонија изнесува од 3 до 7 работни дена од потврдата на нарачката.',
            'За меѓународна испорака, рокот зависи од земјата на примачот и условите на курирската служба.',
          ],
        },
        {
          heading: 'Цена на испорака',
          paragraphs: [
            `Цената на испорака во Македонија изнесува ${fee.mk} за секоја нарачка.`,
            'За испорака надвор од Македонија, цената се одредува во зависност од земјата и адресата на примачот. Купувачот ќе биде информиран за трошоците пред потврдување на нарачката.',
          ],
        },
        {
          heading: 'Начин на достава',
          paragraphs: [
            'Доставата на нарачките се врши преку курирска служба, на адресата наведена при купувањето.',
            'Купувачот е одговорен да остави точни податоци за достава, вклучувајќи име и презиме, адреса и телефонски број.',
          ],
        },
        {
          heading: 'Начин на плаќање',
          paragraphs: [
            'За нарачки во Македонија, плаќањето се врши при приемот на производот, односно при самата достава.',
            'За меѓународни нарачки, начинот на плаќање се договара дополнително.',
          ],
        },
        {
          heading: 'Прием на нарачката',
          paragraphs: [
            'При приемот на пратката, препорачуваме да ја проверите состојбата на амбалажата и производот. Доколку забележите оштетување, известете ја курирската служба и контактирајте нè.',
          ],
        },
        {
          heading: 'Контакт',
          paragraphs: ['За дополнителни информации во врска со испораката и доставата, можете да нè контактирате преку:'],
          showEmail: true,
        },
      ],
    },
  ],
  en: [
    {
      id: 'returns',
      title: 'Returns and Exchanges Policy',
      intro:
        'At Dysnomia Gallery, we make sure every product is carefully prepared and safely delivered to you. If you are not satisfied with your purchase, you may request a return or exchange in accordance with the terms outlined below.',
      sections: [
        {
          heading: 'Product returns',
          paragraphs: [
            'If you wish to return a purchased product, you must contact us within 14 days of receiving your order.',
            'Once the returned product has been received and inspected, a refund of the amount paid will be arranged. Since payment is made upon delivery, the refund method will be agreed upon with the customer.',
          ],
        },
        {
          heading: 'Product exchanges',
          paragraphs: [
            'If you wish to exchange a purchased product, you may choose another product from our collection. To request an exchange, you must contact us within 14 days of receiving your order.',
            'If the replacement product has a higher or lower price, the price difference will be calculated accordingly.',
          ],
        },
        {
          heading: 'Product condition',
          paragraphs: [
            'The product should be returned undamaged, unused, and where possible, in its original packaging. When returning or exchanging a product, it must be properly packaged to prevent damage during transport.',
          ],
        },
        {
          heading: 'Return and exchange shipping costs',
          paragraphs: [
            'Shipping costs for returns or exchanges are the responsibility of the customer, except when a product is delivered damaged or defective. In such cases, Dysnomia Gallery will cover the shipping costs.',
          ],
        },
        {
          heading: 'Order processing and delivery time',
          paragraphs: [
            'All products are made to order and carefully prepared before dispatch. Order preparation takes 2–4 business days.',
            `Delivery is available throughout North Macedonia, with a delivery fee of ${fee.en}.`,
            'Payment is made upon receipt of the order, at the time of delivery.',
            'During holidays or promotional periods, preparation times may be slightly longer. Customers will be notified in advance if any delays occur.',
          ],
        },
        {
          heading: 'Contact for complaints and returns',
          paragraphs: ['For questions regarding returns, exchanges, or damaged products, please contact us at:'],
          showEmail: true,
        },
      ],
    },
    {
      id: 'shipping',
      title: 'Shipping Policy',
      intro:
        'Dysnomia Gallery offers shipping throughout North Macedonia and internationally through courier services. All orders are shipped to the address provided at checkout.',
      sections: [
        {
          heading: 'Shipping time',
          paragraphs: [
            'The estimated shipping time within North Macedonia is 3 to 7 business days from order confirmation.',
            'For international orders, shipping times depend on the destination country and the courier service.',
          ],
        },
        {
          heading: 'Shipping cost',
          paragraphs: [
            `The shipping fee within North Macedonia is ${fee.en} per order.`,
            'For international shipping, the cost depends on the destination country and delivery address. Customers will be informed of the shipping cost before their order is confirmed.',
          ],
        },
        {
          heading: 'Delivery method',
          paragraphs: [
            'Orders are delivered through courier services to the address provided at checkout.',
            'Customers are responsible for providing accurate delivery details, including their full name, address, and phone number.',
          ],
        },
        {
          heading: 'Payment method',
          paragraphs: [
            'For orders within North Macedonia, payment is made upon receipt of the product, at the time of delivery.',
            'For international orders, the payment method will be arranged separately.',
          ],
        },
        {
          heading: 'Receiving your order',
          paragraphs: [
            'Upon receiving your package, we recommend checking the condition of the packaging and the product. If you notice any damage, please notify the courier service and contact us.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: ['For further information regarding shipping and delivery, please contact us at:'],
          showEmail: true,
        },
      ],
    },
  ],
};
