"use client";

import { useActionState, useEffect, useRef } from "react";

import { agendarAtendimento } from "@/app/acoes/atendimento.acoes";
import { Resultado } from "@/dominio/compartilhado/resultado";
import { Botao } from "@/ui/botao.componente";
import { CampoDeFormulario, classeEntrada } from "@/ui/campo-de-formulario.componente";
import { ListaDeErros } from "@/ui/lista-de-erros.componente";

import { traduzirCodigoDeErro } from "../mensagens";

const ESTADO_INICIAL: Resultado<void> = { ok: true };

export type PetParaSelecao = { id: string; nome: string };

export function NovoAtendimentoFormulario({ pets }: { pets: PetParaSelecao[] }) {
  const [estado, acao, pendente] = useActionState(agendarAtendimento, ESTADO_INICIAL);
  const formularioRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) {
      formularioRef.current?.reset();
    }
  }, [estado]);

  const mensagensDeErro = estado.ok ? [] : estado.erros.map((erro) => traduzirCodigoDeErro(erro.codigo));

  return (
    <form ref={formularioRef} action={acao} className="flex flex-col gap-4 max-w-md">
      <h2 className="text-lg font-medium text-ink">Novo atendimento</h2>

      <CampoDeFormulario rotulo="Pet">
        <select name="petId" defaultValue="" className={classeEntrada} required>
          <option value="" disabled>
            Selecione um pet
          </option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.nome}
            </option>
          ))}
        </select>
      </CampoDeFormulario>

      <CampoDeFormulario rotulo="Data">
        <input type="date" name="data" className={classeEntrada} required />
      </CampoDeFormulario>

      <CampoDeFormulario rotulo="Hora">
        <input type="time" name="hora" className={classeEntrada} required />
      </CampoDeFormulario>

      <ListaDeErros mensagens={mensagensDeErro} />

      <Botao type="submit" variante="primaria" disabled={pendente} className="self-start">
        {pendente ? "Agendando..." : "Agendar"}
      </Botao>
    </form>
  );
}
