import { z } from "zod";

export const localizedTextSchema = z.object({
  ar: z.string().min(1),
  en: z.string().min(1),
  he: z.string().min(1)
});
