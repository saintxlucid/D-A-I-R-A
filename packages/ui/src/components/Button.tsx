import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "bg-[#0D2C56] text-white hover:bg-[#1a3d6f] focus:ring-[#0D2C56]": variant === "primary",
          "bg-[#2CF5C4] text-[#2C2C2C] hover:bg-[#24d4a8] focus:ring-[#2CF5C4]":
            variant === "secondary",
          "border-2 border-[#0D2C56] text-[#0D2C56] hover:bg-[#0D2C56] hover:text-white focus:ring-[#0D2C56]":
            variant === "outline",
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
