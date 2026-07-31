import { describe, expect, it } from "vitest";

import { TutorRepositorioEmMemoria } from "../compartilhado/testes/tutor.repositorio-em-memoria";
import { SalvarTutorCasoDeUso } from "./salvar-tutor.caso-de-uso";
import { InativarTutorCasoDeUso } from "./inativar-tutor.caso-de-uso";

describe("InativarTutorCasoDeUso", () => {
  it("inativa um tutor existente", async () => {
    const repositorio = new TutorRepositorioEmMemoria();
    await new SalvarTutorCasoDeUso(repositorio).executar({
      nome: "Maria Silva",
      email: "maria@exemplo.com",
    });
    const [tutorSalvo] = await repositorio.listar();
    const casoDeUso = new InativarTutorCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(tutorSalvo.id as string);

    expect(resultado.ok).toBe(true);
    const tutorAtualizado = await repositorio.buscarPorId(tutorSalvo.id as string);
    expect(tutorAtualizado?.ativo).toBe(false);
  });

  it("falha com TUTOR.NAO_ENCONTRADO quando o tutor não existe", async () => {
    const repositorio = new TutorRepositorioEmMemoria();
    const casoDeUso = new InativarTutorCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar("id-inexistente");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("TUTOR.NAO_ENCONTRADO");
    }
  });
});
