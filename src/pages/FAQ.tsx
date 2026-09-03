import { useState } from 'react';

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping takes 5-7 business days within Europe. Express shipping is available for 2-3 business days delivery.'
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to most countries worldwide. International shipping typically takes 7-14 business days depending on the destination.'
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order ships, you will receive an email with a tracking number. You can also track your order in your account dashboard.'
      }
    ]
  },
  {
    category: 'Products',
    questions: [
      {
        q: 'What print types do you offer?',
        a: 'We offer three print options: Canvas prints (stretched on wooden frame), Rolled prints (unframed), and Framed prints (with premium wooden frame).'
      },
      {
        q: 'What sizes are available?',
        a: 'Our artworks are available in multiple sizes: 50x70 cm, 60x90 cm, 70x100 cm, 80x120 cm, and 100x150 cm.'
      },
      {
        q: 'What materials do you use?',
        a: 'We use premium archival-quality canvas, museum-grade papers, and sustainably sourced wooden frames. All prints are made with fade-resistant inks.'
      }
    ]
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 30 days of delivery for unused items in original packaging. Custom or personalized items cannot be returned.'
      },
      {
        q: 'How do I request a refund?',
        a: 'Contact us at contact_dysnomia@yahoo.com with your order number. Once we receive and inspect the returned item, we will process your refund within 5-7 business days.'
      },
      {
        q: 'What if my order arrives damaged?',
        a: 'If your artwork arrives damaged, please contact us within 48 hours with photos of the damage. We will send a replacement at no additional cost.'
      }
    ]
  },
  {
    category: 'Account & Payment',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for orders within Europe.'
      },
      {
        q: 'Do I need an account to order?',
        a: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save favorites, and enjoy a faster checkout experience.'
      }
    ]
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '120px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '12px'
            }}
          >
            Help Center
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 42px)',
              color: '#0A0A0A',
              marginBottom: '16px'
            }}
          >
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '16px', color: '#666666', lineHeight: 1.7 }}>
            Find answers to common questions about orders, shipping, and more.
          </p>
        </div>

        {/* FAQ Categories */}
        {faqs.map((category) => (
          <div key={category.category} style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid #E5E5E5'
              }}
            >
              {category.category}
            </h2>
            {category.questions.map((item, index) => {
              const itemId = `${category.category}-${index}`;
              const isOpen = openItems.includes(itemId);
              return (
                <div
                  key={itemId}
                  style={{
                    borderBottom: '1px solid #E5E5E5',
                    marginBottom: '0'
                  }}
                >
                  <button
                    onClick={() => toggleItem(itemId)}
                    style={{
                      width: '100%',
                      padding: '20px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#0A0A0A', fontWeight: 500 }}>
                      {item.q}
                    </span>
                    <span
                      style={{
                        fontSize: '20px',
                        color: '#FBBE63',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 0 20px',
                        fontSize: '15px',
                        color: '#666666',
                        lineHeight: 1.7
                      }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Contact CTA */}
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#FAFAFA',
            border: '1px solid #E5E5E5',
            marginTop: '48px'
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              color: '#0A0A0A',
              marginBottom: '12px'
            }}
          >
            Still have questions?
          </h3>
          <p style={{ fontSize: '15px', color: '#666666', marginBottom: '20px' }}>
            Our support team is here to help.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FBBE63')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
