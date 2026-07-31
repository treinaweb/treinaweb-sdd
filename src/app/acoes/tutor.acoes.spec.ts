import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { prepararBancoDeTesteIsolado } from "@/infra/testes/banco-de-teste-isolado";

// revalidatePath depende do contexto de requisição do Next.js, inexistente ao chamar a
// Server Action diretamente no teste; mockado para exercitar só persistência e domínio.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function formDataDeTutor(dados: { nome: string; email: string; telefone?: string }): FormData {
  const formData = new FormData();
  formData.set("nome", dados.nome);
  formData.set("email", dados.email);
  if (dados.telefone) {
    formData.set("telefone", dados.telefone);
  }
  return formData;
}

describe("Server Action salvarTutor (integração com SQLite isolado)", () => {
  let limpar: () => void;

  beforeAll(async () => {
    ({ limpar } = prepararBancoDeTesteIsolado());
  });

  afterAll(async () => {
    await limpar();
  });

  it("persiste um tutor válido no banco", async () => {
    const { salvarTutor } = await import("./tutor.acoes");

    const resultado = await salvarTutor(
      { ok: true },
      formDataDeTutor({ nome: "Ana Souza", email: "ana@exemplo.com" }),
    );

    expect(resultado.ok).toBe(true);

    const { tutorPrismaRepositorio } = await import("@/infra/repositorios/tutor.prisma-repositorio");
    const tutorSalvo = await tutorPrismaRepositorio.buscarPorEmail("ana@exemplo.com");
    expect(tutorSalvo).not.toBeNull();
    expect(tutorSalvo?.nome).toBe("Ana Souza");
  });

  it("falha com TUTOR.EMAIL_DUPLICADO ao salvar um segundo tutor com o mesmo e-mail", async () => {
    const { salvarTutor } = await import("./tutor.acoes");

    await salvarTutor({ ok: true }, formDataDeTutor({ nome: "Bruno Lima", email: "duplicado@exemplo.com" }));

    const resultado = await salvarTutor(
      { ok: true },
      formDataDeTutor({ nome: "Carla Reis", email: "duplicado@exemplo.com" }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("TUTOR.EMAIL_DUPLICADO");
      // Regressão: os erros devem ser objetos simples (serializáveis pelo React/Flight
      // ao cruzar de Server Action para Client Component), não instâncias de ErroDeDominio.
      expect(Object.getPrototypeOf(resultado.erros[0])).toBe(Object.prototype);
    }
  });
});
