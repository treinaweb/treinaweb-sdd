import { ErroDeDominio } from "./erro-de-dominio.erro";

export type Resultado<T = void> =
  | { ok: true; dados?: T }
  | { ok: false; erros: ErroDeDominio[] };

export function ok<T = void>(dados?: T): Resultado<T> {
  return { ok: true, dados };
}

export function falha<T = void>(erros: ErroDeDominio[]): Resultado<T> {
  return { ok: false, erros };
}
