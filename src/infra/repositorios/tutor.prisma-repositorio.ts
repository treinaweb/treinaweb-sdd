import { Tutor } from "@/dominio/tutor/tutor.entidade";
import { TutorRepositorio } from "@/dominio/tutor/tutor.repositorio";
import { prismaCliente } from "@/infra/prisma-cliente";
import type { Tutor as TutorPrisma } from "@/generated/prisma/client";

function paraEntidade(registro: TutorPrisma): Tutor {
  return new Tutor({
    id: registro.id,
    nome: registro.nome,
    email: registro.email,
    telefone: registro.telefone ?? undefined,
    ativo: registro.ativo,
  });
}

class TutorPrismaRepositorio implements TutorRepositorio {
  async salvar(tutor: Tutor): Promise<Tutor> {
    const dados = {
      nome: tutor.nome,
      email: tutor.email,
      telefone: tutor.telefone ?? null,
      ativo: tutor.ativo,
    };

    const registro = tutor.id
      ? await prismaCliente.tutor.update({ where: { id: tutor.id }, data: dados })
      : await prismaCliente.tutor.create({ data: dados });

    return paraEntidade(registro);
  }

  async buscarPorId(id: string): Promise<Tutor | null> {
    const registro = await prismaCliente.tutor.findUnique({ where: { id } });
    return registro ? paraEntidade(registro) : null;
  }

  async buscarPorEmail(email: string): Promise<Tutor | null> {
    const registro = await prismaCliente.tutor.findUnique({ where: { email } });
    return registro ? paraEntidade(registro) : null;
  }

  async listar(): Promise<Tutor[]> {
    const registros = await prismaCliente.tutor.findMany({ orderBy: { nome: "asc" } });
    return registros.map(paraEntidade);
  }

  async excluir(id: string): Promise<void> {
    await prismaCliente.tutor.delete({ where: { id } });
  }
}

export const tutorPrismaRepositorio = new TutorPrismaRepositorio();
