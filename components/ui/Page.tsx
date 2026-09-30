// components/ui/Page.tsx
// Shared page primitives so every screen has the same background, width,
// spacing and sticky-header offsets.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("min-h-screen bg-dark-bg pb-28", className)}>{children}</div>;
}

export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("max-w-md mx-auto px-4 py-4 space-y-4", className)}>{children}</div>;
}

/** Sticky container that sits directly under the global header. */
export function StickyBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-[3.625rem] z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800",
        className
      )}
    >
      <div className="max-w-md mx-auto">{children}</div>
    </div>
  );
}

/** Title bar for simple pages, with an optional back button and right slot. */
export function PageHeader({
  title,
  subtitle,
  back = false,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <StickyBar>
      <div className="px-4 py-3 flex items-center gap-3">
        {back && (
          <button
            onClick={() => router.back()}
            className="-ml-1 p-1 text-zinc-400 hover:text-ink"
            aria-label="Atrás"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-ink leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-zinc-500 truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </StickyBar>
  );
}

export type TabItem = { label: string; href?: string; value?: string };

/** Underlined tab row. Pass `href` for route tabs or `value` + `onChange` for local tabs. */
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex px-2">
      {tabs.map((tab) => {
        const key = tab.href ?? tab.value ?? tab.label;
        const isActive = key === active;
        const cls = cn(
          "relative flex-1 py-3 text-sm font-semibold text-center transition-colors",
          isActive ? "text-ink" : "text-zinc-500 hover:text-zinc-300"
        );
        const bar = isActive && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand" />
        );
        return tab.href ? (
          <Link key={key} href={tab.href} className={cls}>
            {tab.label}
            {bar}
          </Link>
        ) : (
          <button key={key} onClick={() => onChange?.(key)} className={cls}>
            {tab.label}
            {bar}
          </button>
        );
      })}
    </div>
  );
}

/** Horizontally scrolling pill filters. */
export function Chips<T extends string>({
  options,
  active,
  onChange,
  className,
  render,
}: {
  options: readonly T[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
  render?: (value: T) => React.ReactNode;
}) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2.5", className)}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            opt === active
              ? "bg-brand text-white"
              : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800"
          )}
        >
          {render ? render(opt) : opt}
        </button>
      ))}
    </div>
  );
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden",
        onClick && "cursor-pointer hover:border-zinc-700 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">{children}</h2>
      {right}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="py-14 text-center">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {subtitle && <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">{subtitle}</p>}
    </div>
  );
}

/** Small banner shown when a section is displaying sample instead of live data. */
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-zinc-900", className)} />;
}
