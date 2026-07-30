import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@/generated/prisma/client";

const globalParaPrisma = globalThis as unknown as {
  prismaCliente: PrismaClient | undefined;
};

const adaptador = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

export const prismaCliente =
  globalParaPrisma.prismaCliente ?? new PrismaClient({ adapter: adaptador });

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prismaCliente = prismaCliente;
}
