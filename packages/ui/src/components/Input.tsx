import * as React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-[#2C2C2C]">{label}</label>
      )}
      <input
        className={clsx(
          "w-full rounded-lg border border-[#D9C8A0] bg-white px-4 py-2 text-[#2C2C2C] transition-colors",
          "focus:border-[#0D2C56] focus:outline-none focus:ring-2 focus:ring-[#0D2C56] focus:ring-opacity-50",
          {
            "border-red-500 focus:border-red-500 focus:ring-red-500": error,
          },
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
