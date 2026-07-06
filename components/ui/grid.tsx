import { cn } from "@/lib/utils";

type GapSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
type ColsCount = 1 | 2 | 3 | 4 | 5 | 6;

const gapMap: Record<GapSize, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3",
  4: "gap-4", 5: "gap-5", 6: "gap-6", 8: "gap-8",
  10: "gap-10", 12: "gap-12",
};

const colsMap: Record<ColsCount, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3",
  4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6",
};

const smColsMap: Record<number, string> = {
  1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3",
};

const mdColsMap: Record<number, string> = {
  1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4",
};

const lgColsMap: Record<number, string> = {
  1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3",
  4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6",
};

interface GridProps {
  children: React.ReactNode;
  cols?: ColsCount;
  gap?: GapSize;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "nav" | "main";
  sm?: 1 | 2 | 3;
  md?: 1 | 2 | 3 | 4;
  lg?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Grid({ children, cols = 1, gap = 4, className, as: Tag = "div", sm, md, lg }: GridProps) {
  return (
    <Tag className={cn(
      "grid",
      gapMap[gap],
      colsMap[cols],
      sm && smColsMap[sm],
      md && mdColsMap[md],
      lg && lgColsMap[lg],
      className,
    )}>
      {children}
    </Tag>
  );
}
