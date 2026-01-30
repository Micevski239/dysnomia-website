import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { validateCheckoutForm, countryOptions, type CheckoutFormData } from '../../lib/checkoutValidation';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'MK',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCheckoutForm(formData);

    if (!validation.success) {
      setErrors(validation.errors ?? {});
      return;
    }

    await onSubmit(validation.data!);
  };

  const inputStyle = (fieldName: string) => ({
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: errors[fieldName] ? '1px solid #dc2626' : '1px solid #e5e5e5',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500 as const,
    color: '#1a1a1a',
    marginBottom: '8px',
  };

  const errorStyle = {
    fontSize: '12px',
    color: '#dc2626',
    marginTop: '4px',
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Contact Information */}
      <section style={{ marginBottom: '40px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          {t('checkout.contactInfo')}
        </h2>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={labelStyle}>{t('checkout.email')} *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle('email')}
              placeholder="email@example.com"
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>

          <div>
            <label style={labelStyle}>{t('checkout.phone')} *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle('phone')}
              placeholder="+389 7X XXX XXX"
            />
            {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
          </div>
        </div>
      </section>

      {/* Shipping Address */}
      <section style={{ marginBottom: '40px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          {t('checkout.shippingAddress')}
        </h2>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={labelStyle}>{t('checkout.fullName')} *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={inputStyle('fullName')}
            />
            {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
          </div>

          <div>
            <label style={labelStyle}>{t('checkout.address')} *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={inputStyle('address')}
            />
            {errors.address && <p style={errorStyle}>{errors.address}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>{t('checkout.city')} *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={inputStyle('city')}
              />
              {errors.city && <p style={errorStyle}>{errors.city}</p>}
            </div>

            <div>
              <label style={labelStyle}>{t('checkout.postalCode')} *</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                style={inputStyle('postalCode')}
              />
              {errors.postalCode && <p style={errorStyle}>{errors.postalCode}</p>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t('checkout.country')} *</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              style={{
                ...inputStyle('country'),
                appearance: 'none',
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6b6b\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
              }}
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.country && <p style={errorStyle}>{errors.country}</p>}
          </div>
        </div>
      </section>

      {/* Order Notes */}
      <section style={{ marginBottom: '40px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          {t('checkout.orderNotes')}
        </h2>

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder={t('checkout.orderNotesPlaceholder')}
          style={{
            ...inputStyle('notes'),
            resize: 'vertical',
          }}
        />
      </section>

      {/* Payment Method */}
      <section style={{ marginBottom: '40px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          {t('checkout.paymentMethod')}
        </h2>

        <div
          style={{
            border: '2px solid #B8860B',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#FFF8E7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid #B8860B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#B8860B',
                }}
              />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#1a1a1a' }}>
                {t('checkout.payOnDelivery')}
              </p>
              <p style={{ fontSize: '13px', color: '#6b6b6b', marginTop: '2px' }}>
                {t('checkout.payOnDeliveryDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '18px',
          backgroundColor: isSubmitting ? '#cccccc' : '#B8860B',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '16px',
          letterSpacing: '0.02em',
          border: 'none',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {isSubmitting ? t('common.loading') : t('checkout.placeOrder')}
      </button>
    </form>
  );
}
