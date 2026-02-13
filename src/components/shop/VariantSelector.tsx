import { useState, useEffect } from 'react';
import {
  printTypes,
  printSizes,
  getPrice,
  type PrintType,
} from '../../config/printOptions';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';

export type FrameColor = 'gold' | 'silver' | 'white' | 'black';

interface VariantSelectorProps {
  printType?: PrintType;
  onSelectionChange?: (printType: PrintType, sizeId: string, price: number, frameColor?: FrameColor) => void;
}

export default function VariantSelector({ printType, onSelectionChange }: VariantSelectorProps) {
  const [selectedType, setSelectedType] = useState<PrintType>(printType || 'canvas');
  const [selectedSize, setSelectedSize] = useState<string>('50x70');
  const [frameColor, setFrameColor] = useState<FrameColor>('gold');
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();

  // Sync with external print type changes (e.g. thumbnail clicks)
  useEffect(() => {
    if (printType && printType !== selectedType) {
      setSelectedType(printType);
    }
  }, [printType]);

  const currentPrice = getPrice(selectedType, selectedSize);

  const handleTypeChange = (type: PrintType) => {
    setSelectedType(type);
    const newPrice = getPrice(type, selectedSize);
    onSelectionChange?.(type, selectedSize, newPrice, type === 'framed' ? frameColor : undefined);
  };

  const handleSizeChange = (sizeId: string) => {
    setSelectedSize(sizeId);
    const newPrice = getPrice(selectedType, sizeId);
    onSelectionChange?.(selectedType, sizeId, newPrice, selectedType === 'framed' ? frameColor : undefined);
  };

  const handleFrameColorChange = (color: FrameColor) => {
    setFrameColor(color);
    onSelectionChange?.(selectedType, selectedSize, currentPrice, color);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Print Type Selection */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '12px',
          }}
        >
          {t('product.printType')}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {printTypes.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeChange(type.id)}
                style={{
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: isSelected ? '2px solid #B8860B' : '1px solid #e5e5e5',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? '#FFF8E7' : '#ffffff',
                  color: isSelected ? '#B8860B' : '#4a4a4a',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {language === 'mk' ? type.labelMk : type.label}
                {isSelected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-1px',
                      right: '-1px',
                      width: '18px',
                      height: '18px',
                      backgroundColor: '#B8860B',
                      borderRadius: '0 4px 0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      style={{ color: '#ffffff' }}
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame Color Selection (only for framed) */}
      {selectedType === 'framed' && (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '12px',
            }}
          >
            {t('product.frameColor')}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {([
              { id: 'gold' as FrameColor, label: t('product.colorGold') },
              { id: 'silver' as FrameColor, label: t('product.colorSilver') },
              { id: 'white' as FrameColor, label: t('product.colorWhite') },
              { id: 'black' as FrameColor, label: t('product.colorBlack') },
            ]).map((color) => {
              const isSelected = frameColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleFrameColorChange(color.id)}
                  style={{
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: 500,
                    border: isSelected ? '2px solid #B8860B' : '1px solid #e5e5e5',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#FFF8E7' : '#ffffff',
                    color: isSelected ? '#B8860B' : '#4a4a4a',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {color.label}
                  {isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-1px',
                        right: '-1px',
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#B8860B',
                        borderRadius: '0 4px 0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        style={{ color: '#ffffff' }}
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '12px',
          }}
        >
          {t('product.size')}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {printSizes.map((size) => {
            const isSelected = selectedSize === size.id;
            const price = getPrice(selectedType, size.id);
            return (
              <button
                key={size.id}
                type="button"
                onClick={() => handleSizeChange(size.id)}
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: isSelected ? '2px solid #B8860B' : '1px solid #e5e5e5',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? '#FFF8E7' : '#ffffff',
                  color: isSelected ? '#B8860B' : '#4a4a4a',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  minWidth: '100px',
                  position: 'relative',
                }}
              >
                <span>{size.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: isSelected ? '#B8860B' : '#6b6b6b',
                    fontWeight: 400,
                  }}
                >
                  {formatPrice(price)}
                </span>
                {isSelected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-1px',
                      right: '-1px',
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#B8860B',
                      borderRadius: '0 4px 0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="8"
                      height="6"
                      viewBox="0 0 10 8"
                      fill="none"
                      style={{ color: '#ffffff' }}
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Price Display */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '14px', color: '#4a4a4a' }}>{t('product.price')}:</span>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#B8860B',
          }}
        >
          {formatPrice(currentPrice)}
        </span>
      </div>
    </div>
  );
}
