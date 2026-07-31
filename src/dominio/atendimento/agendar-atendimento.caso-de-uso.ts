import { AgregadorDeErros } from "../compartilhado/erro-de-dominio.erro";
import { falha, ok, Resultado } from "../compartilhado/resultado";
import { PetRepositorio } from "../pet/pet.repositorio";
import { TutorRepositorio } from "../tutor/tutor.repositorio";
import { Atendimento } from "./atendimento.entidade";
import { AtendimentoRepositorio } from "./atendimento.repositorio";

const HORA_INICIO_EXPEDIENTE = 8;
const HORA_FIM_EXPEDIENTE = 18;
const DIA_SEMANA_SEGUNDA = 1;
const DIA_SEMANA_SABADO = 6;

export interface DadosNovoAtendimento {
  petId: string;
  inicio: Date;
}

export class AgendarAtendimentoCasoDeUso {
  constructor(
    private readonly repositorio: AtendimentoRepositorio,
    private readonly petRepositorio: PetRepositorio,
    private readonly tutorRepositorio: TutorRepositorio,
  ) {}

  async executar(dados: DadosNovoAtendimento, agora: Date): Promise<Resultado<void>> {
    const atendimento = new Atendimento({ petId: dados.petId, inicio: dados.inicio });

    const errosDeFormato = atendimento.validar();
    if (errosDeFormato.length > 0) {
      return falha(errosDeFormato);
    }

    const erros = new AgregadorDeErros();

    if (!estaDentroDoExpediente(atendimento.inicio, atendimento.fim)) {
      erros.adicionar("ATENDIMENTO.FORA_DO_EXPEDIENTE");
    }

    if (atendimento.inicio.getTime() < agora.getTime()) {
      erros.adicionar("ATENDIMENTO.DATA_NO_PASSADO");
    }

    const sobrepostos = await this.repositorio.listarPorIntervalo(atendimento.inicio, atendimento.fim);
    if (sobrepostos.some((outro) => outro.status === "AGENDADO")) {
      erros.adicionar("ATENDIMENTO.HORARIO_OCUPADO");
    }

    const pet = await this.petRepositorio.buscarPorId(atendimento.petId);
    if (!pet) {
      erros.adicionar("ATENDIMENTO.PET_NAO_ENCONTRADO", "petId");
    } else {
      const tutor = await this.tutorRepositorio.buscarPorId(pet.tutorId);
      if (!pet.ativo || !tutor?.ativo) {
        erros.adicionar("ATENDIMENTO.PET_INATIVO", "petId");
      }
    }

    if (!erros.vazio()) {
      return falha(erros.paraLista());
    }

    await this.repositorio.salvar(atendimento);
    return ok();
  }
}

function estaDentroDoExpediente(inicio: Date, fim: Date): boolean {
  const diaSemana = inicio.getUTCDay();
  if (diaSemana < DIA_SEMANA_SEGUNDA || diaSemana > DIA_SEMANA_SABADO) {
    return false;
  }

  const inicioExpediente = new Date(
    Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate(), HORA_INICIO_EXPEDIENTE, 0, 0, 0),
  );
  const fimExpediente = new Date(
    Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate(), HORA_FIM_EXPEDIENTE, 0, 0, 0),
  );

  return inicio.getTime() >= inicioExpediente.getTime() && fim.getTime() <= fimExpediente.getTime();
}
