import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "./button";

export function PremiumButton({
  href,
  children,
  whatsapp = false,
  className
}: {
  href: string;
  children: React.ReactNode;
  whatsapp?: boolean;
  className?: string;
}) {
  const Icon = whatsapp ? MessageCircle : ArrowLeft;
  return (
    <Button asChild size="lg" className={className}>
      <Link href={href}>
        <span>{children}</span>
        <Icon className="h-4 w-4 text-current" aria-hidden />
      </Link>
    </Button>
  );
}
