import { PrismaClient } from "@prisma/client";
import { toolRegistry } from "../packages/core/src/toolRegistry.js";

const prisma = new PrismaClient();

const run = async () => {
  for (const tool of toolRegistry) {
    await prisma.tool.upsert({
      where: { id: tool.id },
      update: {
        slug: tool.slug,
        name: tool.name,
        description: tool.description,
        category: tool.category,
        tags: tool.tags,
        kind: tool.kind,
        isAi: tool.isAi,
        tier: tool.tier,
        seoTitle: tool.seoTitle,
        seoDescription: tool.seoDescription,
        examples: tool.examples,
        faq: tool.faq,
        engineKey: tool.runner.engineKey,
        engineParams: tool.runner.engineParams,
        limits: tool.limits
      },
      create: {
        id: tool.id,
        slug: tool.slug,
        name: tool.name,
        description: tool.description,
        category: tool.category,
        tags: tool.tags,
        kind: tool.kind,
        isAi: tool.isAi,
        tier: tool.tier,
        seoTitle: tool.seoTitle,
        seoDescription: tool.seoDescription,
        examples: tool.examples,
        faq: tool.faq,
        engineKey: tool.runner.engineKey,
        engineParams: tool.runner.engineParams,
        limits: tool.limits
      }
    });
  }
  console.log(`Seeded ${toolRegistry.length} tools`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
