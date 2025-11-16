import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client with production-grade configuration
 * - Connection pooling
 * - Query logging in development
 * - Error handling
 * - Connection retry logic
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

/**
 * Utility function to check database connectivity
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // Silently handle connection check failure
    return false;
  }
}

/**
 * Utility function to execute query with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}
