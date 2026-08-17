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
        variant === "default" && "bg-fg/8 text-fg/75 border border-line",
        variant === "accent" && "bg-accent-soft text-accent",
        variant === "mono" && "font-mono uppercase tracking-wide bg-accent text-black",
        className
      )}
    >
      {children}
    </span>
  );
}
