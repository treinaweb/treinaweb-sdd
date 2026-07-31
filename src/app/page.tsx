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
    <div className="flex flex-col flex-1 items-center justify-center bg-canvas-soft font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-4 py-32 px-16 bg-canvas">
        <h1 className="text-4xl font-medium tracking-tight text-ink">
          PetCare Agenda
        </h1>
        <p className="text-lg text-ink-mute">
          Status da API: <span className="font-medium text-ink">{saude.status}</span>
        </p>
        <p className="text-sm text-ink-faint">{saude.agora}</p>
      </main>
    </div>
  );
}
