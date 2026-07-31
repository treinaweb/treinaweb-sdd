import { describe, expect, it } from "vitest";

import { PetRepositorioEmMemoria } from "../compartilhado/testes/pet.repositorio-em-memoria";
import { TutorRepositorioEmMemoria } from "../compartilhado/testes/tutor.repositorio-em-memoria";
import { Tutor } from "../tutor/tutor.entidade";
import { DadosPet } from "./pet.entidade";
import { SalvarPetCasoDeUso } from "./salvar-pet.caso-de-uso";

async function criarTutor(
  tutorRepositorio: TutorRepositorioEmMemoria,
  sobrescritas: Partial<{ ativo: boolean }> = {},
): Promise<Tutor> {
  return tutorRepositorio.salvar(
    new Tutor({
      nome: "Maria Silva",
      email: "maria@exemplo.com",
      ativo: sobrescritas.ativo ?? true,
    }),
  );
}

function petValido(tutorId: string, sobrescritas: Partial<DadosPet> = {}): DadosPet {
  return {
    tutorId,
    nome: "Rex",
    especie: "CACHORRO",
    porte: "M",
    ...sobrescritas,
  };
}

describe("SalvarPetCasoDeUso", () => {
  it("salva um pet válido de um tutor ativo", async () => {
    const petRepositorio = new PetRepositorioEmMemoria();
    const tutorRepositorio = new TutorRepositorioEmMemoria();
    const tutor = await criarTutor(tutorRepositorio);
    const casoDeUso = new SalvarPetCasoDeUso(petRepositorio, tutorRepositorio);

    const resultado = await casoDeUso.executar(petValido(tutor.id as string));

    expect(resultado.ok).toBe(true);
    const salvos = await petRepositorio.listar();
    expect(salvos).toHaveLength(1);
  });

  it("falha com PET.NOME_INVALIDO quando o nome tem menos de 2 caracteres", async () => {
    const petRepositorio = new PetRepositorioEmMemoria();
    const tutorRepositorio = new TutorRepositorioEmMemoria();
    const tutor = await criarTutor(tutorRepositorio);
    const casoDeUso = new SalvarPetCasoDeUso(petRepositorio, tutorRepositorio);

    const resultado = await casoDeUso.executar(petValido(tutor.id as string, { nome: "R" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("PET.NOME_INVALIDO");
    }
  });

  it("falha com PET.ESPECIE_INVALIDA quando a espécie não é cachorro ou gato", async () => {
    const petRepositorio = new PetRepositorioEmMemoria();
    const tutorRepositorio = new TutorRepositorioEmMemoria();
    const tutor = await criarTutor(tutorRepositorio);
    const casoDeUso = new SalvarPetCasoDeUso(petRepositorio, tutorRepositorio);

    const resultado = await casoDeUso.executar(
      petValido(tutor.id as string, { especie: "PASSARO" as DadosPet["especie"] }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("PET.ESPECIE_INVALIDA");
    }
  });

  it("falha com PET.PORTE_INVALIDO quando o porte não é P, M ou G", async () => {
    const petRepositorio = new PetRepositorioEmMemoria();
    const tutorRepositorio = new TutorRepositorioEmMemoria();
    const tutor = await criarTutor(tutorRepositorio);
    const casoDeUso = new SalvarPetCasoDeUso(petRepositorio, tutorRepositorio);

    const resultado = await casoDeUso.executar(
      petValido(tutor.id as string, { porte: "GG" as DadosPet["porte"] }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("PET.PORTE_INVALIDO");
    }
  });

  it("falha com PET.TUTOR_NAO_ENCONTRADO quando o tutor não existe", async () => {
    const petRepositorio = new PetRepositorioEmMemoria();
    const tutorRepositorio = new TutorRepositorioEmMemoria();
    const casoDeUso = new SalvarPetCasoDeUso(petRepositorio, tutorRepositorio);

    const resultado = await casoDeUso.executar(petValido("id-inexistente"));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("PET.TUTOR_NAO_ENCONTRADO");
    }
  });

  it("falha com PET.TUTOR_INATIVO quando o tutor está inativo", async () => {
    const petRepositorio = new PetRepositorioEmMemoria();
    const tutorRepositorio = new TutorRepositorioEmMemoria();
    const tutor = await criarTutor(tutorRepositorio, { ativo: false });
    const casoDeUso = new SalvarPetCasoDeUso(petRepositorio, tutorRepositorio);

    const resultado = await casoDeUso.executar(petValido(tutor.id as string));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("PET.TUTOR_INATIVO");
    }
  });
});
