import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  href,
  description
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  description?: string;
}) {
  return (
    <div className="theme-section-heading max-w-2xl">
      {eyebrow ? <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-secondary">{eyebrow}</div> : null}
      {href ? (
        <Link href={href} className="group inline-flex items-center gap-2 decoration-2 underline-offset-4 hover:underline">
          <h2 className="text-3xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-4xl">{title}</h2>
          <ArrowUpRight className="h-6 w-6 shrink-0 text-muted-foreground transition-colors group-hover:text-primary md:h-7 md:w-7" aria-hidden="true" />
        </Link>
      ) : (
        <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">{title}</h2>
      )}
      {description ? <p className="mt-4 text-base leading-8 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
