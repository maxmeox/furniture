import { cn } from "@/lib/utils";

type GapSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

const gapMap: Record<GapSize, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3",
  4: "gap-4", 5: "gap-5", 6: "gap-6", 8: "gap-8",
  10: "gap-10", 12: "gap-12",
};

interface StackProps {
  children: React.ReactNode;
  gap?: GapSize;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "nav" | "main" | "span";
}

export function Stack({ children, gap = 4, className, as: Tag = "div" }: StackProps) {
  return <Tag className={cn("flex flex-col", gapMap[gap], className)}>{children}</Tag>;
}
