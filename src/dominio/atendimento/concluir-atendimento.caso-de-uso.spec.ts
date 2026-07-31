import { describe, expect, it } from "vitest";

import { AtendimentoRepositorioEmMemoria } from "../compartilhado/testes/atendimento.repositorio-em-memoria";
import { Atendimento } from "./atendimento.entidade";
import { ConcluirAtendimentoCasoDeUso } from "./concluir-atendimento.caso-de-uso";

function data(ano: number, mes: number, dia: number, hora: number, minuto = 0): Date {
  return new Date(Date.UTC(ano, mes - 1, dia, hora, minuto, 0, 0));
}

const INICIO_DO_ATENDIMENTO = data(2026, 8, 3, 9, 0);

describe("ConcluirAtendimentoCasoDeUso", () => {
  it("conclui um atendimento AGENDADO", async () => {
    const repositorio = new AtendimentoRepositorioEmMemoria();
    const salvo = await repositorio.salvar(new Atendimento({ petId: "pet-1", inicio: INICIO_DO_ATENDIMENTO }));
    const casoDeUso = new ConcluirAtendimentoCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(salvo.id as string);

    expect(resultado.ok).toBe(true);
    const atualizado = await repositorio.buscarPorId(salvo.id as string);
    expect(atualizado?.status).toBe("CONCLUIDO");
  });

  it("falha com ATENDIMENTO.STATUS_INVALIDO ao concluir um atendimento que não está AGENDADO", async () => {
    const repositorio = new AtendimentoRepositorioEmMemoria();
    const salvo = await repositorio.salvar(
      new Atendimento({ petId: "pet-1", inicio: INICIO_DO_ATENDIMENTO, status: "CANCELADO" }),
    );
    const casoDeUso = new ConcluirAtendimentoCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(salvo.id as string);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.STATUS_INVALIDO");
    }
  });

  it("falha com ATENDIMENTO.NAO_ENCONTRADO quando o atendimento não existe", async () => {
    const repositorio = new AtendimentoRepositorioEmMemoria();
    const casoDeUso = new ConcluirAtendimentoCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar("id-inexistente");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.NAO_ENCONTRADO");
    }
  });
});
