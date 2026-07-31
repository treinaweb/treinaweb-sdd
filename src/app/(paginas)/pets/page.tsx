import { petPrismaRepositorio } from "@/infra/repositorios/pet.prisma-repositorio";
import { tutorPrismaRepositorio } from "@/infra/repositorios/tutor.prisma-repositorio";

import { PetFormulario } from "./pet.formulario";

const NOMES_ESPECIE: Record<string, string> = { CACHORRO: "Cachorro", GATO: "Gato" };

export default async function PaginaPets() {
  const [pets, tutores] = await Promise.all([
    petPrismaRepositorio.listar(),
    tutorPrismaRepositorio.listar(),
  ]);

  const nomeDoTutorPorId = new Map(tutores.map((tutor) => [tutor.id, tutor.nome]));
  const tutoresAtivos = tutores.filter((tutor) => tutor.ativo);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-semibold">Pets</h1>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">Espécie</th>
            <th className="py-2 pr-4">Porte</th>
            <th className="py-2 pr-4">Tutor</th>
          </tr>
        </thead>
        <tbody>
          {pets.map((pet) => (
            <tr key={pet.id} className="border-b">
              <td className="py-2 pr-4">{pet.nome}</td>
              <td className="py-2 pr-4">{NOMES_ESPECIE[pet.especie] ?? pet.especie}</td>
              <td className="py-2 pr-4">{pet.porte}</td>
              <td className="py-2 pr-4">{nomeDoTutorPorId.get(pet.tutorId) ?? "-"}</td>
            </tr>
          ))}
          {pets.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-zinc-500">
                Nenhum pet cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <PetFormulario
        pet={null}
        tutores={tutoresAtivos.map((tutor) => ({ id: tutor.id as string, nome: tutor.nome }))}
      />
    </div>
  );
}
