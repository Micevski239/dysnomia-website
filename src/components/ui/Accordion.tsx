import { useState, useRef, useEffect, useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const buttonId = useId();

  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
      // After transition, set to auto so nested accordions can expand
      const timer = setTimeout(() => setHeight(undefined), 350);
      return () => clearTimeout(timer);
    } else {
      // First set explicit height so transition can happen from a real value
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
      // Then on next frame collapse to 0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight(0);
        });
      });
    }
  }, [isOpen]);

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
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </button>
      </h3>
      <div
        id={contentId}
        ref={contentRef}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        style={{
          overflow: 'hidden',
          height: height === undefined ? 'auto' : `${height}px`,
          opacity: isOpen ? 1 : 0,
          transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
        }}
      >
        <div style={{ paddingBottom: '20px', paddingLeft: '16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
