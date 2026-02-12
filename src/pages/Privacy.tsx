export default function Privacy() {
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
            Legal
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 42px)',
              color: '#0A0A0A',
              marginBottom: '16px'
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: '#999999' }}>
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8 }}>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', fontWeight: 600 }}>
              1. Information We Collect
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We collect information you provide directly to us, such as when you create an account,
              make a purchase, or contact us for support. This may include:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Name and contact information</li>
              <li style={{ marginBottom: '8px' }}>Billing and shipping address</li>
              <li style={{ marginBottom: '8px' }}>Payment information</li>
              <li style={{ marginBottom: '8px' }}>Order history and preferences</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', fontWeight: 600 }}>
              2. How We Use Your Information
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We use the information we collect to:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Process and fulfill your orders</li>
              <li style={{ marginBottom: '8px' }}>Communicate with you about your orders</li>
              <li style={{ marginBottom: '8px' }}>Send promotional communications (with your consent)</li>
              <li style={{ marginBottom: '8px' }}>Improve our products and services</li>
              <li style={{ marginBottom: '8px' }}>Comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', fontWeight: 600 }}>
              3. Information Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share your information with
              third-party service providers who assist us in operating our website, conducting
              our business, or serving our users, as long as those parties agree to keep this
              information confidential.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', fontWeight: 600 }}>
              4. Cookies
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website
              and hold certain information. You can instruct your browser to refuse all cookies
              or to indicate when a cookie is being sent.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', fontWeight: 600 }}>
              5. Data Security
            </h2>
            <p>
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', fontWeight: 600 }}>
              6. Your Rights
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Under GDPR, you have the right to:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Access your personal data</li>
              <li style={{ marginBottom: '8px' }}>Correct inaccurate data</li>
              <li style={{ marginBottom: '8px' }}>Request deletion of your data</li>
              <li style={{ marginBottom: '8px' }}>Object to processing of your data</li>
              <li style={{ marginBottom: '8px' }}>Data portability</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#0A0A0A', marginBottom: '16px', fontWeight: 600 }}>
              7. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:hello@dysnomia.art" style={{ color: '#FBBE63', textDecoration: 'none' }}>
                hello@dysnomia.art
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
