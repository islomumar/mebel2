import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormattedNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | string;
  onChange: (value: number) => void;
}

export function formatNumberWithSpaces(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value.replace(/\s/g, "")) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString("ru-RU").replace(/,/g, " ");
}

export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/\s/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const FormattedNumberInput = React.forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
      formatNumberWithSpaces(value)
    );

    React.useEffect(() => {
      setDisplayValue(formatNumberWithSpaces(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Allow only numbers and spaces
      const cleanedInput = rawValue.replace(/[^\d\s]/g, "");
      setDisplayValue(cleanedInput);
      
      const numericValue = parseFormattedNumber(cleanedInput);
      onChange(numericValue);
    };

    const handleBlur = () => {
      // Format on blur
      const numericValue = parseFormattedNumber(displayValue);
      setDisplayValue(formatNumberWithSpaces(numericValue));
    };

    return (
      <input
        type="text"
        inputMode="numeric"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);
FormattedNumberInput.displayName = "FormattedNumberInput";

export { FormattedNumberInput };
