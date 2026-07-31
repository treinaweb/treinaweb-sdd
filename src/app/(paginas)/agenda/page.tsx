import { atendimentoPrismaRepositorio } from "@/infra/repositorios/atendimento.prisma-repositorio";
import { petPrismaRepositorio } from "@/infra/repositorios/pet.prisma-repositorio";
import { tutorPrismaRepositorio } from "@/infra/repositorios/tutor.prisma-repositorio";
import { Botao } from "@/ui/botao.componente";
import { CampoDeFormulario, classeEntrada } from "@/ui/campo-de-formulario.componente";
import { Cartao } from "@/ui/cartao.componente";

import { ConcluirCancelarFormulario } from "./concluir-cancelar.formulario";
import { NovoAtendimentoFormulario } from "./novo-atendimento.formulario";

const NOMES_STATUS: Record<string, string> = {
  AGENDADO: "Agendado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

// A recepção opera em America/Sao_Paulo (UTC-3 o ano todo). Ver a mesma convenção em
// src/app/acoes/atendimento.acoes.ts.
const OFFSET_BRT_HORAS = 3;

function dataDeHojeIso(): string {
  const agoraEmBrt = new Date(Date.now() - OFFSET_BRT_HORAS * 60 * 60 * 1000);
  const ano = agoraEmBrt.getUTCFullYear();
  const mes = String(agoraEmBrt.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(agoraEmBrt.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function paraDataNoDominio(diaIso: string): Date {
  const [ano, mes, dia] = diaIso.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function formatarHorario(data: Date): string {
  const horas = String(data.getUTCHours()).padStart(2, "0");
  const minutos = String(data.getUTCMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
}

export default async function PaginaAgenda({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  const diaSelecionado = dia ?? dataDeHojeIso();

  const [atendimentos, pets, tutores] = await Promise.all([
    atendimentoPrismaRepositorio.listarPorDia(paraDataNoDominio(diaSelecionado)),
    petPrismaRepositorio.listar(),
    tutorPrismaRepositorio.listar(),
  ]);

  const petPorId = new Map(pets.map((pet) => [pet.id, pet]));
  const tutorPorId = new Map(tutores.map((tutor) => [tutor.id, tutor]));
  const petsAtivos = pets.filter((pet) => pet.ativo);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-medium tracking-tight text-ink">Agenda</h1>

      <form className="flex gap-3 items-end" action="/agenda">
        <CampoDeFormulario rotulo="Dia">
          <input type="date" name="dia" defaultValue={diaSelecionado} className={classeEntrada} />
        </CampoDeFormulario>
        <Botao type="submit" variante="secundaria">
          Ver dia
        </Botao>
      </form>

      <Cartao padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-hairline text-ink-mute">
              <th className="py-3 px-4 font-medium">Horário</th>
              <th className="py-3 px-4 font-medium">Pet</th>
              <th className="py-3 px-4 font-medium">Tutor</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {atendimentos.map((atendimento) => {
              const pet = petPorId.get(atendimento.petId);
              const tutor = pet ? tutorPorId.get(pet.tutorId) : undefined;
              return (
                <tr key={atendimento.id} className="border-b border-hairline last:border-0">
                  <td className="py-3 px-4 text-ink">{formatarHorario(atendimento.inicio)}</td>
                  <td className="py-3 px-4 text-ink">{pet?.nome ?? "-"}</td>
                  <td className="py-3 px-4 text-ink">{tutor?.nome ?? "-"}</td>
                  <td className="py-3 px-4 text-ink">{NOMES_STATUS[atendimento.status] ?? atendimento.status}</td>
                  <td className="py-3 px-4">
                    {atendimento.status === "AGENDADO" && (
                      <ConcluirCancelarFormulario atendimentoId={atendimento.id as string} />
                    )}
                  </td>
                </tr>
              );
            })}
            {atendimentos.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-ink-mute">
                  Nenhum atendimento neste dia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Cartao>

      <Cartao>
        <NovoAtendimentoFormulario pets={petsAtivos.map((pet) => ({ id: pet.id as string, nome: pet.nome }))} />
      </Cartao>
    </div>
  );
}
