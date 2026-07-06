"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Filter, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Locale } from "@/i18n/routing";
import { priceLabels, styles, t, type CategoryOption, type PriceLabel, type Product } from "@/lib/showroom-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";

const all = "all";

/** Ordered price tiers rendered as an ascending stepped ladder (signature element) */
const PRICE_TIERS = [
  { slug: "budget", height: 28 },
  { slug: "medium", height: 44 },
  { slug: "luxury", height: 60 },
] as const;

type FilterParam = "q" | "cat" | "style" | "price" | "special";

function readParam(params: URLSearchParams, key: FilterParam, fallback = all) {
  return params.get(key)?.trim() || fallback;
}

function buildHref(current: URLSearchParams, key: FilterParam, value: string) {
  const next = new URLSearchParams(current);
  if (value === all || !value) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return qs ? `?${qs}` : window.location.pathname;
}

export function CatalogBrowser({ locale, productsData, categoriesData }: { locale: Locale; productsData: Product[]; categoriesData: readonly CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ct = useTranslations("catalog");

  const [query, setQuery] = useState(() => readParam(searchParams, "q", ""));
  const [category, setCategory] = useState(() => readParam(searchParams, "cat"));
  const [style, setStyle] = useState(() => readParam(searchParams, "style"));
  const [price, setPrice] = useState(() => readParam(searchParams, "price"));
  const [special, setSpecial] = useState(() => readParam(searchParams, "special"));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const updateUrl = useCallback((key: FilterParam, value: string) => {
    const href = buildHref(searchParams, key, value);
    router.replace(href, { scroll: false });
  }, [router, searchParams]);

  const setFilter = useCallback((setter: (v: string) => void, key: FilterParam) => (value: string) => {
    setter(value);
    updateUrl(key, value);
  }, [updateUrl]);

  const setQ = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) updateUrl("q", value.trim());
    else updateUrl("q", "");
  }, [updateUrl]);

  const setCat = setFilter(setCategory, "cat");
  const setSty = setFilter(setStyle, "style");
  const setPri = setFilter(setPrice, "price");
  const setSpe = setFilter(setSpecial, "special");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return productsData.filter((product) => {
      const text = `${t(product.title, locale)} ${t(product.summary, locale)} ${product.code}`.toLowerCase();
      if (normalized && !text.includes(normalized)) return false;
      if (category !== all && product.category !== category) return false;
      if (style !== all && product.style !== style) return false;
      if (price !== all && product.priceLabel !== price) return false;
      if (special === "featured" && !product.featured) return false;
      if (special === "new" && !product.isNew) return false;
      if (special === "offer" && !product.hasOffer) return false;
      return true;
    });
  }, [category, locale, price, productsData, query, special, style]);

  const activeFilters = useMemo(() => {
    const result: { key: FilterParam; label: string }[] = [];
    if (category !== all) {
      const found = categoriesData.find((c) => c.slug === category);
      if (found) result.push({ key: "cat", label: t(found.label, locale) });
    }
    if (style !== all) {
      const found = styles.find((s) => s.slug === style);
      if (found) result.push({ key: "style", label: t(found.label, locale) });
    }
    if (price !== all) {
      result.push({ key: "price", label: t(priceLabels[price as PriceLabel], locale) });
    }
    if (special !== all) {
      const map: Record<string, string> = { featured: ct("featured"), new: ct("new"), offer: ct("offer") };
      result.push({ key: "special", label: map[special] ?? special });
    }
    if (query.trim()) result.push({ key: "q", label: `"${query.trim()}"` });
    return result;
  }, [category, style, price, special, query, locale, ct, categoriesData]);

  const removeFilter = useCallback((key: FilterParam) => {
    if (key === "q") { setQ(""); return; }
    if (key === "cat") { setCat(all); return; }
    if (key === "style") { setSty(all); return; }
    if (key === "price") { setPri(all); return; }
    if (key === "special") { setSpe(all); return; }
  }, [setQ, setCat, setSty, setPri, setSpe]);

  const clearAll = useCallback(() => {
    setQ("");
    setCat(all);
    setSty(all);
    setPri(all);
    setSpe(all);
  }, [setQ, setCat, setSty, setPri, setSpe]);

  useEffect(() => {
    if (!drawerOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setDrawerOpen(false); return; }
      if (event.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === first) { event.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  const filteredCount = filtered.length;
  const hasFilters = activeFilters.length > 0;

  const facets = (
    <>
      {/* Category */}
      <div className="py-4 border-b border-dashed border-border">
        <div className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-secondary">{ct("category")}</div>
        <div className="flex flex-col gap-0.5" role="radiogroup" aria-label={ct("category")}>
          {[{ slug: all, label: ct("all") }, ...categoriesData.map((c) => ({ slug: c.slug, label: t(c.label, locale) }))].map((opt) => {
            const sel = category === opt.slug;
            return (
              <button key={opt.slug} type="button" role="radio" aria-checked={sel} onClick={() => setCat(opt.slug)}
                className={cn("flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition text-start",
                  sel ? "font-bold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                style={sel ? { background: "color-mix(in srgb, var(--theme-primary) 10%, transparent)" } : undefined}>
                <span>{opt.label}</span>
                <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition", sel ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                  {sel ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style */}
      <div className="py-4 border-b border-dashed border-border">
        <div className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-secondary">{ct("style")}</div>
        <div className="flex flex-col gap-0.5" role="radiogroup" aria-label={ct("style")}>
          {[{ slug: all, label: ct("all") }, ...styles.map((s) => ({ slug: s.slug, label: t(s.label, locale) }))].map((opt) => {
            const sel = style === opt.slug;
            return (
              <button key={opt.slug} type="button" role="radio" aria-checked={sel} onClick={() => setSty(opt.slug)}
                className={cn("flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition text-start",
                  sel ? "font-bold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                style={sel ? { background: "color-mix(in srgb, var(--theme-primary) 10%, transparent)" } : undefined}>
                <span>{opt.label}</span>
                <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition", sel ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                  {sel ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price — signature ladder + state chips */}
      <div className="py-4 border-b border-dashed border-border">
        <div className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-secondary">{ct("priceLabel")}</div>
        <div className="flex items-end gap-1.5 pb-0 border-b border-border/50">
          {PRICE_TIERS.map((tier) => {
            const isSel = price === tier.slug;
            return (
              <button key={tier.slug} type="button" role="radio" aria-checked={isSel} onClick={() => setPri(price === tier.slug ? all : tier.slug)}
                className="flex flex-1 flex-col items-center gap-1.5 pb-2 transition">
                <span className="w-full rounded-t-lg bg-muted ring-1 ring-border transition-all duration-200"
                  style={{ height: `${tier.height}px`,
                    ...(isSel ? { background: "linear-gradient(180deg, var(--theme-secondary), var(--theme-primary))", border: "1px solid var(--theme-primary)", boxShadow: "var(--theme-shadow-card)" } : {}), }} />
                <span className={cn("text-[0.7rem] font-semibold transition", isSel ? "font-extrabold text-primary" : "text-muted-foreground")}>
                  {t(priceLabels[tier.slug], locale)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Highlights */}
      <div className="py-4">
        <div className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-secondary">{ct("highlights")}</div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ct("highlights")}>
          {[{ slug: all, label: ct("all") }, { slug: "featured", label: ct("featured") }, { slug: "new", label: ct("new") }, { slug: "offer", label: ct("offer") }].map((opt) => {
            const isSel = special === opt.slug;
            return (
              <button key={opt.slug} type="button" role="radio" aria-checked={isSel} onClick={() => setSpe(special === opt.slug ? all : opt.slug)}
                className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ring-1",
                  isSel ? "bg-accent text-accent-foreground ring-accent font-bold" : "bg-card text-muted-foreground ring-border hover:text-foreground hover:ring-secondary")}>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* Desktop sidebar — refined atelier panel */}
      <aside className="hidden lg:block" aria-label={ct("filters")}>
        <div className="rounded-[var(--theme-radius-panel)] bg-card p-5 shadow-[var(--theme-shadow-panel)] ring-1 ring-border">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <span className="text-lg font-extrabold text-foreground">{ct("refine")}</span>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-extrabold tabular-nums text-secondary">{filteredCount}</span>
          </div>
          {facets}
          <div className="mt-2 rounded-2xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">{ct("note")}</div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="min-w-0">
        {/* Search + mobile filter button */}
        <div className="mb-4 flex gap-3">
          <label className="relative min-w-0 flex-1">
            <span className="absolute inset-y-0 grid w-11 place-items-center text-muted-foreground pointer-events-none start-0">
              <Search className="h-4 w-4" />
            </span>
            <input type="search" value={query}
              onChange={(e) => setQ(e.target.value)}
              className="h-12 pe-4 ps-11 w-full rounded-full border border-border bg-card text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring"
              placeholder={ct("search")} />
          </label>
          <Button type="button" variant="secondary" className="lg:hidden relative" onClick={() => setDrawerOpen(true)} aria-label={ct("filters")}>
            <Filter className="h-4 w-4" />
            <span>{ct("filters")}</span>
            {hasFilters ? (
              <span className="absolute -top-1.5 -end-1.5 grid min-w-[18px] h-[18px] place-items-center rounded-full bg-accent px-1 text-[0.6rem] font-extrabold leading-none text-accent-foreground">
                {activeFilters.length}
              </span>
            ) : null}
          </Button>
        </div>

        {/* Active chips + result count */}
        {filteredCount > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <span className="text-sm font-extrabold tabular-nums whitespace-nowrap">
              <span className="text-primary">{filteredCount}</span>{" "}{ct("results")}
            </span>
            {activeFilters.map((f) => (
              <span key={f.key} className="inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-1 pe-1 text-xs font-semibold ring-1 ring-border">
                {f.label}
                <button type="button" onClick={() => removeFilter(f.key)}
                  className="grid h-[22px] w-[22px] place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                  aria-label={`${ct("clearFilters")} ${f.label}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {hasFilters ? (
              <button type="button" onClick={clearAll}
                className="text-xs font-extrabold text-primary px-2 py-1 rounded-full transition hover:bg-muted">
                {ct("clearAll")}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Product grid or empty state */}
        {filteredCount === 0 ? (
          <div className="rounded-[var(--theme-radius-panel)] border-2 border-dashed border-border bg-card p-10 text-center">
            <div className="text-xl font-extrabold">{ct("noMatches")}</div>
            <p className="mt-2 text-sm text-muted-foreground">{ct("noMatchesHint")}</p>
            {hasFilters ? (
              <button type="button" onClick={clearAll}
                className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground transition hover:bg-[var(--theme-primary-hover)]">
                {ct("clearFilters")}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product, index) => (
              <ProductCard key={product.slug} locale={locale} href={`/${locale}/products/${product.slug}`} slug={product.slug}
                title={t(product.title, locale)} category={t(product.categoryLabel, locale)}
                image={product.images[0]?.src ?? "/images/hero-showroom.svg"}
                priceLabel={t(priceLabels[product.priceLabel], locale)}
                badge={product.isNew ? ct("new") : product.hasOffer ? ct("offer") : undefined} priority={index < 2} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label={ct("filters")}
            className="absolute inset-y-0 w-[88vw] max-w-sm overflow-y-auto bg-card p-5 shadow-2xl start-0">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-extrabold">{ct("filters")}</span>
              <button ref={closeButtonRef} type="button" aria-label={ct("closeFilters")}
                onClick={() => setDrawerOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            {facets}
            <div className="mt-2 rounded-2xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">{ct("note")}</div>
            <div className="mt-4 flex gap-3 pt-4 border-t border-border">
              <button type="button" onClick={clearAll}
                className="flex-1 h-12 rounded-xl bg-muted text-foreground font-bold text-sm border border-border transition hover:bg-card">
                {ct("clearAll")}
              </button>
              <button type="button" onClick={() => setDrawerOpen(false)}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition hover:bg-[var(--theme-primary-hover)]">
                {ct("apply")}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
