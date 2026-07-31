import { Atendimento } from "../../atendimento/atendimento.entidade";
import { AtendimentoRepositorio } from "../../atendimento/atendimento.repositorio";

export class AtendimentoRepositorioEmMemoria implements AtendimentoRepositorio {
  private readonly atendimentos = new Map<string, Atendimento>();
  private proximoId = 1;

  async salvar(atendimento: Atendimento): Promise<Atendimento> {
    const id = atendimento.id ?? String(this.proximoId++);
    const salvo = new Atendimento({ ...atendimento, id });
    this.atendimentos.set(id, salvo);
    return salvo;
  }

  async buscarPorId(id: string): Promise<Atendimento | null> {
    return this.atendimentos.get(id) ?? null;
  }

  async listarPorIntervalo(inicio: Date, fim: Date): Promise<Atendimento[]> {
    return Array.from(this.atendimentos.values()).filter(
      (atendimento) =>
        atendimento.inicio.getTime() < fim.getTime() && inicio.getTime() < atendimento.fim.getTime(),
    );
  }

  async listarPorDia(data: Date): Promise<Atendimento[]> {
    const inicioDoDia = new Date(
      Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), 0, 0, 0, 0),
    );
    const fimDoDia = new Date(
      Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate() + 1, 0, 0, 0, 0),
    );

    return Array.from(this.atendimentos.values())
      .filter(
        (atendimento) =>
          atendimento.inicio.getTime() >= inicioDoDia.getTime() &&
          atendimento.inicio.getTime() < fimDoDia.getTime(),
      )
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }
}
