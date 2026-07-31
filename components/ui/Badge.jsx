"use client";

export default function Badge({
  children,
  variant = "gold",
  size = "md",
  icon,
  className = "",
  ...props
}) {
  const variantStyles = {
    gold:
      "bg-[#FFC233]/20 text-[#8F6500] dark:text-[#FFC233] border border-[#FFC233]/40",
    orange:
      "bg-[#FF8A00]/15 text-[#9E5100] dark:text-[#FF8A00] border border-[#FF8A00]/30",
    red:
      "bg-[#CE2929]/15 text-[#911818] dark:text-[#E04848] border border-[#CE2929]/30",
    neutral:
      "bg-[#F0EDD4] text-[#4A473E] dark:bg-[#22211C] dark:text-[#D1CDBC] border border-[#E3DEC3] dark:border-[#33312B]",
    outline:
      "bg-transparent text-[#181713] dark:text-[#F7F5DC] border border-[#E3DEC3] dark:border-[#33312B]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium gap-1",
    md: "text-xs px-2.5 py-1 font-semibold gap-1.5",
    lg: "text-sm px-3 py-1.5 font-semibold gap-2",
  };

  return (
    <span
      className={`inline-flex items-center tracking-wide rounded-full font-mono uppercase ${variantStyles[variant] || variantStyles.gold} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
