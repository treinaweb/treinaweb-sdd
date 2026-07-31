"use client";

import { useActionState, useEffect, useRef } from "react";

import { salvarTutor } from "@/app/acoes/tutor.acoes";
import { Resultado } from "@/dominio/compartilhado/resultado";
import { Botao } from "@/ui/botao.componente";
import { CampoDeFormulario, classeEntrada } from "@/ui/campo-de-formulario.componente";
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
    <form ref={formularioRef} action={acao} className="flex flex-col gap-4 max-w-md">
      <h2 className="text-lg font-medium text-ink">{tutor ? "Editar tutor" : "Novo tutor"}</h2>

      <input type="hidden" name="id" defaultValue={tutor?.id ?? ""} />

      <CampoDeFormulario rotulo="Nome completo">
        <input
          type="text"
          name="nome"
          defaultValue={tutor?.nome ?? ""}
          className={classeEntrada}
          required
        />
      </CampoDeFormulario>

      <CampoDeFormulario rotulo="E-mail">
        <input
          type="text"
          name="email"
          defaultValue={tutor?.email ?? ""}
          className={classeEntrada}
          required
        />
      </CampoDeFormulario>

      <CampoDeFormulario rotulo="Telefone">
        <input
          type="text"
          name="telefone"
          defaultValue={tutor?.telefone ?? ""}
          className={classeEntrada}
        />
      </CampoDeFormulario>

      <ListaDeErros mensagens={mensagensDeErro} />

      <Botao type="submit" variante="primaria" disabled={pendente} className="self-start">
        {pendente ? "Salvando..." : "Salvar"}
      </Botao>
    </form>
  );
}
