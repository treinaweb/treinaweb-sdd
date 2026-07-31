import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { prepararBancoDeTesteIsolado } from "@/infra/testes/banco-de-teste-isolado";

// revalidatePath depende do contexto de requisição do Next.js, inexistente ao chamar a
// Server Action diretamente no teste; mockado para exercitar só persistência e domínio.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function formDataDeTutor(dados: { nome: string; email: string }): FormData {
  const formData = new FormData();
  formData.set("nome", dados.nome);
  formData.set("email", dados.email);
  return formData;
}

function formDataDePet(dados: {
  tutorId: string;
  nome: string;
  especie: string;
  porte: string;
}): FormData {
  const formData = new FormData();
  formData.set("tutorId", dados.tutorId);
  formData.set("nome", dados.nome);
  formData.set("especie", dados.especie);
  formData.set("porte", dados.porte);
  return formData;
}

describe("Server Action salvarPet (integração com SQLite isolado)", () => {
  let limpar: () => void;

  beforeAll(async () => {
    ({ limpar } = prepararBancoDeTesteIsolado());
  });

  afterAll(async () => {
    await limpar();
  });

  it("persiste um pet válido para um tutor existente e ativo", async () => {
    const { salvarTutor } = await import("./tutor.acoes");
    const { salvarPet } = await import("./pet.acoes");
    const { tutorPrismaRepositorio } = await import("@/infra/repositorios/tutor.prisma-repositorio");
    const { petPrismaRepositorio } = await import("@/infra/repositorios/pet.prisma-repositorio");

    await salvarTutor({ ok: true }, formDataDeTutor({ nome: "Diego Alves", email: "diego@exemplo.com" }));
    const tutor = await tutorPrismaRepositorio.buscarPorEmail("diego@exemplo.com");

    const resultado = await salvarPet(
      { ok: true },
      formDataDePet({ tutorId: tutor?.id as string, nome: "Rex", especie: "CACHORRO", porte: "M" }),
    );

    expect(resultado.ok).toBe(true);
    const petsDoTutor = await petPrismaRepositorio.listarPorTutor(tutor?.id as string);
    expect(petsDoTutor).toHaveLength(1);
    expect(petsDoTutor[0].nome).toBe("Rex");
  });

  it("falha com PET.TUTOR_NAO_ENCONTRADO quando o tutor informado não existe", async () => {
    const { salvarPet } = await import("./pet.acoes");

    const resultado = await salvarPet(
      { ok: true },
      formDataDePet({ tutorId: "id-inexistente", nome: "Mimi", especie: "GATO", porte: "P" }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("PET.TUTOR_NAO_ENCONTRADO");
      // Regressão: os erros devem ser objetos simples (serializáveis pelo React/Flight
      // ao cruzar de Server Action para Client Component), não instâncias de ErroDeDominio.
      expect(Object.getPrototypeOf(resultado.erros[0])).toBe(Object.prototype);
    }
  });
});
