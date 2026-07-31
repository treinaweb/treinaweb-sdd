"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "dark" | "system";

const CHAVE_DE_ARMAZENAMENTO = "theme";

const OPCOES: { valor: Tema; rotulo: string }[] = [
  { valor: "light", rotulo: "Claro" },
  { valor: "dark", rotulo: "Escuro" },
  { valor: "system", rotulo: "Sistema" },
];

function resolverTemaEscuro(tema: Tema): boolean {
  if (tema === "dark") return true;
  if (tema === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function aplicarTema(tema: Tema) {
  document.documentElement.setAttribute("data-theme", resolverTemaEscuro(tema) ? "dark" : "light");
}

export function AlternadorDeTema({ className = "" }: { className?: string }) {
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof window === "undefined") return "system";
    const salvo = localStorage.getItem(CHAVE_DE_ARMAZENAMENTO);
    return salvo === "light" || salvo === "dark" || salvo === "system" ? salvo : "system";
  });

  useEffect(() => {
    if (tema !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const aoMudar = () => aplicarTema("system");
    media.addEventListener("change", aoMudar);
    return () => media.removeEventListener("change", aoMudar);
  }, [tema]);

  function selecionar(novoTema: Tema) {
    setTema(novoTema);
    localStorage.setItem(CHAVE_DE_ARMAZENAMENTO, novoTema);
    aplicarTema(novoTema);
  }

  return (
    <div
      role="group"
      aria-label="Tema"
      className={`flex gap-1 rounded-sm border border-hairline p-0.5 text-xs ${className}`.trim()}
    >
      {OPCOES.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          aria-pressed={tema === opcao.valor}
          onClick={() => selecionar(opcao.valor)}
          className={`rounded-xs px-2 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
            tema === opcao.valor ? "bg-primary text-on-primary" : "text-ink-mute hover:text-ink"
          }`}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}
