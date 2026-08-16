import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      {label}
    </Link>
  );
}
