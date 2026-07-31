"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AgendarAtendimentoCasoDeUso } from "@/dominio/atendimento/agendar-atendimento.caso-de-uso";
import { CancelarAtendimentoCasoDeUso } from "@/dominio/atendimento/cancelar-atendimento.caso-de-uso";
import { ConcluirAtendimentoCasoDeUso } from "@/dominio/atendimento/concluir-atendimento.caso-de-uso";
import { Resultado } from "@/dominio/compartilhado/resultado";
import { atendimentoPrismaRepositorio } from "@/infra/repositorios/atendimento.prisma-repositorio";
import { petPrismaRepositorio } from "@/infra/repositorios/pet.prisma-repositorio";
import { tutorPrismaRepositorio } from "@/infra/repositorios/tutor.prisma-repositorio";

import { paraResultadoSerializavel } from "./resultado-serializavel";

// A recepção opera em America/Sao_Paulo (UTC-3 o ano todo, sem horário de verão desde
// 2019). Nesta borda resolvemos "data" + "hora" (horário local da recepção) para um
// Date cujos campos UTC representam diretamente o horário local — é essa mesma
// convenção que o domínio usa para comparar janelas (ver .spec/memory/contexto-tecnico.md
// e ATENDIMENTO.FORA_DO_EXPEDIENTE em agendar-atendimento.caso-de-uso.ts).
const OFFSET_BRT_HORAS = 3;

function paraInicioNoDominio(data: string, hora: string): Date {
  const [ano, mes, dia] = data.split("-").map(Number);
  const [horaValor, minutoValor] = hora.split(":").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia, horaValor, minutoValor, 0, 0));
}

function agoraNoDominio(): Date {
  // Os campos UTC de "agora - 3h" já são, numericamente, os campos de hora local de
  // America/Sao_Paulo — a mesma convenção usada em paraInicioNoDominio, sem precisar
  // reconstruir o Date.
  return new Date(Date.now() - OFFSET_BRT_HORAS * 60 * 60 * 1000);
}

const esquemaAgendarAtendimento = z.object({
  petId: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
});

function paraDadosDoFormulario(formData: FormData) {
  return {
    petId: formData.get("petId")?.toString() ?? "",
    data: formData.get("data")?.toString() ?? "",
    hora: formData.get("hora")?.toString() ?? "",
  };
}

export async function agendarAtendimento(
  _estadoAnterior: Resultado<void>,
  formData: FormData,
): Promise<Resultado<void>> {
  const dadosValidados = esquemaAgendarAtendimento.parse(paraDadosDoFormulario(formData));
  const inicio = paraInicioNoDominio(dadosValidados.data, dadosValidados.hora);

  const resultado = await new AgendarAtendimentoCasoDeUso(
    atendimentoPrismaRepositorio,
    petPrismaRepositorio,
    tutorPrismaRepositorio,
  ).executar({ petId: dadosValidados.petId, inicio }, agoraNoDominio());

  if (resultado.ok) {
    revalidatePath("/agenda");
  }

  return paraResultadoSerializavel(resultado);
}

export async function concluirAtendimento(id: string): Promise<Resultado<void>> {
  const resultado = await new ConcluirAtendimentoCasoDeUso(atendimentoPrismaRepositorio).executar(id);

  if (resultado.ok) {
    revalidatePath("/agenda");
  }

  return paraResultadoSerializavel(resultado);
}

export async function cancelarAtendimento(id: string): Promise<Resultado<void>> {
  const resultado = await new CancelarAtendimentoCasoDeUso(atendimentoPrismaRepositorio).executar(
    id,
    agoraNoDominio(),
  );

  if (resultado.ok) {
    revalidatePath("/agenda");
  }

  return paraResultadoSerializavel(resultado);
}
