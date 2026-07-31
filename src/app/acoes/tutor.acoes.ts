"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Resultado } from "@/dominio/compartilhado/resultado";
import { InativarTutorCasoDeUso } from "@/dominio/tutor/inativar-tutor.caso-de-uso";
import { SalvarTutorCasoDeUso } from "@/dominio/tutor/salvar-tutor.caso-de-uso";
import { tutorPrismaRepositorio } from "@/infra/repositorios/tutor.prisma-repositorio";

import { paraResultadoSerializavel } from "./resultado-serializavel";

const esquemaSalvarTutor = z.object({
  id: z.string().optional(),
  nome: z.string(),
  email: z.string(),
  telefone: z.string().optional(),
});

function paraDadosDoFormulario(formData: FormData) {
  return {
    id: formData.get("id")?.toString() || undefined,
    nome: formData.get("nome")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    telefone: formData.get("telefone")?.toString() || undefined,
  };
}

export async function salvarTutor(
  _estadoAnterior: Resultado<void>,
  formData: FormData,
): Promise<Resultado<void>> {
  const dados = esquemaSalvarTutor.parse(paraDadosDoFormulario(formData));

  const resultado = await new SalvarTutorCasoDeUso(tutorPrismaRepositorio).executar(dados);

  if (resultado.ok) {
    revalidatePath("/tutores");
  }

  return paraResultadoSerializavel(resultado);
}

export async function inativarTutor(id: string): Promise<Resultado<void>> {
  const resultado = await new InativarTutorCasoDeUso(tutorPrismaRepositorio).executar(id);

  if (resultado.ok) {
    revalidatePath("/tutores");
  }

  return paraResultadoSerializavel(resultado);
}
