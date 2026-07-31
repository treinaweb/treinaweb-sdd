import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";
import { falha, ok, Resultado } from "../compartilhado/resultado";
import { Tutor } from "./tutor.entidade";
import { TutorRepositorio } from "./tutor.repositorio";

export class InativarTutorCasoDeUso {
  constructor(private readonly repositorio: TutorRepositorio) {}

  async executar(id: string): Promise<Resultado<void>> {
    const tutor = await this.repositorio.buscarPorId(id);
    if (!tutor) {
      return falha([new ErroDeDominio("TUTOR.NAO_ENCONTRADO")]);
    }

    const tutorInativo = new Tutor({ ...tutor, ativo: false });
    await this.repositorio.salvar(tutorInativo);
    return ok();
  }
}
