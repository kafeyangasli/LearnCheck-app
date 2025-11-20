// src/components/ui/radio-group.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

type RadioGroupContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  value: undefined,
  onValueChange: undefined,
});

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  className,
  children,
  ...props
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        role="radiogroup"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(({ className, value, id, ...props }, ref) => {
  const ctx = React.useContext(RadioGroupContext);

  const checked = ctx.value === value;

  const handleChange = () => {
    ctx.onValueChange?.(value);
  };

  return (
    <input
      ref={ref}
      id={id}
      type="radio"
      role="radio"
      aria-checked={checked}
      checked={checked}
      onChange={handleChange}
      className={cn(
        "h-4 w-4 rounded-full border border-app-border",
        "accent-app-primary",
        className
      )}
      value={value}
      {...props}
    />
  );
});

RadioGroupItem.displayName = "RadioGroupItem";
