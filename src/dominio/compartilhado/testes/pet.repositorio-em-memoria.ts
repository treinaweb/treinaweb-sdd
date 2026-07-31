import { Pet } from "../../pet/pet.entidade";
import { PetRepositorio } from "../../pet/pet.repositorio";

export class PetRepositorioEmMemoria implements PetRepositorio {
  private readonly pets = new Map<string, Pet>();
  private proximoId = 1;

  async salvar(pet: Pet): Promise<Pet> {
    const id = pet.id ?? String(this.proximoId++);
    const petSalvo = new Pet({ ...pet, id });
    this.pets.set(id, petSalvo);
    return petSalvo;
  }

  async buscarPorId(id: string): Promise<Pet | null> {
    return this.pets.get(id) ?? null;
  }

  async listarPorTutor(tutorId: string): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter((pet) => pet.tutorId === tutorId);
  }

  async listar(): Promise<Pet[]> {
    return Array.from(this.pets.values());
  }

  async excluir(id: string): Promise<void> {
    this.pets.delete(id);
  }
}
