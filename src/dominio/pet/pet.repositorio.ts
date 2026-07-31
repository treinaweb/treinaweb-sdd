import { Pet } from "./pet.entidade";

export interface PetRepositorio {
  salvar(pet: Pet): Promise<Pet>;
  buscarPorId(id: string): Promise<Pet | null>;
  listarPorTutor(tutorId: string): Promise<Pet[]>;
  listar(): Promise<Pet[]>;
  excluir(id: string): Promise<void>;
}
