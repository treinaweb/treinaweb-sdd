const MENSAGENS: Record<string, string> = {
  "TUTOR.NOME_INVALIDO": "Informe o nome completo do tutor (nome e sobrenome).",
  "TUTOR.EMAIL_INVALIDO": "Informe um e-mail em formato válido.",
  "TUTOR.TELEFONE_INVALIDO": "O telefone informado não contém nenhum dígito.",
  "TUTOR.EMAIL_DUPLICADO": "Já existe um tutor cadastrado com este e-mail.",
  "TUTOR.NAO_ENCONTRADO": "Tutor não encontrado.",
  "PET.NOME_INVALIDO": "Informe um nome com pelo menos 2 caracteres.",
  "PET.ESPECIE_INVALIDA": "Selecione uma espécie válida (cachorro ou gato).",
  "PET.PORTE_INVALIDO": "Selecione um porte válido (P, M ou G).",
  "PET.TUTOR_NAO_ENCONTRADO": "Selecione um tutor existente.",
  "PET.TUTOR_INATIVO": "O tutor selecionado está inativo e não pode receber novos pets.",
  "ATENDIMENTO.DATA_INVALIDA": "Informe uma data e hora válidas.",
  "ATENDIMENTO.FORA_DO_EXPEDIENTE": "O horário precisa estar entre segunda e sábado, das 08:00 às 18:00.",
  "ATENDIMENTO.DATA_NO_PASSADO": "Não é possível marcar um atendimento no passado.",
  "ATENDIMENTO.HORARIO_OCUPADO": "Já existe um atendimento marcado para este horário.",
  "ATENDIMENTO.PET_INATIVO": "O pet ou o tutor está inativo e não pode receber novos agendamentos.",
  "ATENDIMENTO.PET_NAO_ENCONTRADO": "Selecione um pet existente.",
  "ATENDIMENTO.NAO_ENCONTRADO": "Atendimento não encontrado.",
  "ATENDIMENTO.STATUS_INVALIDO": "Esta ação não é permitida para o status atual do atendimento.",
  "ATENDIMENTO.CANCELAMENTO_FORA_DO_PRAZO": "O cancelamento exige no mínimo 2 horas de antecedência.",
};

export function traduzirCodigoDeErro(codigo: string): string {
  return MENSAGENS[codigo] ?? codigo;
}
