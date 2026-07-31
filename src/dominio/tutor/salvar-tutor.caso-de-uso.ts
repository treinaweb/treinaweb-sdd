import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";
import { falha, ok, Resultado } from "../compartilhado/resultado";
import { DadosTutor, Tutor } from "./tutor.entidade";
import { TutorRepositorio } from "./tutor.repositorio";

export class SalvarTutorCasoDeUso {
  constructor(private readonly repositorio: TutorRepositorio) {}

  async executar(dados: DadosTutor): Promise<Resultado<void>> {
    const tutor = new Tutor(dados);

    const errosDeFormato = tutor.validar();
    if (errosDeFormato.length > 0) {
      return falha(errosDeFormato);
    }

    const existente = await this.repositorio.buscarPorEmail(tutor.email);
    if (existente && existente.id !== tutor.id) {
      return falha([new ErroDeDominio("TUTOR.EMAIL_DUPLICADO", "email")]);
    }

    await this.repositorio.salvar(tutor);
    return ok();
  }
}
