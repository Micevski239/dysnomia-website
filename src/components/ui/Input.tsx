import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes, type CSSProperties } from 'react';

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
  padding: '14px 18px',
  backgroundColor: '#ffffff',
  border: '2px solid #E5E5E5',
  borderRadius: '12px',
  color: '#1a1a1a',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const focusedBorder = '#B8860B';
const focusShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';

const labelStyles: CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#1a1a1a',
  marginBottom: '8px',
};

const errorStyles: CSSProperties = {
  marginTop: '6px',
  fontSize: '13px',
  color: '#dc2626',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
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
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={{
            ...baseInputStyles,
            borderColor: error ? '#dc2626' : focused ? focusedBorder : '#E5E5E5',
            boxShadow: focused ? focusShadow : 'none',
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
    const [focused, setFocused] = useState(false);
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
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={{
            ...baseInputStyles,
            minHeight: '140px',
            resize: 'vertical',
            borderColor: error ? '#dc2626' : focused ? focusedBorder : '#E5E5E5',
            boxShadow: focused ? focusShadow : 'none',
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
    const [focused, setFocused] = useState(false);
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
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={{
            ...baseInputStyles,
            cursor: 'pointer',
            borderColor: error ? '#dc2626' : focused ? focusedBorder : '#E5E5E5',
            boxShadow: focused ? focusShadow : 'none',
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
