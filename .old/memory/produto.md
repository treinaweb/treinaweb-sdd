# Produto: PetCare Agenda

## O que é

Sistema web para um petshop de bairro organizar o cadastro de tutores e pets e a
agenda de banho e tosa, substituindo a agenda de papel e o caderno de contatos.

## Problema atual

A recepção anota os horários em uma agenda física. Isso gera horário marcado em
duplicidade, atendimento fora do horário de funcionamento e nenhum histórico dos
atendimentos.

## Para quem é

- **Recepção** (usuário principal): cadastra tutores e pets, marca e cancela atendimentos.
- **Dono do petshop**: quer visão do dia e histórico.

## Capacidades principais

- Cadastrar e manter tutores.
- Cadastrar e manter pets, sempre vinculados a um tutor.
- Agendar um atendimento para um pet em uma data e hora.
- Consultar a agenda de um dia.
- Concluir e cancelar atendimentos.

## Regras mais estáveis do negócio

- Todo tutor tem nome completo e e-mail; o e-mail não se repete.
- Todo pet pertence a exatamente um tutor e tem espécie e porte.
- Porte válido: `P`, `M`, `G`.
- A agenda atende de segunda a sábado, das 08:00 às 18:00.
- Existe um profissional: dois atendimentos ativos não podem ocupar o mesmo horário.
- Cada atendimento tem duração fixa de 60 minutos.
- Cancelamento só é permitido com no mínimo 2 horas de antecedência.
- Tutor ou pet inativo não pode receber novos agendamentos.

## Linguagem do time (glossário)

- **Tutor**: pessoa responsável pelo pet.
- **Pet**: animal atendido.
- **Atendimento**: um horário marcado para um pet.
- **Janela**: intervalo de tempo ocupado por um atendimento.
- **Agenda do dia**: lista de atendimentos de uma data, em ordem de horário.

## Fora do escopo do produto (por enquanto)

Catálogo de serviços com preços, autenticação e perfis de acesso, pagamento, notificação
por WhatsApp, múltiplos profissionais e múltiplas unidades.
