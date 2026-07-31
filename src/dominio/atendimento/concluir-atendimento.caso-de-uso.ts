import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";
import { falha, ok, Resultado } from "../compartilhado/resultado";
import { Atendimento } from "./atendimento.entidade";
import { AtendimentoRepositorio } from "./atendimento.repositorio";

export class ConcluirAtendimentoCasoDeUso {
  constructor(private readonly repositorio: AtendimentoRepositorio) {}

  async executar(id: string): Promise<Resultado<void>> {
    const atendimento = await this.repositorio.buscarPorId(id);
    if (!atendimento) {
      return falha([new ErroDeDominio("ATENDIMENTO.NAO_ENCONTRADO")]);
    }

    if (atendimento.status !== "AGENDADO") {
      return falha([new ErroDeDominio("ATENDIMENTO.STATUS_INVALIDO")]);
    }

    const concluido = new Atendimento({ ...atendimento, status: "CONCLUIDO" });
    await this.repositorio.salvar(concluido);
    return ok();
  }
}
