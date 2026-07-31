"use client";

import { motion } from "framer-motion";

export default function Card({
  children,
  variant = "default",
  padding = "md",
  interactive = false,
  className = "",
  onClick,
  ...props
}) {
  const variantStyles = {
    default:
      "bg-[#FAF8EC] dark:bg-[#1E1D19] border border-[#E3DEC3] dark:border-[#33312B] text-[#181713] dark:text-[#F7F5DC]",
    warm:
      "bg-[#F0EDD4] dark:bg-[#25241E] border border-[#E3DEC3] dark:border-[#33312B] text-[#181713] dark:text-[#F7F5DC]",
    outlined:
      "bg-transparent border border-[#E3DEC3] dark:border-[#33312B] text-[#181713] dark:text-[#F7F5DC]",
    elevated:
      "bg-[#FFFFFF] dark:bg-[#22211C] border border-[#E3DEC3] dark:border-[#33312B] shadow-editorial text-[#181713] dark:text-[#F7F5DC]",
  };

  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const interactiveStyles = interactive
    ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-[#FFC233] dark:hover:border-[#FFC233] cursor-pointer group"
    : "";

  const combinedClasses = `rounded-xl ${variantStyles[variant] || variantStyles.default} ${paddingStyles[padding] || paddingStyles.md} ${interactiveStyles} ${className}`;

  if (interactive) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={combinedClasses}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }) {
  return <div className={`flex-1 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`mt-6 pt-4 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60 flex items-center justify-between gap-4 ${className}`}>{children}</div>;
}
