import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form:', formData);
    setSubmitted(true);
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
            Get in Touch
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 42px)',
              color: '#0A0A0A',
              marginBottom: '16px'
            }}
          >
            Contact Us
          </h1>
          <p style={{ fontSize: '16px', color: '#666666', lineHeight: 1.7 }}>
            Have a question or need assistance? We're here to help.
          </p>
        </div>

        {/* Contact Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '48px',
            padding: '32px',
            backgroundColor: '#FAFAFA',
            border: '1px solid #E5E5E5'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#0A0A0A', marginBottom: '8px' }}>
              Email
            </h3>
            <a
              href="mailto:hello@dysnomia.art"
              style={{ fontSize: '15px', color: '#666666', textDecoration: 'none' }}
            >
              hello@dysnomia.art
            </a>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#0A0A0A', marginBottom: '8px' }}>
              Response Time
            </h3>
            <p style={{ fontSize: '15px', color: '#666666' }}>Within 24 hours</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#0A0A0A', marginBottom: '8px' }}>
              Follow Us
            </h3>
            <p style={{ fontSize: '15px', color: '#666666' }}>@dysnomia.art</p>
          </div>
        </div>

        {/* Contact Form */}
        {submitted ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E5E5'
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#0A0A0A',
                marginBottom: '12px'
              }}
            >
              Thank You!
            </h2>
            <p style={{ fontSize: '15px', color: '#666666' }}>
              We've received your message and will get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#0A0A0A',
                  marginBottom: '8px'
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  border: '1px solid #E5E5E5',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#0A0A0A',
                  marginBottom: '8px'
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  border: '1px solid #E5E5E5',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#0A0A0A',
                  marginBottom: '8px'
                }}
              >
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  border: '1px solid #E5E5E5',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px 32px',
                backgroundColor: '#0A0A0A',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FBBE63')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
