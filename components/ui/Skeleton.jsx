"use client";

export default function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#E3DEC3]/50 dark:bg-[#33312B]/50 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[#E3DEC3] dark:border-[#33312B] bg-[#FAF8EC] dark:bg-[#1E1D19] p-6 space-y-4 animate-pulse">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}
