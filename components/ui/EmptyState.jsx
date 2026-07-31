"use client";

import Button from "./Button";
import Card from "./Card";

export default function EmptyState({
  title = "No content available",
  description = "Check back soon for updates or explore other sections.",
  icon,
  action,
  className = "",
}) {
  return (
    <Card variant="warm" className={`p-8 sm:p-12 text-center max-w-md mx-auto ${className}`}>
      {icon && <div className="text-3xl text-[#FF8A00] mb-3">{icon}</div>}
      <h3 className="font-heading font-bold text-xl text-[#181713] dark:text-[#F7F5DC] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#57534E] dark:text-[#9E9A8B] leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <Button href={action.href} onClick={action.onClick} variant="gold" size="sm">
          {action.label}
        </Button>
      )}
    </Card>
  );
}
