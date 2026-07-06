"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  href: string;
  image?: string;
}

interface SearchCommandProps {
  locale: string;
  items: SearchItem[];
  placeholder?: string;
  emptyText?: string;
}

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_ENTER = "Enter";
const KEY_ESCAPE = "Escape";

export function SearchCommand({
  locale,
  items,
  placeholder = "Search...",
  emptyText = "No results found",
}: SearchCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const isRtl = locale === "ar" || locale === "he";

  const filtered = query
    ? items.filter((item) => {
        const searchText = `${item.title} ${item.subtitle ?? ""} ${item.category}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
    : [];

  const openDialog = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          closeDialog();
        } else {
          openDialog();
        }
      }
      if (e.key === KEY_ESCAPE && isOpen) {
        e.preventDefault();
        closeDialog();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, openDialog, closeDialog]);

  const navigate = useCallback((href: string) => {
    closeDialog();
    router.push(href);
  }, [router, closeDialog]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEY_DOWN) {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev >= filtered.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === KEY_UP) {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? filtered.length - 1 : prev - 1
      );
    } else if (e.key === KEY_ENTER && filtered[selectedIndex]) {
      e.preventDefault();
      navigate(filtered[selectedIndex].href);
    }
  };

  useEffect(() => {
    const selectedEl = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="grid h-11 w-11 place-items-center rounded-full bg-card text-muted-foreground shadow-sm ring-1 ring-border transition hover:bg-hover hover:text-foreground"
        aria-label={isRtl ? "بحث" : "Search"}
      >
        <Search className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={closeDialog}
        >
          <div
            className="fixed inset-0 bg-foreground/35 backdrop-blur-sm search-overlay"
          />
          <div
              className={cn(
                "relative z-10 w-full max-w-lg rounded-3xl border border-border bg-card shadow-panel search-content",
                isRtl ? "text-right" : "text-left"
              )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="h-14 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                dir={isRtl ? "rtl" : "ltr"}
                aria-controls="search-results"
                aria-activedescendant={filtered[selectedIndex]?.id}
                role="combobox"
                aria-expanded={filtered.length > 0}
                aria-autocomplete="list"
              />
              <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                ESC
              </kbd>
            </div>

            {query && filtered.length > 0 ? (
              <ul id="search-results" ref={listRef} className="max-h-80 overflow-y-auto p-2 no-scrollbar" role="listbox">
                {filtered.map((item, index) => (
                  <li key={item.id} id={item.id} role="option" tabIndex={-1} aria-selected={index === selectedIndex}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                        index === selectedIndex
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className="shrink-0 rounded-lg bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.category}
                      </span>
                      <span className="truncate font-medium">{item.title}</span>
                      {item.subtitle ? (
                        <span className="ms-auto shrink-0 truncate text-xs opacity-60">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : query ? (
              <div className="p-8 text-center">
                <div className="text-sm font-medium text-muted-foreground">{emptyText}</div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "ابدأ بالكتابة للبحث..."
                    : locale === "he"
                      ? "התחל להקליד כדי לחפש..."
                      : "Type to search..."}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
