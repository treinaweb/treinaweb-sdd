import { Atendimento } from "./atendimento.entidade";

export interface AtendimentoRepositorio {
  salvar(atendimento: Atendimento): Promise<Atendimento>;
  buscarPorId(id: string): Promise<Atendimento | null>;
  listarPorIntervalo(inicio: Date, fim: Date): Promise<Atendimento[]>;
  listarPorDia(data: Date): Promise<Atendimento[]>;
}
