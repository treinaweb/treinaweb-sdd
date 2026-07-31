"use client";

import { useActionState, useEffect, useRef } from "react";

import { salvarPet } from "@/app/acoes/pet.acoes";
import { Resultado } from "@/dominio/compartilhado/resultado";
import { Botao } from "@/ui/botao.componente";
import { CampoDeFormulario, classeEntrada } from "@/ui/campo-de-formulario.componente";
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
    <form ref={formularioRef} action={acao} className="flex flex-col gap-4 max-w-md">
      <h2 className="text-lg font-medium text-ink">{pet ? "Editar pet" : "Novo pet"}</h2>

      <input type="hidden" name="id" defaultValue={pet?.id ?? ""} />

      <CampoDeFormulario rotulo="Tutor">
        <select
          name="tutorId"
          defaultValue={pet?.tutorId ?? ""}
          className={classeEntrada}
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
      </CampoDeFormulario>

      <CampoDeFormulario rotulo="Nome">
        <input
          type="text"
          name="nome"
          defaultValue={pet?.nome ?? ""}
          className={classeEntrada}
          required
        />
      </CampoDeFormulario>

      <CampoDeFormulario rotulo="Espécie">
        <select name="especie" defaultValue={pet?.especie ?? "CACHORRO"} className={classeEntrada}>
          <option value="CACHORRO">Cachorro</option>
          <option value="GATO">Gato</option>
        </select>
      </CampoDeFormulario>

      <CampoDeFormulario rotulo="Porte">
        <select name="porte" defaultValue={pet?.porte ?? "M"} className={classeEntrada}>
          <option value="P">Pequeno</option>
          <option value="M">Médio</option>
          <option value="G">Grande</option>
        </select>
      </CampoDeFormulario>

      <CampoDeFormulario rotulo="Observações">
        <textarea
          name="observacoes"
          defaultValue={pet?.observacoes ?? ""}
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
