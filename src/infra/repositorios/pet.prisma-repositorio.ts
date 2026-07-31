import { DadosPet, Pet } from "@/dominio/pet/pet.entidade";
import { PetRepositorio } from "@/dominio/pet/pet.repositorio";
import { prismaCliente } from "@/infra/prisma-cliente";
import type { Pet as PetPrisma } from "@/generated/prisma/client";

function paraEntidade(registro: PetPrisma): Pet {
  return new Pet({
    id: registro.id,
    tutorId: registro.tutorId,
    nome: registro.nome,
    especie: registro.especie as DadosPet["especie"],
    porte: registro.porte as DadosPet["porte"],
    observacoes: registro.observacoes ?? undefined,
    ativo: registro.ativo,
  });
}

class PetPrismaRepositorio implements PetRepositorio {
  async salvar(pet: Pet): Promise<Pet> {
    const dados = {
      tutorId: pet.tutorId,
      nome: pet.nome,
      especie: pet.especie,
      porte: pet.porte,
      observacoes: pet.observacoes ?? null,
      ativo: pet.ativo,
    };

    const registro = pet.id
      ? await prismaCliente.pet.update({ where: { id: pet.id }, data: dados })
      : await prismaCliente.pet.create({ data: dados });

    return paraEntidade(registro);
  }

  async buscarPorId(id: string): Promise<Pet | null> {
    const registro = await prismaCliente.pet.findUnique({ where: { id } });
    return registro ? paraEntidade(registro) : null;
  }

  async listarPorTutor(tutorId: string): Promise<Pet[]> {
    const registros = await prismaCliente.pet.findMany({
      where: { tutorId },
      orderBy: { nome: "asc" },
    });
    return registros.map(paraEntidade);
  }

  async listar(): Promise<Pet[]> {
    const registros = await prismaCliente.pet.findMany({ orderBy: { nome: "asc" } });
    return registros.map(paraEntidade);
  }

  async excluir(id: string): Promise<void> {
    await prismaCliente.pet.delete({ where: { id } });
  }
}

export const petPrismaRepositorio = new PetPrismaRepositorio();
