import { describe, expect, it } from "vitest";

import { AtendimentoRepositorioEmMemoria } from "../compartilhado/testes/atendimento.repositorio-em-memoria";
import { PetRepositorioEmMemoria } from "../compartilhado/testes/pet.repositorio-em-memoria";
import { TutorRepositorioEmMemoria } from "../compartilhado/testes/tutor.repositorio-em-memoria";
import { Pet } from "../pet/pet.entidade";
import { Tutor } from "../tutor/tutor.entidade";
import { AgendarAtendimentoCasoDeUso } from "./agendar-atendimento.caso-de-uso";

function data(ano: number, mes: number, dia: number, hora: number, minuto = 0): Date {
  return new Date(Date.UTC(ano, mes - 1, dia, hora, minuto, 0, 0));
}

// Referência fixa de "agora": sábado 01/08/2026 08:00. Todos os slots de teste ficam no
// futuro em relação a ela, exceto o cenário que testa explicitamente ATENDIMENTO.DATA_NO_PASSADO.
const AGORA = data(2026, 8, 1, 8, 0);

// segunda-feira 03/08/2026, dentro do expediente (08:00-18:00).
const SLOT_VALIDO = data(2026, 8, 3, 9, 0);

async function criarPetAtivo(
  petRepositorio: PetRepositorioEmMemoria,
  tutorRepositorio: TutorRepositorioEmMemoria,
  sobrescritas: Partial<{ petAtivo: boolean; tutorAtivo: boolean }> = {},
): Promise<{ petId: string }> {
  const tutor = await tutorRepositorio.salvar(
    new Tutor({ nome: "Maria Silva", email: "maria@exemplo.com", ativo: sobrescritas.tutorAtivo ?? true }),
  );
  const pet = await petRepositorio.salvar(
    new Pet({
      tutorId: tutor.id as string,
      nome: "Rex",
      especie: "CACHORRO",
      porte: "M",
      ativo: sobrescritas.petAtivo ?? true,
    }),
  );
  return { petId: pet.id as string };
}

function montarCasoDeUso() {
  const atendimentoRepositorio = new AtendimentoRepositorioEmMemoria();
  const petRepositorio = new PetRepositorioEmMemoria();
  const tutorRepositorio = new TutorRepositorioEmMemoria();
  const casoDeUso = new AgendarAtendimentoCasoDeUso(atendimentoRepositorio, petRepositorio, tutorRepositorio);
  return { atendimentoRepositorio, petRepositorio, tutorRepositorio, casoDeUso };
}

describe("AgendarAtendimentoCasoDeUso", () => {
  it("agenda um atendimento válido no caminho feliz", async () => {
    const { atendimentoRepositorio, petRepositorio, tutorRepositorio, casoDeUso } = montarCasoDeUso();
    const { petId } = await criarPetAtivo(petRepositorio, tutorRepositorio);

    const resultado = await casoDeUso.executar({ petId, inicio: SLOT_VALIDO }, AGORA);

    expect(resultado.ok).toBe(true);
    const [salvo] = await atendimentoRepositorio.listarPorIntervalo(SLOT_VALIDO, data(2026, 8, 3, 10, 0));
    expect(salvo.status).toBe("AGENDADO");
    expect(salvo.fim.getTime()).toBe(SLOT_VALIDO.getTime() + 60 * 60 * 1000);
  });

  it("falha com ATENDIMENTO.FORA_DO_EXPEDIENTE quando o horário é depois das 18:00", async () => {
    const { petRepositorio, tutorRepositorio, casoDeUso } = montarCasoDeUso();
    const { petId } = await criarPetAtivo(petRepositorio, tutorRepositorio);
    const foraDoExpediente = data(2026, 8, 3, 19, 0);

    const resultado = await casoDeUso.executar({ petId, inicio: foraDoExpediente }, AGORA);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.FORA_DO_EXPEDIENTE");
    }
  });

  it("falha com ATENDIMENTO.DATA_NO_PASSADO quando o início já passou", async () => {
    const { petRepositorio, tutorRepositorio, casoDeUso } = montarCasoDeUso();
    const { petId } = await criarPetAtivo(petRepositorio, tutorRepositorio);
    const noPassado = data(2026, 7, 30, 9, 0);

    const resultado = await casoDeUso.executar({ petId, inicio: noPassado }, AGORA);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.DATA_NO_PASSADO");
    }
  });

  it("falha com ATENDIMENTO.HORARIO_OCUPADO ao sobrepor um atendimento ativo", async () => {
    const { petRepositorio, tutorRepositorio, casoDeUso } = montarCasoDeUso();
    const { petId } = await criarPetAtivo(petRepositorio, tutorRepositorio);
    await casoDeUso.executar({ petId, inicio: SLOT_VALIDO }, AGORA);

    const resultado = await casoDeUso.executar({ petId, inicio: data(2026, 8, 3, 9, 30) }, AGORA);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.HORARIO_OCUPADO");
    }
  });

  it("permite um novo atendimento começando exatamente no fim de outro (caso de borda)", async () => {
    const { petRepositorio, tutorRepositorio, casoDeUso } = montarCasoDeUso();
    const { petId } = await criarPetAtivo(petRepositorio, tutorRepositorio);
    await casoDeUso.executar({ petId, inicio: SLOT_VALIDO }, AGORA);

    const inicioLogoEmSeguida = data(2026, 8, 3, 10, 0);
    const resultado = await casoDeUso.executar({ petId, inicio: inicioLogoEmSeguida }, AGORA);

    expect(resultado.ok).toBe(true);
  });

  it("falha com ATENDIMENTO.PET_INATIVO quando o pet está inativo", async () => {
    const { petRepositorio, tutorRepositorio, casoDeUso } = montarCasoDeUso();
    const { petId } = await criarPetAtivo(petRepositorio, tutorRepositorio, { petAtivo: false });

    const resultado = await casoDeUso.executar({ petId, inicio: SLOT_VALIDO }, AGORA);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.PET_INATIVO");
    }
  });

  it("falha com ATENDIMENTO.PET_INATIVO quando o tutor do pet está inativo", async () => {
    const { petRepositorio, tutorRepositorio, casoDeUso } = montarCasoDeUso();
    const { petId } = await criarPetAtivo(petRepositorio, tutorRepositorio, { tutorAtivo: false });

    const resultado = await casoDeUso.executar({ petId, inicio: SLOT_VALIDO }, AGORA);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.PET_INATIVO");
    }
  });

  it("falha com ATENDIMENTO.PET_NAO_ENCONTRADO quando o pet não existe", async () => {
    const { casoDeUso } = montarCasoDeUso();

    const resultado = await casoDeUso.executar({ petId: "id-inexistente", inicio: SLOT_VALIDO }, AGORA);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.map((erro) => erro.codigo)).toContain("ATENDIMENTO.PET_NAO_ENCONTRADO");
    }
  });

  it("acumula todos os erros aplicáveis das regras 1 a 4 de uma vez", async () => {
    const { petRepositorio, tutorRepositorio, casoDeUso } = montarCasoDeUso();
    const { petId } = await criarPetAtivo(petRepositorio, tutorRepositorio, { petAtivo: false });
    const foraDoExpedienteENoPassado = data(2026, 7, 30, 19, 0);

    const resultado = await casoDeUso.executar({ petId, inicio: foraDoExpedienteENoPassado }, AGORA);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      const codigos = resultado.erros.map((erro) => erro.codigo);
      expect(codigos).toContain("ATENDIMENTO.FORA_DO_EXPEDIENTE");
      expect(codigos).toContain("ATENDIMENTO.DATA_NO_PASSADO");
      expect(codigos).toContain("ATENDIMENTO.PET_INATIVO");
    }
  });
});
