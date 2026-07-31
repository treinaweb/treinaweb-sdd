import Link from "next/link";

import { tutorPrismaRepositorio } from "@/infra/repositorios/tutor.prisma-repositorio";

import { inativarTutor } from "@/app/acoes/tutor.acoes";
import { TutorFormulario } from "./tutor.formulario";

export default async function PaginaTutores({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;

  const tutores = await tutorPrismaRepositorio.listar();
  const tutorEmEdicao = editar ? await tutorPrismaRepositorio.buscarPorId(editar) : null;

  return (
    <div className="flex flex-col gap-8 p-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-semibold">Tutores</h1>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">E-mail</th>
            <th className="py-2 pr-4">Telefone</th>
            <th className="py-2 pr-4">Situação</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {tutores.map((tutor) => (
            <tr key={tutor.id} className="border-b">
              <td className="py-2 pr-4">{tutor.nome}</td>
              <td className="py-2 pr-4">{tutor.email}</td>
              <td className="py-2 pr-4">{tutor.telefone ?? "-"}</td>
              <td className="py-2 pr-4">{tutor.ativo ? "Ativo" : "Inativo"}</td>
              <td className="py-2 pr-4 flex gap-3">
                <Link href={`/tutores?editar=${tutor.id}`} className="underline">
                  Editar
                </Link>
                {tutor.ativo && (
                  <form
                    action={async () => {
                      "use server";
                      await inativarTutor(tutor.id as string);
                    }}
                  >
                    <button type="submit" className="underline">
                      Inativar
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
          {tutores.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-zinc-500">
                Nenhum tutor cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <TutorFormulario
        key={tutorEmEdicao?.id ?? "novo"}
        tutor={
          tutorEmEdicao
            ? {
                id: tutorEmEdicao.id as string,
                nome: tutorEmEdicao.nome,
                email: tutorEmEdicao.email,
                telefone: tutorEmEdicao.telefone,
              }
            : null
        }
      />
    </div>
  );
}
