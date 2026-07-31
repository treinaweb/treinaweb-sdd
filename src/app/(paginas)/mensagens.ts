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
};

export function traduzirCodigoDeErro(codigo: string): string {
  return MENSAGENS[codigo] ?? codigo;
}
