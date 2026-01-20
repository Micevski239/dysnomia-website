import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, style, ...props }, ref) => {
    const baseStyles: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      transition: 'all 0.2s',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      border: 'none',
    };

    const variants: Record<string, CSSProperties> = {
      primary: {
        backgroundColor: '#B8860B',
        color: '#ffffff',
      },
      secondary: {
        backgroundColor: '#f5f5f5',
        color: '#1a1a1a',
        border: '1px solid #e5e5e5',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#B8860B',
        border: '1px solid #B8860B',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#1a1a1a',
      },
      danger: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
      },
    };

    const sizes: Record<string, CSSProperties> = {
      sm: { padding: '6px 12px', fontSize: '14px' },
      md: { padding: '8px 16px', fontSize: '14px' },
      lg: { padding: '12px 24px', fontSize: '16px' },
    };

    const combinedStyle: CSSProperties = {
      ...baseStyles,
      ...variants[variant],
      ...sizes[size],
      ...style,
    };

    return (
      <button
        ref={ref}
        className={className}
        style={combinedStyle}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
