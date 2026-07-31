import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";

export type StatusAtendimento = "AGENDADO" | "CONCLUIDO" | "CANCELADO";

const DURACAO_MINUTOS = 60;

export interface DadosAtendimento {
  id?: string;
  petId: string;
  inicio: Date;
  status?: StatusAtendimento;
}

export class Atendimento {
  readonly id?: string;
  readonly petId: string;
  readonly inicio: Date;
  readonly fim: Date;
  readonly status: StatusAtendimento;

  constructor(dados: DadosAtendimento) {
    this.id = dados.id;
    this.petId = dados.petId;
    this.inicio = dados.inicio;
    this.fim = new Date(dados.inicio.getTime() + DURACAO_MINUTOS * 60 * 1000);
    this.status = dados.status ?? "AGENDADO";
  }

  validar(): ErroDeDominio[] {
    const erros: ErroDeDominio[] = [];

    if (Number.isNaN(this.inicio.getTime())) {
      erros.push(new ErroDeDominio("ATENDIMENTO.DATA_INVALIDA", "inicio"));
    }

    return erros;
  }
}
