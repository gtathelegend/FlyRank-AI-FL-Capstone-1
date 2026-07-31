"use client";

export default function Tag({
  children,
  variant = "mono",
  size = "md",
  icon,
  className = "",
  ...props
}) {
  const variantStyles = {
    mono:
      "bg-[#F0EDD4]/70 dark:bg-[#22211C] text-[#181713] dark:text-[#F7F5DC] border border-[#E3DEC3] dark:border-[#33312B]",
    gold:
      "bg-[#FFC233]/15 text-[#7A5700] dark:text-[#FFC233] border border-[#FFC233]/30",
    orange:
      "bg-[#FF8A00]/15 text-[#8A4700] dark:text-[#FF8A00] border border-[#FF8A00]/30",
    neutral:
      "bg-[#EFECCA]/50 dark:bg-[#1A1915] text-[#57534E] dark:text-[#9E9A8B] border border-[#E3DEC3]/60 dark:border-[#33312B]/60",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded",
    md: "text-xs px-2.5 py-1 rounded-md",
    lg: "text-sm px-3 py-1.5 rounded-lg",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-tight ${variantStyles[variant] || variantStyles.mono} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
