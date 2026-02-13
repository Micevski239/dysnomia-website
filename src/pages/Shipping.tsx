export default function Shipping() {
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
            Information
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 42px)',
              color: '#0A0A0A',
              marginBottom: '16px'
            }}
          >
            Shipping & Delivery
          </h1>
          <p style={{ fontSize: '16px', color: '#666666', lineHeight: 1.7 }}>
            Everything you need to know about shipping and delivery.
          </p>
        </div>

        {/* Shipping Options */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E5E5'
            }}
          >
            Shipping Options
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div
              style={{
                padding: '24px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E5E5E5'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', color: '#0A0A0A', fontWeight: 600 }}>Standard Shipping</h3>
                <span style={{ fontSize: '14px', color: '#FBBE63', fontWeight: 600 }}>FREE</span>
              </div>
              <p style={{ fontSize: '14px', color: '#666666' }}>5-7 business days • Orders over 50 EUR</p>
            </div>
            <div
              style={{
                padding: '24px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E5E5E5'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', color: '#0A0A0A', fontWeight: 600 }}>Express Shipping</h3>
                <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 600 }}>15 EUR</span>
              </div>
              <p style={{ fontSize: '14px', color: '#666666' }}>2-3 business days • All orders</p>
            </div>
            <div
              style={{
                padding: '24px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E5E5E5'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', color: '#0A0A0A', fontWeight: 600 }}>International Shipping</h3>
                <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 600 }}>From 25 EUR</span>
              </div>
              <p style={{ fontSize: '14px', color: '#666666' }}>7-14 business days • Worldwide delivery</p>
            </div>
          </div>
        </section>

        {/* Processing Time */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E5E5'
            }}
          >
            Processing Time
          </h2>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8, marginBottom: '16px' }}>
            All artworks are made-to-order and carefully crafted just for you. Please allow 2-4 business days
            for your order to be prepared before shipping.
          </p>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8 }}>
            During peak seasons or promotions, processing times may be slightly longer. We'll keep you
            updated via email.
          </p>
        </section>

        {/* Tracking */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E5E5'
            }}
          >
            Order Tracking
          </h2>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8 }}>
            Once your order ships, you'll receive an email with a tracking number. You can also track
            your order anytime by logging into your account and viewing your order history.
          </p>
        </section>

        {/* Returns */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E5E5'
            }}
          >
            Returns & Exchanges
          </h2>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8, marginBottom: '16px' }}>
            We want you to love your artwork. If you're not completely satisfied, you can return unused
            items within 30 days of delivery for a full refund.
          </p>
          <ul style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8, paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>Items must be unused and in original packaging</li>
            <li style={{ marginBottom: '8px' }}>Custom or personalized items cannot be returned</li>
            <li style={{ marginBottom: '8px' }}>Refunds are processed within 5-7 business days</li>
            <li style={{ marginBottom: '8px' }}>Return shipping costs are the customer's responsibility</li>
          </ul>
        </section>

        {/* Damaged Items */}
        <section
          style={{
            padding: '32px',
            backgroundColor: '#FAFAFA',
            border: '1px solid #E5E5E5'
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
            Received a Damaged Item?
          </h3>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.7, marginBottom: '16px' }}>
            We carefully package every order, but if your artwork arrives damaged, please contact us
            within 48 hours with photos of the damage. We'll send a replacement at no extra cost.
          </p>
          <a
            href="mailto:contact_dysnomia@yahoo.com"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textDecoration: 'none'
            }}
          >
            Contact Support
          </a>
        </section>
      </div>
    </div>
  );
}
