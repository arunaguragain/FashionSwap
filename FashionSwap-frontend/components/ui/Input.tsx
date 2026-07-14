import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  compact?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightElement,
  compact = false,
  className = "",
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col ${compact ? "gap-1" : "gap-1.5"}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`font-medium text-charcoal ${compact ? "text-xs" : "text-sm"}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-white border text-charcoal
            placeholder:text-ink/60 outline-none transition-all duration-150
            border-border focus:border-terracotta focus:ring-2 focus:ring-terracotta/15
            ${compact ? "px-3 py-1.5 text-[13px] rounded-[10px]" : "px-4 py-3 text-[15px] rounded-[12px]"}
            ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}
            ${leftIcon ? (compact ? "pl-8" : "pl-10") : ""}
            ${rightElement ? "pr-10" : ""}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-ink">{hint}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
