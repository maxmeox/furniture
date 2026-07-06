export type FollowUpState = "overdue" | "today" | "upcoming" | null;

export function dateOnlyKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getFollowUpState(value?: Date | null, now = new Date()): FollowUpState {
  if (!value) return null;
  const target = dateOnlyKey(value);
  const today = dateOnlyKey(now);
  if (target < today) return "overdue";
  if (target === today) return "today";
  return "upcoming";
}

export function followUpBadgeLabel(state: FollowUpState, locale: "ar" | "en" | "he" = "ar") {
  const labels: Record<string, Record<string, string>> = {
    ar: { today: "اليوم", overdue: "متأخر", upcoming: "قادم" },
    en: { today: "Today", overdue: "Overdue", upcoming: "Upcoming" },
    he: { today: "היום", overdue: "באיחור", upcoming: "בקרוב" },
  };
  if (!state) return "";
  return labels[locale]?.[state] ?? labels.ar?.[state] ?? "";
}

export function followUpBadgeClass(state: FollowUpState) {
  if (state === "today") return "bg-theme-warning text-theme-warning-contrast";
  if (state === "overdue") return "bg-theme-error text-theme-error-contrast";
  if (state === "upcoming") return "bg-theme-success text-theme-success-contrast";
  return "bg-muted text-muted-foreground";
}
