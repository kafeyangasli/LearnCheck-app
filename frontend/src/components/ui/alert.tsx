// src/components/ui/alert.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "w-full rounded-xl border border-app-border bg-white px-4 py-3 flex gap-2",
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

export const AlertTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("font-semibold text-sm", className)}
    {...props}
  />
);

export const AlertDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("text-xs text-app-muted", className)}
    {...props}
  />
);
