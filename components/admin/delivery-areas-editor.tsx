"use client";

import { useRef, useState } from "react";

export function DeliveryAreasEditor({ areas }: { areas: string[] }) {
  const [items, setItems] = useState<string[]>(areas.length > 0 ? areas : [""]);
  const dataRef = useRef<HTMLInputElement>(null);

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function syncData() {
    if (dataRef.current) {
      dataRef.current.value = items.join("\n");
    }
  }

  return (
    <div className="grid gap-3" onClick={syncData}>
      <input type="hidden" name="deliveryAreas" ref={dataRef} />
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            className="h-11 flex-1 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={index < 3 ? `Area ${index + 1}` : ""}
          />
          {items.length > 1 ? (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-muted-foreground ring-1 ring-border hover:bg-red-50 hover:text-red-600"
              aria-label="Remove"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="8" x2="12" y2="8" />
              </svg>
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="8" y1="4" x2="8" y2="12" />
          <line x1="4" y1="8" x2="12" y2="8" />
        </svg>
        إضافة منطقة
      </button>
    </div>
  );
}
