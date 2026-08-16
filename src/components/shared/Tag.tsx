import { cn } from "@/lib/utils";

export function Tag({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "mono";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-tag px-3 py-1 text-xs font-medium leading-none",
        variant === "default" && "bg-ink/5 text-ink/70",
        variant === "accent" && "bg-accent-soft text-accent",
        variant === "mono" && "font-mono uppercase tracking-wide bg-ink text-paper",
        className
      )}
    >
      {children}
    </span>
  );
}
