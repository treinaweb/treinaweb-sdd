import { describe, expect, it } from "vitest";

import { TutorRepositorioEmMemoria } from "../compartilhado/testes/tutor.repositorio-em-memoria";
import { DadosTutor } from "./tutor.entidade";
import { SalvarTutorCasoDeUso } from "./salvar-tutor.caso-de-uso";

function tutorValido(sobrescritas: Partial<DadosTutor> = {}): DadosTutor {
  return {
    nome: "Maria Silva",
    email: "maria@exemplo.com",
    telefone: "11999998888",
    ...sobrescritas,
  };
}

describe("SalvarTutorCasoDeUso", () => {
  it("salva um tutor válido", async () => {
    const repositorio = new TutorRepositorioEmMemoria();
    const casoDeUso = new SalvarTutorCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(tutorValido());

    expect(resultado.ok).toBe(true);
    const salvos = await repositorio.listar();
    expect(salvos).toHaveLength(1);
    expect(salvos[0].email).toBe("maria@exemplo.com");
  });

  it("falha com TUTOR.NOME_INVALIDO quando o nome não é completo", async () => {
    const repositorio = new TutorRepositorioEmMemoria();
    const casoDeUso = new SalvarTutorCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(tutorValido({ nome: "Maria" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("TUTOR.NOME_INVALIDO");
    }
  });

  it("falha com TUTOR.EMAIL_INVALIDO quando o e-mail não tem formato válido", async () => {
    const repositorio = new TutorRepositorioEmMemoria();
    const casoDeUso = new SalvarTutorCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(tutorValido({ email: "nao-e-email" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("TUTOR.EMAIL_INVALIDO");
    }
  });

  it("falha com TUTOR.TELEFONE_INVALIDO quando o telefone informado não tem dígitos", async () => {
    const repositorio = new TutorRepositorioEmMemoria();
    const casoDeUso = new SalvarTutorCasoDeUso(repositorio);

    const resultado = await casoDeUso.executar(tutorValido({ telefone: "abc" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("TUTOR.TELEFONE_INVALIDO");
    }
  });

  it("falha com TUTOR.EMAIL_DUPLICADO quando o e-mail já pertence a outro tutor", async () => {
    const repositorio = new TutorRepositorioEmMemoria();
    const casoDeUso = new SalvarTutorCasoDeUso(repositorio);
    await casoDeUso.executar(tutorValido());

    const resultado = await casoDeUso.executar(tutorValido({ nome: "Joao Souza" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("TUTOR.EMAIL_DUPLICADO");
    }
  });
});
