import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function prepararBancoDeTesteIsolado(): { limpar: () => Promise<void> } {
  const caminhoBanco = path.join(os.tmpdir(), `sdd-app-teste-${randomUUID()}.db`);
  const urlBanco = `file:${caminhoBanco}`;

  execSync("npx prisma migrate deploy", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: urlBanco },
    stdio: "pipe",
  });

  process.env.DATABASE_URL = urlBanco;

  return {
    limpar: async () => {
      const { prismaCliente } = await import("@/infra/prisma-cliente");
      await prismaCliente.$disconnect();
      fs.rmSync(caminhoBanco, { force: true });
      fs.rmSync(`${caminhoBanco}-journal`, { force: true });
    },
  };
}
