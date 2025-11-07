import * as React from "react";
import { clsx } from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg bg-[#FAFAF8] p-4",
        {
          "border border-[#D9C8A0]": variant === "bordered",
          "shadow-lg": variant === "elevated",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
