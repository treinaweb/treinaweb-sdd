import Link from "next/link";

import { tutorPrismaRepositorio } from "@/infra/repositorios/tutor.prisma-repositorio";
import { Botao } from "@/ui/botao.componente";
import { Cartao } from "@/ui/cartao.componente";

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
      <h1 className="text-2xl font-medium tracking-tight text-ink">Tutores</h1>

      <Cartao padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-hairline text-ink-mute">
              <th className="py-3 px-4 font-medium">Nome</th>
              <th className="py-3 px-4 font-medium">E-mail</th>
              <th className="py-3 px-4 font-medium">Telefone</th>
              <th className="py-3 px-4 font-medium">Situação</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {tutores.map((tutor) => (
              <tr key={tutor.id} className="border-b border-hairline last:border-0">
                <td className="py-3 px-4 text-ink">{tutor.nome}</td>
                <td className="py-3 px-4 text-ink">{tutor.email}</td>
                <td className="py-3 px-4 text-ink">{tutor.telefone ?? "-"}</td>
                <td className="py-3 px-4 text-ink">{tutor.ativo ? "Ativo" : "Inativo"}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-4 items-center">
                    <Link
                      href={`/tutores?editar=${tutor.id}`}
                      className="text-sm text-ink underline hover:text-ink-mute"
                    >
                      Editar
                    </Link>
                    {tutor.ativo && (
                      <form
                        action={async () => {
                          "use server";
                          await inativarTutor(tutor.id as string);
                        }}
                      >
                        <Botao type="submit" variante="link">
                          Inativar
                        </Botao>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {tutores.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-ink-mute">
                  Nenhum tutor cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Cartao>

      <Cartao>
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
      </Cartao>
    </div>
  );
}
