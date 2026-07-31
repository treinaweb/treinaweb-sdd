"use client";

import { useActionState, useEffect, useRef } from "react";

import { salvarTutor } from "@/app/acoes/tutor.acoes";
import { Resultado } from "@/dominio/compartilhado/resultado";
import { ListaDeErros } from "@/ui/lista-de-erros.componente";

import { traduzirCodigoDeErro } from "../mensagens";

const ESTADO_INICIAL: Resultado<void> = { ok: true };

export type TutorParaEdicao = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
};

export function TutorFormulario({ tutor }: { tutor: TutorParaEdicao | null }) {
  const [estado, acao, pendente] = useActionState(salvarTutor, ESTADO_INICIAL);
  const formularioRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok && !tutor) {
      formularioRef.current?.reset();
    }
  }, [estado, tutor]);

  const mensagensDeErro = estado.ok ? [] : estado.erros.map((erro) => traduzirCodigoDeErro(erro.codigo));

  return (
    <form ref={formularioRef} action={acao} className="flex flex-col gap-3 max-w-md">
      <h2 className="text-lg font-semibold">{tutor ? "Editar tutor" : "Novo tutor"}</h2>

      <input type="hidden" name="id" defaultValue={tutor?.id ?? ""} />

      <label className="flex flex-col gap-1 text-sm">
        Nome completo
        <input
          type="text"
          name="nome"
          defaultValue={tutor?.nome ?? ""}
          className="border rounded px-2 py-1"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          type="text"
          name="email"
          defaultValue={tutor?.email ?? ""}
          className="border rounded px-2 py-1"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Telefone
        <input
          type="text"
          name="telefone"
          defaultValue={tutor?.telefone ?? ""}
          className="border rounded px-2 py-1"
        />
      </label>

      <ListaDeErros mensagens={mensagensDeErro} />

      <button type="submit" disabled={pendente} className="border rounded px-3 py-1 self-start">
        {pendente ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
