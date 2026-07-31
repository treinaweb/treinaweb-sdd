import { Atendimento, DadosAtendimento } from "@/dominio/atendimento/atendimento.entidade";
import { AtendimentoRepositorio } from "@/dominio/atendimento/atendimento.repositorio";
import { prismaCliente } from "@/infra/prisma-cliente";
import type { Atendimento as AtendimentoPrisma } from "@/generated/prisma/client";

function paraEntidade(registro: AtendimentoPrisma): Atendimento {
  return new Atendimento({
    id: registro.id,
    petId: registro.petId,
    inicio: registro.inicio,
    status: registro.status as DadosAtendimento["status"],
  });
}

function inicioEFimDoDia(data: Date): { inicioDoDia: Date; fimDoDia: Date } {
  const inicioDoDia = new Date(
    Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), 0, 0, 0, 0),
  );
  const fimDoDia = new Date(
    Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate() + 1, 0, 0, 0, 0),
  );
  return { inicioDoDia, fimDoDia };
}

class AtendimentoPrismaRepositorio implements AtendimentoRepositorio {
  async salvar(atendimento: Atendimento): Promise<Atendimento> {
    const dados = {
      petId: atendimento.petId,
      inicio: atendimento.inicio,
      fim: atendimento.fim,
      status: atendimento.status,
    };

    const registro = atendimento.id
      ? await prismaCliente.atendimento.update({ where: { id: atendimento.id }, data: dados })
      : await prismaCliente.atendimento.create({ data: dados });

    return paraEntidade(registro);
  }

  async buscarPorId(id: string): Promise<Atendimento | null> {
    const registro = await prismaCliente.atendimento.findUnique({ where: { id } });
    return registro ? paraEntidade(registro) : null;
  }

  async listarPorIntervalo(inicio: Date, fim: Date): Promise<Atendimento[]> {
    const registros = await prismaCliente.atendimento.findMany({
      where: { inicio: { lt: fim }, fim: { gt: inicio } },
      orderBy: { inicio: "asc" },
    });
    return registros.map(paraEntidade);
  }

  async listarPorDia(data: Date): Promise<Atendimento[]> {
    const { inicioDoDia, fimDoDia } = inicioEFimDoDia(data);
    const registros = await prismaCliente.atendimento.findMany({
      where: { inicio: { gte: inicioDoDia, lt: fimDoDia } },
      orderBy: { inicio: "asc" },
    });
    return registros.map(paraEntidade);
  }
}

export const atendimentoPrismaRepositorio = new AtendimentoPrismaRepositorio();
