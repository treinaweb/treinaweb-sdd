import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";

export interface DadosTutor {
  id?: string;
  nome: string;
  email: string;
  telefone?: string;
  ativo?: boolean;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Tutor {
  readonly id?: string;
  readonly nome: string;
  readonly email: string;
  readonly telefone?: string;
  readonly ativo: boolean;

  constructor(dados: DadosTutor) {
    this.id = dados.id;
    this.nome = dados.nome.trim();
    this.email = dados.email.trim().toLowerCase();
    this.telefone = dados.telefone ? dados.telefone.replace(/\D/g, "") : undefined;
    this.ativo = dados.ativo ?? true;
  }

  validar(): ErroDeDominio[] {
    const erros: ErroDeDominio[] = [];

    const palavrasDoNome = this.nome.split(/\s+/).filter((palavra) => palavra.length > 0);
    if (palavrasDoNome.length < 2) {
      erros.push(new ErroDeDominio("TUTOR.NOME_INVALIDO", "nome"));
    }

    if (!REGEX_EMAIL.test(this.email)) {
      erros.push(new ErroDeDominio("TUTOR.EMAIL_INVALIDO", "email"));
    }

    if (this.telefone !== undefined && this.telefone.length === 0) {
      erros.push(new ErroDeDominio("TUTOR.TELEFONE_INVALIDO", "telefone"));
    }

    return erros;
  }
}
