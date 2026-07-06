import { z } from "zod";

export const serverEnv = z
  .object({
    DATABASE_URL: z.string().min(1),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    ADMIN_SESSION_SECRET: z.string().min(32).optional(),
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .optional()
      .refine(
        (value) => {
          if (process.env.NODE_ENV === "production" && (!value || value.includes("localhost"))) {
            return false;
          }
          return true;
        },
        { message: "NEXT_PUBLIC_APP_URL must be set to the production domain URL (not localhost) in production" }
      ),
    NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(8).optional()
  })
  .passthrough()
  .parse(process.env);
