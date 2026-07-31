import { Resultado } from "@/dominio/compartilhado/resultado";

export function paraResultadoSerializavel<T>(resultado: Resultado<T>): Resultado<T> {
  if (resultado.ok) {
    return resultado;
  }

  return {
    ok: false,
    erros: resultado.erros.map((erro) => ({ codigo: erro.codigo, campo: erro.campo })),
  };
}
