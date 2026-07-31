"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Resultado } from "@/dominio/compartilhado/resultado";
import { DadosPet, EspeciePet, PortePet } from "@/dominio/pet/pet.entidade";
import { SalvarPetCasoDeUso } from "@/dominio/pet/salvar-pet.caso-de-uso";
import { petPrismaRepositorio } from "@/infra/repositorios/pet.prisma-repositorio";
import { tutorPrismaRepositorio } from "@/infra/repositorios/tutor.prisma-repositorio";

import { paraResultadoSerializavel } from "./resultado-serializavel";

const esquemaSalvarPet = z.object({
  id: z.string().optional(),
  tutorId: z.string(),
  nome: z.string(),
  especie: z.string(),
  porte: z.string(),
  observacoes: z.string().optional(),
});

function paraDadosDoFormulario(formData: FormData) {
  return {
    id: formData.get("id")?.toString() || undefined,
    tutorId: formData.get("tutorId")?.toString() ?? "",
    nome: formData.get("nome")?.toString() ?? "",
    especie: formData.get("especie")?.toString() ?? "",
    porte: formData.get("porte")?.toString() ?? "",
    observacoes: formData.get("observacoes")?.toString() || undefined,
  };
}

export async function salvarPet(
  _estadoAnterior: Resultado<void>,
  formData: FormData,
): Promise<Resultado<void>> {
  const dadosValidados = esquemaSalvarPet.parse(paraDadosDoFormulario(formData));

  // A entidade valida o valor real (PET.ESPECIE_INVALIDA / PET.PORTE_INVALIDO); a
  // asserção aqui só satisfaz o tipo do union na fronteira com o FormData.
  const dados: DadosPet = {
    ...dadosValidados,
    especie: dadosValidados.especie as EspeciePet,
    porte: dadosValidados.porte as PortePet,
  };

  const resultado = await new SalvarPetCasoDeUso(
    petPrismaRepositorio,
    tutorPrismaRepositorio,
  ).executar(dados);

  if (resultado.ok) {
    revalidatePath("/pets");
  }

  return paraResultadoSerializavel(resultado);
}

export async function listarPetsDoTutor(tutorId: string) {
  return petPrismaRepositorio.listarPorTutor(tutorId);
}
