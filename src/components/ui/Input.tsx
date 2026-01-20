import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type CSSProperties } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const baseInputStyles: CSSProperties = {
  width: '100%',
  padding: '10px 16px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5e5',
  color: '#1a1a1a',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s',
};

const labelStyles: CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: '#1a1a1a',
  marginBottom: '6px',
};

const errorStyles: CSSProperties = {
  marginTop: '4px',
  fontSize: '14px',
  color: '#dc2626',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, style, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label htmlFor={id} style={labelStyles}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          style={{
            ...baseInputStyles,
            borderColor: error ? '#dc2626' : '#e5e5e5',
            ...style,
          }}
          {...props}
        />
        {error && <p style={errorStyles}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, style, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label htmlFor={id} style={labelStyles}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          style={{
            ...baseInputStyles,
            minHeight: '120px',
            resize: 'vertical',
            borderColor: error ? '#dc2626' : '#e5e5e5',
            ...style,
          }}
          {...props}
        />
        {error && <p style={errorStyles}>{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, options, style, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label htmlFor={id} style={labelStyles}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          style={{
            ...baseInputStyles,
            cursor: 'pointer',
            borderColor: error ? '#dc2626' : '#e5e5e5',
            ...style,
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p style={errorStyles}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
