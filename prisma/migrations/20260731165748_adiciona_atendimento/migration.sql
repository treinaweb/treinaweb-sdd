-- CreateTable
CREATE TABLE "Atendimento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petId" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Atendimento_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Atendimento_petId_idx" ON "Atendimento"("petId");

-- CreateIndex
CREATE INDEX "Atendimento_inicio_fim_idx" ON "Atendimento"("inicio", "fim");
