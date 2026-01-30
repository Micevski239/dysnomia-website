import { useState, useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const buttonId = useId();

  return (
    <div style={{ borderBottom: '1px solid #e5e5e5' }}>
      <h3 style={{ margin: 0 }}>
        <button
          id={buttonId}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 0',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {title}
          </span>
          <ChevronDown
            aria-hidden="true"
            style={{
              width: '20px',
              height: '20px',
              color: '#6b6b6b',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        style={{
          overflow: 'hidden',
          maxHeight: isOpen ? '500px' : '0',
          transition: 'max-height 0.3s ease-in-out',
        }}
      >
        <div style={{ paddingBottom: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
