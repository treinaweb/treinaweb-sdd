import { petPrismaRepositorio } from "@/infra/repositorios/pet.prisma-repositorio";
import { tutorPrismaRepositorio } from "@/infra/repositorios/tutor.prisma-repositorio";
import { Cartao } from "@/ui/cartao.componente";

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
      <h1 className="text-2xl font-medium tracking-tight text-ink">Pets</h1>

      <Cartao padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-hairline text-ink-mute">
              <th className="py-3 px-4 font-medium">Nome</th>
              <th className="py-3 px-4 font-medium">Espécie</th>
              <th className="py-3 px-4 font-medium">Porte</th>
              <th className="py-3 px-4 font-medium">Tutor</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet.id} className="border-b border-hairline last:border-0">
                <td className="py-3 px-4 text-ink">{pet.nome}</td>
                <td className="py-3 px-4 text-ink">{NOMES_ESPECIE[pet.especie] ?? pet.especie}</td>
                <td className="py-3 px-4 text-ink">{pet.porte}</td>
                <td className="py-3 px-4 text-ink">{nomeDoTutorPorId.get(pet.tutorId) ?? "-"}</td>
              </tr>
            ))}
            {pets.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-ink-mute">
                  Nenhum pet cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Cartao>

      <Cartao>
        <PetFormulario
          pet={null}
          tutores={tutoresAtivos.map((tutor) => ({ id: tutor.id as string, nome: tutor.nome }))}
        />
      </Cartao>
    </div>
  );
}
