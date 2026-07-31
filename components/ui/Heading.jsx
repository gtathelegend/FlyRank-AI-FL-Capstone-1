"use client";

import Badge from "./Badge";

export default function Heading({
  children,
  level = 2,
  size,
  subtitle,
  badge,
  badgeVariant = "gold",
  align = "left",
  className = "",
  accentBar = false,
  ...props
}) {
  const Tag = `h${level}`;

  const defaultSizes = {
    1: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",
    2: "text-3xl sm:text-4xl font-bold tracking-tight",
    3: "text-2xl sm:text-3xl font-semibold tracking-tight",
    4: "text-xl sm:text-2xl font-semibold",
    5: "text-lg sm:text-xl font-medium",
    6: "text-base font-medium",
  };

  const alignStyles = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const headingSizeClass = size ? size : defaultSizes[level] || defaultSizes[2];

  return (
    <div className={`flex flex-col ${alignStyles[align]} ${className}`}>
      {badge && (
        <div className="mb-3">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <Tag
        className={`font-heading text-[#181713] dark:text-[#F7F5DC] ${headingSizeClass}`}
        {...props}
      >
        {children}
      </Tag>
      {accentBar && (
        <div
          className={`h-1 w-12 bg-[#FFC233] rounded-full mt-3 ${
            align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""
          }`}
        />
      )}
      {subtitle && (
        <p className="mt-3 text-base sm:text-lg text-[#57534E] dark:text-[#9E9A8B] max-w-2xl font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
