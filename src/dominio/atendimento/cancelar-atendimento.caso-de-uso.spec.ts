import { describe, expect, it } from "vitest";

import { AtendimentoRepositorioEmMemoria } from "../compartilhado/testes/atendimento.repositorio-em-memoria";
import { Atendimento } from "./atendimento.entidade";
import { CancelarAtendimentoCasoDeUso } from "./cancelar-atendimento.caso-de-uso";

function data(ano: number, mes: number, dia: number, hora: number, minuto = 0): Date {
  return new Date(Date.UTC(ano, mes - 1, dia, hora, minuto, 0, 0));
}

const INICIO_DO_ATENDIMENTO = data(2026, 8, 3, 14, 0);

describe("CancelarAtendimentoCasoDeUso", () => {
  it("cancela um atendimento AGENDADO com mais de 2 horas de antecedência", async () => {
    const repositorio = new AtendimentoRepositorioEmMemoria();
    const salvo = await repositorio.salvar(new Atendimento({ petId: "pet-1", inicio: INICIO_DO_ATENDIMENTO }));
    const agoraComMargem = data(2026, 8, 3, 11, 0);
    const casoDeUso = new CancelarAtendimentoCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(salvo.id as string, agoraComMargem);

    expect(resultado.ok).toBe(true);
    const atualizado = await repositorio.buscarPorId(salvo.id as string);
    expect(atualizado?.status).toBe("CANCELADO");
  });

  it("falha com ATENDIMENTO.CANCELAMENTO_FORA_DO_PRAZO com menos de 2 horas de antecedência", async () => {
    const repositorio = new AtendimentoRepositorioEmMemoria();
    const salvo = await repositorio.salvar(new Atendimento({ petId: "pet-1", inicio: INICIO_DO_ATENDIMENTO }));
    const agoraSemMargem = data(2026, 8, 3, 13, 0);
    const casoDeUso = new CancelarAtendimentoCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(salvo.id as string, agoraSemMargem);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.CANCELAMENTO_FORA_DO_PRAZO");
    }
    const inalterado = await repositorio.buscarPorId(salvo.id as string);
    expect(inalterado?.status).toBe("AGENDADO");
  });

  it("falha com ATENDIMENTO.STATUS_INVALIDO ao cancelar um atendimento que não está AGENDADO", async () => {
    const repositorio = new AtendimentoRepositorioEmMemoria();
    const salvo = await repositorio.salvar(
      new Atendimento({ petId: "pet-1", inicio: INICIO_DO_ATENDIMENTO, status: "CONCLUIDO" }),
    );
    const casoDeUso = new CancelarAtendimentoCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(salvo.id as string, data(2026, 8, 3, 8, 0));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.STATUS_INVALIDO");
    }
  });

  it("falha com ATENDIMENTO.NAO_ENCONTRADO quando o atendimento não existe", async () => {
    const repositorio = new AtendimentoRepositorioEmMemoria();
    const casoDeUso = new CancelarAtendimentoCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar("id-inexistente", data(2026, 8, 3, 8, 0));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.NAO_ENCONTRADO");
    }
  });
});
