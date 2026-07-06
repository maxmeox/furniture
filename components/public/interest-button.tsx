"use client";

import { Heart, MinusCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";
import { type InterestItem, useInterestList } from "./interest-provider";

export function InterestButton({
  item,
  className,
  compact = false,
}: {
  item: InterestItem;
  className?: string;
  compact?: boolean;
}) {
  const { addItem, removeItem, hasItem } = useInterestList();
  const { toast } = useToast();
  const t = useTranslations("interest");
  const saved = hasItem(item.id, item.type);

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "primary"}
      size={compact ? "sm" : "md"}
      className={cn("shrink-0", className)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (saved) {
          removeItem(item.id, item.type);
          toast({
            title: t("removedToast"),
            variant: "info",
            duration: 2000,
          });
        } else {
          addItem(item);
          toast({
            title: t("addedToast"),
            variant: "success",
            duration: 2000,
          });
        }
      }}
      aria-label={saved ? t("saved") : compact ? t("save") : t("add")}
    >
      {saved ? <MinusCircle className="h-4 w-4" /> : compact ? <Plus className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
      <span>{saved ? t("saved") : compact ? t("save") : t("add")}</span>
    </Button>
  );
}
