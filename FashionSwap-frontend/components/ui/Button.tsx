import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "sage" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-terracotta text-parchment hover:bg-terracotta-dark active:scale-[0.98] shadow-sm",
  secondary:
    "bg-charcoal text-parchment hover:bg-charcoal-soft active:scale-[0.98]",
  ghost:
    "bg-transparent text-charcoal hover:bg-parchment-dark active:scale-[0.98]",
  outline:
    "bg-transparent border border-border text-charcoal hover:bg-parchment-dark active:scale-[0.98]",
  sage:
    "bg-sage text-white hover:bg-sage-dark active:scale-[0.98]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-[10px]",
  md: "px-6 py-3 text-[15px] rounded-[12px]",
  lg: "px-8 py-3.5 text-base rounded-[14px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-sans font-medium
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
