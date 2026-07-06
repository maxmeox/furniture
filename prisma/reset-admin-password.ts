import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { assertDbScriptAllowed } from "./script-safety";

const prisma = new PrismaClient();

async function main() {
  assertDbScriptAllowed("admin:reset-password", {
    allowFlag: "ALLOW_ADMIN_RESET",
    action: "reset an admin password"
  });

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.");
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash: await bcrypt.hash(password, 12),
      isActive: true
    },
    create: {
      email,
      name: "Admin",
      passwordHash: await bcrypt.hash(password, 12),
      isActive: true
    }
  });

  console.log(`Admin password reset for: ${email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : "Admin password reset failed.");
    await prisma.$disconnect();
    process.exit(1);
  });
