import { cn } from "@/lib/utils";

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold", tone === "success" && "bg-green-100 text-green-800", tone === "warning" && "bg-amber-100 text-amber-800", tone === "neutral" && "bg-muted text-muted-foreground")}>
      {label}
    </span>
  );
}
