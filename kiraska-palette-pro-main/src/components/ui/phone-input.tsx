import * as React from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Always start with 998
  let formatted = '+998';
  
  // Get digits after 998
  let remaining = digits;
  if (digits.startsWith('998')) {
    remaining = digits.slice(3);
  } else if (digits.startsWith('0')) {
    remaining = digits.slice(1);
  }
  
  // Limit to 9 digits after 998
  remaining = remaining.slice(0, 9);
  
  // Format: +998 XX XXX XX XX
  if (remaining.length > 0) {
    formatted += ' ' + remaining.slice(0, 2);
  }
  if (remaining.length > 2) {
    formatted += ' ' + remaining.slice(2, 5);
  }
  if (remaining.length > 5) {
    formatted += ' ' + remaining.slice(5, 7);
  }
  if (remaining.length > 7) {
    formatted += ' ' + remaining.slice(7, 9);
  }
  
  return formatted;
};

const isValidPhone = (value: string): boolean => {
  // Must be exactly +998 XX XXX XX XX (17 characters)
  return value.length === 17 && /^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(value);
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // If user tries to delete +998 prefix, keep it
      if (inputValue.length < 4) {
        onChange('+998');
        return;
      }
      
      const formatted = formatPhoneNumber(inputValue);
      onChange(formatted);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent deleting +998 prefix
      const input = e.currentTarget;
      if (e.key === 'Backspace' && input.selectionStart !== null && input.selectionStart <= 4) {
        e.preventDefault();
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Initialize with +998 if empty
      if (!value || value.length < 4) {
        onChange('+998');
      }
      props.onFocus?.(e);
    };

    return (
      <div className="space-y-1">
        <input
          type="tel"
          inputMode="numeric"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          value={value || '+998'}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="+998 XX XXX XX XX"
          maxLength={17}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput, isValidPhone };
