"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  icon,
  iconPosition = "left",
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC233] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713] hover:bg-[#2A2823] dark:hover:bg-[#EFECCA] shadow-subtle",
    secondary:
      "bg-[#F0EDD4] text-[#181713] dark:bg-[#22211C] dark:text-[#F7F5DC] border border-[#E3DEC3] dark:border-[#33312B] hover:bg-[#E6E2C3] dark:hover:bg-[#2A2923]",
    gold:
      "bg-[#FFC233] text-[#181713] font-semibold hover:bg-[#E5AC25] shadow-subtle",
    orange:
      "bg-[#FF8A00] text-white font-semibold hover:bg-[#E07900] shadow-subtle",
    danger:
      "bg-[#CE2929] text-white font-semibold hover:bg-[#B52222] shadow-subtle",
    outline:
      "border border-[#E3DEC3] dark:border-[#33312B] text-[#181713] dark:text-[#F7F5DC] hover:bg-[#F0EDD4]/70 dark:hover:bg-[#22211C]/70",
    ghost:
      "text-[#181713] dark:text-[#F7F5DC] hover:bg-[#F0EDD4]/60 dark:hover:bg-[#22211C]/60",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  const combinedClasses = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </>
  );

  if (href) {
    if (href.startsWith("http") || href.startsWith("mailto:")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
          {...props}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
}
