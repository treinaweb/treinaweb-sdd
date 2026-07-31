import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { prepararBancoDeTesteIsolado } from "@/infra/testes/banco-de-teste-isolado";

// revalidatePath depende do contexto de requisição do Next.js, inexistente ao chamar a
// Server Action diretamente no teste; mockado para exercitar só persistência e domínio
// (mesmo desvio documentado em tutor.acoes.spec.ts / pet.acoes.spec.ts).
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const OFFSET_BRT_HORAS = 3;

function agoraNoDominio(): Date {
  return new Date(Date.now() - OFFSET_BRT_HORAS * 60 * 60 * 1000);
}

// Horário comercial futuro e determinístico em relação ao momento real de execução do
// teste: pelo menos `diasMinimos` dias à frente (nunca cai em ATENDIMENTO.DATA_NO_PASSADO)
// e nunca em domingo (nunca cai em ATENDIMENTO.FORA_DO_EXPEDIENTE por causa do dia).
function horarioComercialFuturo(diasMinimos: number, hora: number): { data: string; hora: string } {
  const candidato = new Date(agoraNoDominio().getTime() + diasMinimos * 24 * 60 * 60 * 1000);
  while (candidato.getUTCDay() === 0) {
    candidato.setUTCDate(candidato.getUTCDate() + 1);
  }
  const ano = candidato.getUTCFullYear();
  const mes = String(candidato.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(candidato.getUTCDate()).padStart(2, "0");
  return { data: `${ano}-${mes}-${dia}`, hora: `${String(hora).padStart(2, "0")}:00` };
}

function formDataDeTutor(dados: { nome: string; email: string }): FormData {
  const formData = new FormData();
  formData.set("nome", dados.nome);
  formData.set("email", dados.email);
  return formData;
}

function formDataDePet(dados: { tutorId: string; nome: string; especie: string; porte: string }): FormData {
  const formData = new FormData();
  formData.set("tutorId", dados.tutorId);
  formData.set("nome", dados.nome);
  formData.set("especie", dados.especie);
  formData.set("porte", dados.porte);
  return formData;
}

function formDataDeAtendimento(dados: { petId: string; data: string; hora: string }): FormData {
  const formData = new FormData();
  formData.set("petId", dados.petId);
  formData.set("data", dados.data);
  formData.set("hora", dados.hora);
  return formData;
}

describe("Server Actions de atendimento (integração com SQLite isolado)", () => {
  let limpar: () => void;

  beforeAll(async () => {
    ({ limpar } = prepararBancoDeTesteIsolado());
  });

  afterAll(async () => {
    await limpar();
  });

  async function criarPetAtivo(sufixo: string) {
    const { salvarTutor } = await import("./tutor.acoes");
    const { salvarPet } = await import("./pet.acoes");
    const { tutorPrismaRepositorio } = await import("@/infra/repositorios/tutor.prisma-repositorio");
    const { petPrismaRepositorio } = await import("@/infra/repositorios/pet.prisma-repositorio");

    await salvarTutor(
      { ok: true },
      formDataDeTutor({ nome: `Tutor Atendimento ${sufixo}`, email: `tutor.atendimento.${sufixo}@exemplo.com` }),
    );
    const tutor = await tutorPrismaRepositorio.buscarPorEmail(`tutor.atendimento.${sufixo}@exemplo.com`);
    await salvarPet(
      { ok: true },
      formDataDePet({ tutorId: tutor?.id as string, nome: `Rex ${sufixo}`, especie: "CACHORRO", porte: "M" }),
    );
    const pets = await petPrismaRepositorio.listarPorTutor(tutor?.id as string);
    return pets[0].id as string;
  }

  it("persiste um atendimento válido para um pet ativo dentro do expediente", async () => {
    const { agendarAtendimento } = await import("./atendimento.acoes");
    const { atendimentoPrismaRepositorio } = await import("@/infra/repositorios/atendimento.prisma-repositorio");

    const petId = await criarPetAtivo("agendar-sucesso");
    const { data, hora } = horarioComercialFuturo(3, 10);

    const resultado = await agendarAtendimento({ ok: true }, formDataDeAtendimento({ petId, data, hora }));

    expect(resultado.ok).toBe(true);
    const [ano, mes, dia] = data.split("-").map(Number);
    const atendimentosDoDia = await atendimentoPrismaRepositorio.listarPorDia(new Date(Date.UTC(ano, mes - 1, dia)));
    expect(atendimentosDoDia).toHaveLength(1);
    expect(atendimentosDoDia[0].petId).toBe(petId);
    expect(atendimentosDoDia[0].status).toBe("AGENDADO");
  });

  it("falha com ATENDIMENTO.PET_NAO_ENCONTRADO quando o pet informado não existe", async () => {
    const { agendarAtendimento } = await import("./atendimento.acoes");
    const { data, hora } = horarioComercialFuturo(3, 11);

    const resultado = await agendarAtendimento(
      { ok: true },
      formDataDeAtendimento({ petId: "id-inexistente", data, hora }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.PET_NAO_ENCONTRADO");
      // Regressão: erros devolvidos ao cliente precisam ser objetos simples serializáveis
      // pelo protocolo Flight do React, nunca instâncias de ErroDeDominio (ver
      // src/app/acoes/resultado-serializavel.ts e o adendo pós-conclusão da spec 003).
      expect(Object.getPrototypeOf(resultado.erros[0])).toBe(Object.prototype);
    }
  });

  it("conclui um atendimento AGENDADO", async () => {
    const { agendarAtendimento, concluirAtendimento } = await import("./atendimento.acoes");
    const { atendimentoPrismaRepositorio } = await import("@/infra/repositorios/atendimento.prisma-repositorio");

    const petId = await criarPetAtivo("concluir-sucesso");
    const { data, hora } = horarioComercialFuturo(4, 10);
    await agendarAtendimento({ ok: true }, formDataDeAtendimento({ petId, data, hora }));
    const [ano, mes, dia] = data.split("-").map(Number);
    const [criado] = await atendimentoPrismaRepositorio.listarPorDia(new Date(Date.UTC(ano, mes - 1, dia)));

    const resultado = await concluirAtendimento(criado.id as string);

    expect(resultado.ok).toBe(true);
    const atualizado = await atendimentoPrismaRepositorio.buscarPorId(criado.id as string);
    expect(atualizado?.status).toBe("CONCLUIDO");
  });

  it("falha com ATENDIMENTO.STATUS_INVALIDO ao concluir um atendimento que não está mais AGENDADO", async () => {
    const { concluirAtendimento } = await import("./atendimento.acoes");
    const { atendimentoPrismaRepositorio } = await import("@/infra/repositorios/atendimento.prisma-repositorio");
    const { Atendimento } = await import("@/dominio/atendimento/atendimento.entidade");

    const petId = await criarPetAtivo("concluir-erro");
    const jaConcluido = await atendimentoPrismaRepositorio.salvar(
      new Atendimento({ petId, inicio: new Date(agoraNoDominio().getTime() + 5 * 60 * 60 * 1000), status: "CONCLUIDO" }),
    );

    const resultado = await concluirAtendimento(jaConcluido.id as string);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.STATUS_INVALIDO");
    }
  });

  it("cancela um atendimento AGENDADO com mais de 2 horas de antecedência", async () => {
    const { cancelarAtendimento } = await import("./atendimento.acoes");
    const { atendimentoPrismaRepositorio } = await import("@/infra/repositorios/atendimento.prisma-repositorio");
    const { Atendimento } = await import("@/dominio/atendimento/atendimento.entidade");

    const petId = await criarPetAtivo("cancelar-sucesso");
    const comMargem = await atendimentoPrismaRepositorio.salvar(
      new Atendimento({ petId, inicio: new Date(agoraNoDominio().getTime() + 3 * 60 * 60 * 1000) }),
    );

    const resultado = await cancelarAtendimento(comMargem.id as string);

    expect(resultado.ok).toBe(true);
    const atualizado = await atendimentoPrismaRepositorio.buscarPorId(comMargem.id as string);
    expect(atualizado?.status).toBe("CANCELADO");
  });

  it("falha com ATENDIMENTO.CANCELAMENTO_FORA_DO_PRAZO com menos de 2 horas de antecedência", async () => {
    const { cancelarAtendimento } = await import("./atendimento.acoes");
    const { atendimentoPrismaRepositorio } = await import("@/infra/repositorios/atendimento.prisma-repositorio");
    const { Atendimento } = await import("@/dominio/atendimento/atendimento.entidade");

    const petId = await criarPetAtivo("cancelar-erro");
    const semMargem = await atendimentoPrismaRepositorio.salvar(
      new Atendimento({ petId, inicio: new Date(agoraNoDominio().getTime() + 30 * 60 * 1000) }),
    );

    const resultado = await cancelarAtendimento(semMargem.id as string);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.CANCELAMENTO_FORA_DO_PRAZO");
    }
    const inalterado = await atendimentoPrismaRepositorio.buscarPorId(semMargem.id as string);
    expect(inalterado?.status).toBe("AGENDADO");
  });
});
