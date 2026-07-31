import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";

export type EspeciePet = "CACHORRO" | "GATO";
export type PortePet = "P" | "M" | "G";

const ESPECIES_VALIDAS: EspeciePet[] = ["CACHORRO", "GATO"];
const PORTES_VALIDOS: PortePet[] = ["P", "M", "G"];

export interface DadosPet {
  id?: string;
  tutorId: string;
  nome: string;
  especie: EspeciePet;
  porte: PortePet;
  observacoes?: string;
  ativo?: boolean;
}

export class Pet {
  readonly id?: string;
  readonly tutorId: string;
  readonly nome: string;
  readonly especie: EspeciePet;
  readonly porte: PortePet;
  readonly observacoes?: string;
  readonly ativo: boolean;

  constructor(dados: DadosPet) {
    this.id = dados.id;
    this.tutorId = dados.tutorId;
    this.nome = dados.nome.trim();
    this.especie = dados.especie;
    this.porte = dados.porte;
    this.observacoes = dados.observacoes?.trim();
    this.ativo = dados.ativo ?? true;
  }

  validar(): ErroDeDominio[] {
    const erros: ErroDeDominio[] = [];

    if (this.nome.length < 2) {
      erros.push(new ErroDeDominio("PET.NOME_INVALIDO", "nome"));
    }

    if (!ESPECIES_VALIDAS.includes(this.especie)) {
      erros.push(new ErroDeDominio("PET.ESPECIE_INVALIDA", "especie"));
    }

    if (!PORTES_VALIDOS.includes(this.porte)) {
      erros.push(new ErroDeDominio("PET.PORTE_INVALIDO", "porte"));
    }

    return erros;
  }
}
