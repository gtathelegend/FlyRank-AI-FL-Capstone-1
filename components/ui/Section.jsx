"use client";

export default function Section({
  children,
  id,
  className = "",
  spacing = "default",
  bg = "default",
  ...props
}) {
  const spacingStyles = {
    dense: "py-8 md:py-12",
    default: "py-16 md:py-24",
    large: "py-20 md:py-32",
    none: "py-0",
  };

  const bgStyles = {
    default: "bg-transparent",
    alt: "bg-[#F0EDD4]/50 dark:bg-[#1C1B17]/60 border-y border-[#E3DEC3]/40 dark:border-[#33312B]/40",
    surface: "bg-[#FAF8EC] dark:bg-[#1E1D19] border-y border-[#E3DEC3]/40 dark:border-[#33312B]/40",
  };

  return (
    <section
      id={id}
      className={`relative w-full ${spacingStyles[spacing] || spacingStyles.default} ${bgStyles[bg] || bgStyles.default} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
