"use client";

import { useTransition } from "react";

import { cancelarAtendimento, concluirAtendimento } from "@/app/acoes/atendimento.acoes";
import { Botao } from "@/ui/botao.componente";

import { traduzirCodigoDeErro } from "../mensagens";

export function ConcluirCancelarFormulario({ atendimentoId }: { atendimentoId: string }) {
  const [pendente, iniciarTransicao] = useTransition();

  function aoConcluir() {
    if (!window.confirm("Confirma a conclusão deste atendimento?")) {
      return;
    }
    iniciarTransicao(async () => {
      const resultado = await concluirAtendimento(atendimentoId);
      if (!resultado.ok) {
        window.alert(resultado.erros.map((erro) => traduzirCodigoDeErro(erro.codigo)).join("\n"));
      }
    });
  }

  function aoCancelar() {
    if (!window.confirm("Confirma o cancelamento deste atendimento?")) {
      return;
    }
    iniciarTransicao(async () => {
      const resultado = await cancelarAtendimento(atendimentoId);
      if (!resultado.ok) {
        window.alert(resultado.erros.map((erro) => traduzirCodigoDeErro(erro.codigo)).join("\n"));
      }
    });
  }

  return (
    <div className="flex gap-4">
      <Botao type="button" variante="link" onClick={aoConcluir} disabled={pendente}>
        Concluir
      </Botao>
      <Botao type="button" variante="link" tom="perigo" onClick={aoCancelar} disabled={pendente}>
        Cancelar
      </Botao>
    </div>
  );
}
