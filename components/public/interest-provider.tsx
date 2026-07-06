"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { readStoredCampaignContext } from "@/components/conversion/use-campaign-context";
import type { Locale } from "@/i18n/routing";

export type InterestItemType = "product" | "fabric" | "offer";

export type InterestItem = {
  id: string;
  type: InterestItemType;
  title: string;
  subtitle?: string;
  image?: string;
  href?: string;
};


type InterestContextValue = {
  items: InterestItem[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (item: InterestItem) => void;
  removeItem: (id: string, type: InterestItemType) => void;
  hasItem: (id: string, type: InterestItemType) => boolean;
  clear: () => void;
  storageUnavailable: boolean;
};

const storageKey = "furniture-showroom-interest-list";
const MAX_INTEREST_ITEMS = 50;
const InterestContext = createContext<InterestContextValue | null>(null);
const emptyInterestItems: InterestItem[] = [];
const interestListeners = new Set<() => void>();
let cachedInterestRaw: string | null = null;
let cachedInterestItems: InterestItem[] = emptyInterestItems;

function checkStorageAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const key = "__storage_test__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function InterestProvider({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const items = useSyncExternalStore(subscribeInterestItems, readInterestItems, getServerInterestItems);
  const [isOpen, setIsOpen] = useState(false);
  const [storageUnavailable] = useState(() => !checkStorageAvailable());

  const value = useMemo<InterestContextValue>(
    () => ({
      items,
      count: items.length,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((current) => !current),
      addItem: (item) => {
        if (!items.some((saved) => saved.id === item.id && saved.type === item.type)) {
          if (items.length >= MAX_INTEREST_ITEMS) return;
          if (checkStorageAvailable()) {
            writeInterestItems([...items, item]);
          }
        }
        trackInterestEvent("interest_item_added", item, locale);
      },
      removeItem: (id, type) => {
        if (checkStorageAvailable()) {
          writeInterestItems(items.filter((item) => item.id !== id || item.type !== type));
        }
        trackInterestEvent("interest_item_removed", { id, type, title: id }, locale);
      },
      hasItem: (id, type) => items.some((item) => item.id === id && item.type === type),
      clear: () => { if (checkStorageAvailable()) writeInterestItems([]); },
      storageUnavailable,
    }),
    [isOpen, items, locale, storageUnavailable]
  );

  return (
    <InterestContext.Provider value={value}>
      {children}
    </InterestContext.Provider>
  );
}

function getServerInterestItems() {
  return emptyInterestItems;
}

function readInterestItems() {
  if (typeof window === "undefined") return emptyInterestItems;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === cachedInterestRaw) return cachedInterestItems;
    cachedInterestRaw = stored;
    const parsed = stored ? JSON.parse(stored) : emptyInterestItems;
    cachedInterestItems = Array.isArray(parsed) ? (parsed as InterestItem[]) : emptyInterestItems;
    return cachedInterestItems;
  } catch {
    cachedInterestRaw = null;
    cachedInterestItems = emptyInterestItems;
    return emptyInterestItems;
  }
}

function subscribeInterestItems(listener: () => void) {
  interestListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    interestListeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function writeInterestItems(items: InterestItem[]) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(items);
  cachedInterestRaw = raw;
  cachedInterestItems = items;
  window.localStorage.setItem(storageKey, raw);
  for (const listener of interestListeners) listener();
}

function trackInterestEvent(type: "interest_item_added" | "interest_item_removed", item: InterestItem, locale: Locale) {
  if (typeof window === "undefined") return;
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      locale,
      entityType: item.type,
      entityId: item.id,
      url: window.location.href,
      referrer: document.referrer || undefined,
      campaignContext: readStoredCampaignContext(),
      metadata: {
        title: item.title,
        subtitle: item.subtitle
      }
    }),
    keepalive: true
  }).catch((e: unknown) => console.error("[interest-tracking]", e instanceof Error ? e.message : e));
}

export function useInterestList() {
  const context = useContext(InterestContext);
  if (!context) throw new Error("useInterestList must be used inside InterestProvider");
  return context;
}
