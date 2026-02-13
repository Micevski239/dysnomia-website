import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductSearch } from '../../hooks/useProductSearch';
import { useCurrency } from '../../hooks/useCurrency';
import { useLanguage } from '../../hooks/useLanguage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const {
    results,
    loading,
    search,
    clearResults,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  } = useProductSearch();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      clearResults();
    }
  }, [isOpen, clearResults]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    search(value);
  };

  const handleResultClick = (slug: string) => {
    addToRecentSearches(query);
    onClose();
    navigate(`/artwork/${slug}`);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    search(searchTerm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      addToRecentSearches(query);
      onClose();
      navigate(`/artwork/${results[0].slug}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          padding: '0',
          maxHeight: '100vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 32px)',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b6b6b"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder={`${t('common.search')}...`}
                style={{
                  flex: 1,
                  fontSize: '18px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b6b6b',
                }}
                aria-label="Close search"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Search Content */}
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: 'clamp(16px, 3vw, 32px)',
            minHeight: '300px',
          }}
        >
          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #E5E5E5',
                  borderTopColor: '#B8860B',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto',
                }}
              />
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Search Results */}
          {!loading && query && results.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b6b6b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '16px',
                }}
              >
                Results ({results.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleResultClick(product.slug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      backgroundColor: '#f9f9f9',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: '75px',
                        backgroundColor: '#e5e5e5',
                        flexShrink: 0,
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#1a1a1a',
                          marginBottom: '4px',
                        }}
                      >
                        {product.title}
                      </p>
                      <p style={{ fontSize: '13px', color: '#B8860B' }}>
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#999999"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && query && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6b6b6b', fontSize: '16px' }}>
                No results found for "{query}"
              </p>
              <p style={{ color: '#999999', fontSize: '14px', marginTop: '8px' }}>
                Try different keywords or browse our collections
              </p>
            </div>
          )}

          {/* Recent Searches */}
          {!loading && !query && recentSearches.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b6b6b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Recent Searches
                </p>
                <button
                  onClick={clearRecentSearches}
                  style={{
                    fontSize: '12px',
                    color: '#B8860B',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      backgroundColor: '#f5f5f5',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      color: '#4a4a4a',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e5e5')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !query && recentSearches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cccccc"
                strokeWidth="1.5"
                style={{ margin: '0 auto 16px' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p style={{ color: '#6b6b6b', fontSize: '16px' }}>
                Start typing to search artworks
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
