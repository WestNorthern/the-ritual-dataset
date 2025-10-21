import { PrismaClient } from "@prisma/client";
import { seedRituals } from "./seeds/rituals";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed] start");
  await seedRituals(prisma); // pass the client explicitly (works even if omitted)
  console.log("[seed] done");
}

main()
  .catch((e) => {
    console.error("[seed] error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
