import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  style,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <div style={{ position: 'relative', ...style }}>
      <Search
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '18px',
          height: '18px',
          color: '#AAAAAA',
          pointerEvents: 'none',
        }}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          paddingLeft: '48px',
          paddingRight: '48px',
          paddingTop: '14px',
          paddingBottom: '14px',
          backgroundColor: '#FFFFFF',
          border: `2px solid ${isFocused ? '#B8860B' : '#E5E5E5'}`,
          borderRadius: '12px',
          fontSize: '14px',
          color: '#1a1a1a',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxShadow: isFocused ? '0 0 0 3px rgba(184, 134, 11, 0.1)' : 'none',
        }}
      />
      {value ? (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#AAAAAA',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
          }}
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>
      ) : (
        <kbd
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            backgroundColor: '#F5F5F5',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#AAAAAA',
            fontFamily: 'monospace',
            border: '1px solid #E5E5E5',
          }}
        >
          ⌘K
        </kbd>
      )}
    </div>
  );
}
