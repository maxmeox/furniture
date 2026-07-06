import { describe, it, expect } from "vitest";
import {
  themePresetIds,
  defaultThemePresetId,
  themePresets,
  getThemePreset,
  isThemePresetId,
} from "./theme-presets";

const EXPECTED_IDS = ["default", "luxury-classic", "dark-mode", "modern-minimal"] as const;

describe("themePresetIds", () => {
  it("contains exactly 4 presets", () => {
    expect(themePresetIds).toHaveLength(4);
  });

  it("contains all expected preset IDs in order", () => {
    expect([...themePresetIds]).toEqual([...EXPECTED_IDS]);
  });
});

describe("defaultThemePresetId", () => {
  it("is default", () => {
    expect(defaultThemePresetId).toBe("default");
  });
});

describe("themePresets", () => {
  it("has all 4 presets defined", () => {
    for (const id of EXPECTED_IDS) {
      expect(themePresets[id]).toBeDefined();
    }
  });

  it("has exactly 4 keys matching expected IDs", () => {
    expect(Object.keys(themePresets)).toHaveLength(4);
    expect(Object.keys(themePresets).sort()).toEqual([...EXPECTED_IDS].sort());
  });

  describe("each preset", () => {
    const presets = EXPECTED_IDS.map((id) => ({ id, preset: themePresets[id] }));

    it("has id matching its key", () => {
      for (const { id, preset } of presets) {
        expect(preset.id).toBe(id);
      }
    });

    it("has unique className", () => {
      const classNames = presets.map(({ preset }) => preset.className);
      expect(new Set(classNames).size).toBe(4);
    });

    it("is enabled", () => {
      for (const { preset } of presets) {
        expect(preset.enabled).toBe(true);
      }
    });

    it("has trilingual labels", () => {
      for (const { preset } of presets) {
        expect(preset.labelAr).toBeTruthy();
        expect(preset.labelEn).toBeTruthy();
        expect(preset.labelHe).toBeTruthy();
      }
    });

    it("has trilingual descriptions", () => {
      for (const { preset } of presets) {
        expect(preset.descriptionAr).toBeTruthy();
        expect(preset.descriptionEn).toBeTruthy();
        expect(preset.descriptionHe).toBeTruthy();
      }
    });

    it("has a non-empty className starting with theme-", () => {
      for (const { preset } of presets) {
        expect(preset.className).toMatch(/^theme-/);
      }
    });

    it("has className matching its own theme", () => {
      for (const { id, preset } of presets) {
        expect(preset.className).toBe(`theme-${id}`);
      }
    });

    it("has all 4 color fields as 6-digit hex strings", () => {
      for (const { preset } of presets) {
        expect(preset.colors.bg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(preset.colors.primary).toMatch(/^#[0-9a-f]{6}$/i);
        expect(preset.colors.secondary).toMatch(/^#[0-9a-f]{6}$/i);
        expect(preset.colors.text).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it("has distinct color palettes across presets", () => {
      const allColors = presets.flatMap(({ preset }) => [
        preset.colors.bg,
        preset.colors.primary,
        preset.colors.secondary,
        preset.colors.text,
      ]);
      expect(new Set(allColors).size).toBeGreaterThanOrEqual(12);
    });
  });
});

describe("getThemePreset", () => {
  it("returns correct preset for each valid ID", () => {
    for (const id of EXPECTED_IDS) {
      const result = getThemePreset(id);
      expect(result.id).toBe(id);
      expect(result.className).toBe(`theme-${id}`);
    }
  });

  it("returns default preset when called with no arguments", () => {
    const result = getThemePreset();
    expect(result.id).toBe(defaultThemePresetId);
  });

  it("returns default preset for null", () => {
    const result = getThemePreset(null);
    expect(result.id).toBe(defaultThemePresetId);
  });

  it("returns default preset for undefined", () => {
    const result = getThemePreset(undefined);
    expect(result.id).toBe(defaultThemePresetId);
  });

  it("returns default preset for invalid string", () => {
    const result = getThemePreset("nonexistent-theme");
    expect(result.id).toBe(defaultThemePresetId);
  });

  it("returns default preset for empty string", () => {
    const result = getThemePreset("");
    expect(result.id).toBe(defaultThemePresetId);
  });

  it("always returns an enabled preset", () => {
    const result = getThemePreset();
    expect(result.enabled).toBe(true);
  });
});

describe("isThemePresetId", () => {
  it("returns true for all valid preset IDs", () => {
    for (const id of EXPECTED_IDS) {
      expect(isThemePresetId(id)).toBe(true);
    }
  });

  it("returns false for invalid strings", () => {
    expect(isThemePresetId("")).toBe(false);
    expect(isThemePresetId("invalid")).toBe(false);
    expect(isThemePresetId("default ")).toBe(false);
    expect(isThemePresetId("Default")).toBe(false);
    expect(isThemePresetId("DEFAULT")).toBe(false);
  });

  it("returns false for prototype-pollution-like keys", () => {
    expect(isThemePresetId("__proto__")).toBe(false);
    expect(isThemePresetId("toString")).toBe(false);
  });
});
