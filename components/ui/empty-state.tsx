import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: "package" | "search" | "offer" | "camera" | "fabric";
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

const iconMap = {
  package: PackageOpen,
  search: PackageOpen,
  offer: PackageOpen,
  camera: PackageOpen,
  fabric: PackageOpen,
};

export function EmptyState({
  icon = "package",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? (
        <a
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          {action.label}
        </a>
      ) : null}
    </div>
  );
}
