"use client";

export default function Container({
  children,
  size = "lg",
  className = "",
  ...props
}) {
  const sizeStyles = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeStyles[size] || sizeStyles.lg} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
