import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL not set");
  }
  await prisma.user.upsert({
    where: { email },
    update: { role: "admin" },
    create: { email, role: "admin" }
  });
  console.log(`Seeded admin ${email}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
