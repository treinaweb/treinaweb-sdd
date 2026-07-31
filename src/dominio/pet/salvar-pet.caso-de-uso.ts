import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";
import { falha, ok, Resultado } from "../compartilhado/resultado";
import { TutorRepositorio } from "../tutor/tutor.repositorio";
import { DadosPet, Pet } from "./pet.entidade";
import { PetRepositorio } from "./pet.repositorio";

export class SalvarPetCasoDeUso {
  constructor(
    private readonly repositorio: PetRepositorio,
    private readonly tutorRepositorio: TutorRepositorio,
  ) {}

  async executar(dados: DadosPet): Promise<Resultado<void>> {
    const pet = new Pet(dados);

    const errosDeFormato = pet.validar();
    if (errosDeFormato.length > 0) {
      return falha(errosDeFormato);
    }

    const tutor = await this.tutorRepositorio.buscarPorId(pet.tutorId);
    if (!tutor) {
      return falha([new ErroDeDominio("PET.TUTOR_NAO_ENCONTRADO", "tutorId")]);
    }

    if (!tutor.ativo) {
      return falha([new ErroDeDominio("PET.TUTOR_INATIVO", "tutorId")]);
    }

    await this.repositorio.salvar(pet);
    return ok();
  }
}
