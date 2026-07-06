import { describe, it, expect } from "vitest";
import { 
  getDeliveryAreaLabel, 
  buildWhatsAppMessage, 
  inquiryPayloadSchema, 
  whatsappInquiryFormSchema,
  buildWhatsAppMessageFromForm 
} from "./conversion";

describe("conversion", () => {
  describe("buildWhatsAppMessageFromForm", () => {
    it("correctly bridges form input to message builder", () => {
      const formInput = {
        requestType: "customization" as const,
        deliveryArea: "Other",
        fabricColor: "Velvet Blue",
        notes: "Please call me."
      };
      const context = {
        locale: "en" as const,
        entity: {
          type: "product" as const,
          id: "prod-1",
          title: "Sofa",
        },
        sourcePageUrl: "https://example.com/sofa",
      };

      const msg = buildWhatsAppMessageFromForm(formInput, context);
      
      expect(msg).toContain("Ask about customization");
      expect(msg).toContain("Other");
      expect(msg).toContain("Velvet Blue");
      expect(msg).toContain("Please call me.");
    });
  });

  describe("whatsappInquiryFormSchema", () => {
    it("validates correct input", () => {
      const input = {
        requestType: "delivery",
        deliveryArea: "West Bank",
        fabricColor: "Red",
        notes: "Thanks."
      };
      const result = whatsappInquiryFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects invalid request type", () => {
      const input = {
        requestType: "invalid-type",
        deliveryArea: "West Bank",
      };
      const result = whatsappInquiryFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("getDeliveryAreaLabel", () => {
    it("returns Arabic label for West Bank", () => {
      expect(getDeliveryAreaLabel("West Bank", "ar")).toBe("الضفة الغربية");
    });

    it("returns English label for West Bank", () => {
      expect(getDeliveryAreaLabel("West Bank", "en")).toBe("West Bank");
    });

    it("returns Hebrew label for Jerusalem and suburbs", () => {
      expect(getDeliveryAreaLabel("Jerusalem and suburbs", "he")).toBe("ירושלים והסביבה");
    });

    it("returns raw text for unknown area", () => {
      expect(getDeliveryAreaLabel("Gaza", "ar")).toBe("Gaza");
    });
  });

  describe("buildWhatsAppMessage", () => {
    const defaultPayload = {
      locale: "en" as const,
      entity: {
        type: "product" as const,
        id: "prod-1",
        title: "Corner Sofa",
        code: "CS-001",
        href: "/products/corner-sofa",
      },
      deliveryArea: "West Bank",
      inquiryType: "ask_for_price" as const,
      sourcePageUrl: "https://example.com/catalog",
    };

    it("builds a single-item message", () => {
      const msg = buildWhatsAppMessage(defaultPayload);
      expect(msg).toContain("Corner Sofa");
      expect(msg).toContain("CS-001");
      expect(msg).toContain("Delivery area");
      expect(msg).toContain("Inquiry type");
      expect(msg).toContain("Ask for price");
    });

    it("includes custom note when provided", () => {
      const msg = buildWhatsAppMessage({ ...defaultPayload, note: "I want this in beige" });
      expect(msg).toContain("Note");
      expect(msg).toContain("I want this in beige");
    });

    it("includes selected fabric when provided", () => {
      const msg = buildWhatsAppMessage({ ...defaultPayload, selectedFabric: "Beige FAB-001" });
      expect(msg).toContain("Selected fabric/color");
      expect(msg).toContain("Beige FAB-001");
    });

    it("includes campaign context when provided", () => {
      const msg = buildWhatsAppMessage({
        ...defaultPayload,
        campaignContext: { utm_campaign: "summer-sale" },
      });
      expect(msg).toContain("Campaign");
      expect(msg).toContain("summer-sale");
    });

    it("uses custom message intro", () => {
      const msg = buildWhatsAppMessage({
        ...defaultPayload,
        messageIntro: "Custom intro",
      });
      expect(msg.startsWith("Custom intro")).toBe(true);
    });

    it("builds interest_list message with multiple items", () => {
      const msg = buildWhatsAppMessage({
        ...defaultPayload,
        entity: {
          type: "interest_list",
          id: "list-1",
          title: "My Favorites",
          items: [
            { id: "p1", type: "product", title: "Sofa A", subtitle: "SF-001", image: "", href: "/products/sofa-a" },
            { id: "p2", type: "product", title: "Chair B", subtitle: "CH-002", image: "", href: "/products/chair-b" },
          ],
        },
      });
      expect(msg).toContain("1.");
      expect(msg).toContain("Sofa A");
      expect(msg).toContain("2.");
      expect(msg).toContain("Chair B");
    });

    it("generates Arabic message", () => {
      const msg = buildWhatsAppMessage({ ...defaultPayload, locale: "ar" });
      expect(msg).toContain("مرحبًا");
      expect(msg).toContain("الاسم");
      expect(msg).toContain("منطقة التوصيل");
    });

    it("generates Hebrew message", () => {
      const msg = buildWhatsAppMessage({ ...defaultPayload, locale: "he" });
      expect(msg).toContain("שלום");
      expect(msg).toContain("שם");
      expect(msg).toContain("אזור משלוח");
    });
  });

  describe("inquiryPayloadSchema", () => {
    const validPayload = {
      locale: "en",
      entity: {
        type: "product",
        id: "prod-1",
        title: "Corner Sofa",
      },
      deliveryArea: "West Bank",
      inquiryType: "ask_for_price",
      sourcePageUrl: "https://example.com/catalog",
      generatedMessage: "Hello, I am interested in this item:",
    };

    it("validates a correct payload", () => {
      const result = inquiryPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects invalid locale", () => {
      const result = inquiryPayloadSchema.safeParse({ ...validPayload, locale: "fr" });
      expect(result.success).toBe(false);
    });

    it("rejects empty delivery area", () => {
      const result = inquiryPayloadSchema.safeParse({ ...validPayload, deliveryArea: "" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid inquiry type", () => {
      const result = inquiryPayloadSchema.safeParse({ ...validPayload, inquiryType: "invalid" });
      expect(result.success).toBe(false);
    });

    it("accepts optional campaign context with valid fields", () => {
      const result = inquiryPayloadSchema.safeParse({
        ...validPayload,
        campaignContext: { utm_source: "facebook", utm_campaign: "summer" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects unknown fields in campaign context", () => {
      const result = inquiryPayloadSchema.safeParse({
        ...validPayload,
        campaignContext: { utm_source: "facebook", extra_field: "should be stripped" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects interest_list with more than 20 items", () => {
      const items = Array.from({ length: 21 }, (_, i) => ({
        id: `p${i}`,
        type: "product" as const,
        title: `Product ${i}`,
      }));
      const result = inquiryPayloadSchema.safeParse({
        ...validPayload,
        entity: { type: "interest_list", id: "list-1", title: "List", items },
      });
      expect(result.success).toBe(false);
    });

    it("allows empty optional note", () => {
      const result = inquiryPayloadSchema.safeParse({ ...validPayload, note: "" });
      expect(result.success).toBe(true);
    });

    it("rejects note exceeding 240 characters", () => {
      const result = inquiryPayloadSchema.safeParse({ ...validPayload, note: "x".repeat(241) });
      expect(result.success).toBe(false);
    });
  });
});
