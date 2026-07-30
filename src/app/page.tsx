import { headers } from "next/headers";

type RespostaSaude = {
  status: string;
  agora: string;
};

async function buscarSaude(): Promise<RespostaSaude> {
  const cabecalhos = await headers();
  const host = cabecalhos.get("host") ?? "localhost:3000";
  const protocolo = cabecalhos.get("x-forwarded-proto") ?? "http";

  const resposta = await fetch(`${protocolo}://${host}/api/saude`, {
    cache: "no-store",
  });

  return resposta.json();
}

export default async function Home() {
  const saude = await buscarSaude();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-4 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          PetCare Agenda
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Status da API: <span className="font-medium">{saude.status}</span>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">{saude.agora}</p>
      </main>
    </div>
  );
}
