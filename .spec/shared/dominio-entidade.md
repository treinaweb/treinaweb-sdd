# Padrão: entidade de domínio

Válido para toda entidade criada em `src/dominio/<agregado>/`.

## Onde vive

`src/dominio/<agregado>/<agregado>.entidade.ts`, exportando uma classe em PascalCase
(ex.: `Tutor`, `Pet`).

## Construtor

- Recebe os valores crus (um objeto simples), **nunca lança exceção**.
- Só normaliza, não valida: `trim` em campos de texto livre (ex.: nome), e-mail sempre
  em minúsculas, telefone reduzido a somente dígitos.
- Aplica o valor padrão dos campos que têm padrão (ex.: `ativo = true`) quando o dado de
  entrada não informa o campo.
- Campos ficam acessíveis como propriedades `readonly` da instância.

## `validar()`

- Assinatura: `validar(): ErroDeDominio[]`.
- Acumula **todos** os erros encontrados — não retorna no primeiro erro.
- Devolve lista vazia (`[]`) quando não há nenhum problema.
- Valida só o formato do próprio dado (campo obrigatório, tipo, enum, tamanho). Regras
  que dependem de outro agregado ou do repositório **não** entram aqui — são
  responsabilidade do caso de uso.

## Códigos de erro

- Formato `AGREGADO.MOTIVO`, maiúsculo, sem acento (ver
  `.spec/shared/convencoes-de-nomes.md`).
- Inclui `campo` (nome da propriedade em camelCase) sempre que o erro for de um campo
  específico.

## Regra de fronteira

Nenhum import de runtime: sem Prisma, Next, React, Zod, `process.env` nem I/O. Só
TypeScript puro e o que estiver em `src/dominio/compartilhado`.

## Esqueleto de referência

```ts
import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";

export interface DadosAgregado {
  id?: string;
  campoObrigatorio: string;
  campoComPadrao?: boolean;
}

export class Agregado {
  readonly id?: string;
  readonly campoObrigatorio: string;
  readonly campoComPadrao: boolean;

  constructor(dados: DadosAgregado) {
    this.id = dados.id;
    this.campoObrigatorio = dados.campoObrigatorio.trim();
    this.campoComPadrao = dados.campoComPadrao ?? true;
  }

  validar(): ErroDeDominio[] {
    const erros: ErroDeDominio[] = [];

    if (!this.campoObrigatorio) {
      erros.push(new ErroDeDominio("AGREGADO.CAMPO_OBRIGATORIO_INVALIDO", "campoObrigatorio"));
    }

    return erros;
  }
}
```
