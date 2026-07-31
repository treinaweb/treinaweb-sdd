import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";
import { falha, ok, Resultado } from "../compartilhado/resultado";
import { Atendimento } from "./atendimento.entidade";
import { AtendimentoRepositorio } from "./atendimento.repositorio";

const ANTECEDENCIA_MINIMA_MS = 2 * 60 * 60 * 1000;

export class CancelarAtendimentoCasoDeUso {
  constructor(private readonly repositorio: AtendimentoRepositorio) {}

  async executar(id: string, agora: Date): Promise<Resultado<void>> {
    const atendimento = await this.repositorio.buscarPorId(id);
    if (!atendimento) {
      return falha([new ErroDeDominio("ATENDIMENTO.NAO_ENCONTRADO")]);
    }

    if (atendimento.status !== "AGENDADO") {
      return falha([new ErroDeDominio("ATENDIMENTO.STATUS_INVALIDO")]);
    }

    if (atendimento.inicio.getTime() - agora.getTime() < ANTECEDENCIA_MINIMA_MS) {
      return falha([new ErroDeDominio("ATENDIMENTO.CANCELAMENTO_FORA_DO_PRAZO")]);
    }

    const cancelado = new Atendimento({ ...atendimento, status: "CANCELADO" });
    await this.repositorio.salvar(cancelado);
    return ok();
  }
}
