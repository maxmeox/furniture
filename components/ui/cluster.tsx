import { cn } from "@/lib/utils";

type GapSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
type AlignItems = "start" | "center" | "end" | "stretch";

const gapMap: Record<GapSize, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3",
  4: "gap-4", 5: "gap-5", 6: "gap-6", 8: "gap-8",
  10: "gap-10", 12: "gap-12",
};

const alignMap: Record<AlignItems, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

interface ClusterProps {
  children: React.ReactNode;
  gap?: GapSize;
  align?: AlignItems;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "nav" | "main" | "span";
}

export function Cluster({ children, gap = 4, align = "center", className, as: Tag = "div" }: ClusterProps) {
  return (
    <Tag className={cn("flex flex-wrap", gapMap[gap], alignMap[align], className)}>
      {children}
    </Tag>
  );
}
