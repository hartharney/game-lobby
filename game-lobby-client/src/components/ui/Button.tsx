"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={cn(
        "font-semibold rounded-lg px-4 py-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}
