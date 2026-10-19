import type { HTMLAttributes } from "react";

type SpinnerSize = "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
};

type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "className">;

export function Spinner({ size = "md", label = "Loading", className = "", ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block shrink-0 animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    />
  );
}
