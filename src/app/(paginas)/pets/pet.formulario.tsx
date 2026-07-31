"use client";

import { useActionState, useEffect, useRef } from "react";

import { salvarPet } from "@/app/acoes/pet.acoes";
import { Resultado } from "@/dominio/compartilhado/resultado";
import { ListaDeErros } from "@/ui/lista-de-erros.componente";

import { traduzirCodigoDeErro } from "../mensagens";

const ESTADO_INICIAL: Resultado<void> = { ok: true };

export type PetParaEdicao = {
  id: string;
  tutorId: string;
  nome: string;
  especie: string;
  porte: string;
  observacoes?: string;
};

export type TutorParaSelecao = {
  id: string;
  nome: string;
};

export function PetFormulario({
  pet,
  tutores,
}: {
  pet: PetParaEdicao | null;
  tutores: TutorParaSelecao[];
}) {
  const [estado, acao, pendente] = useActionState(salvarPet, ESTADO_INICIAL);
  const formularioRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok && !pet) {
      formularioRef.current?.reset();
    }
  }, [estado, pet]);

  const mensagensDeErro = estado.ok ? [] : estado.erros.map((erro) => traduzirCodigoDeErro(erro.codigo));

  return (
    <form ref={formularioRef} action={acao} className="flex flex-col gap-3 max-w-md">
      <h2 className="text-lg font-semibold">{pet ? "Editar pet" : "Novo pet"}</h2>

      <input type="hidden" name="id" defaultValue={pet?.id ?? ""} />

      <label className="flex flex-col gap-1 text-sm">
        Tutor
        <select
          name="tutorId"
          defaultValue={pet?.tutorId ?? ""}
          className="border rounded px-2 py-1"
          required
        >
          <option value="" disabled>
            Selecione um tutor
          </option>
          {tutores.map((tutor) => (
            <option key={tutor.id} value={tutor.id}>
              {tutor.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Nome
        <input
          type="text"
          name="nome"
          defaultValue={pet?.nome ?? ""}
          className="border rounded px-2 py-1"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Espécie
        <select
          name="especie"
          defaultValue={pet?.especie ?? "CACHORRO"}
          className="border rounded px-2 py-1"
        >
          <option value="CACHORRO">Cachorro</option>
          <option value="GATO">Gato</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Porte
        <select name="porte" defaultValue={pet?.porte ?? "M"} className="border rounded px-2 py-1">
          <option value="P">Pequeno</option>
          <option value="M">Médio</option>
          <option value="G">Grande</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Observações
        <textarea
          name="observacoes"
          defaultValue={pet?.observacoes ?? ""}
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
