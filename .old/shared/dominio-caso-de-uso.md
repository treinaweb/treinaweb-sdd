# Padrão: caso de uso de domínio

Válido para todo caso de uso criado em `src/dominio/<agregado>/`.

## Onde vive

`src/dominio/<agregado>/<acao>-<agregado>.caso-de-uso.ts`, com `<acao>` no infinitivo ou
particípio curto (ex.: `salvar-tutor.caso-de-uso.ts`, `inativar-tutor.caso-de-uso.ts`),
exportando uma classe em PascalCase (ex.: `SalvarTutorCasoDeUso`).

## Dependências

- Só interfaces de repositório declaradas no próprio domínio (`<agregado>.repositorio.ts`
  do agregado dono, ou de outro agregado quando o caso de uso precisa consultá-lo).
- Injetadas pelo construtor da classe do caso de uso, nunca instanciadas dentro dele.

## Método `executar`

- Assinatura: `executar(...): Promise<Resultado<T>>`, usando `Resultado<void>` quando o
  sucesso não devolve dado.
- Ordem interna, sempre nesta sequência:
  1. Instancia a entidade com os dados recebidos e chama `validar()`. Se a lista não
     estiver vazia, devolve `falha(erros)` imediatamente — nenhuma regra abaixo roda.
  2. Aplica as regras que dependem do repositório (existência, duplicidade, estado de
     outro agregado), uma checagem por regra. Cada regra usa um código próprio,
     diferente dos códigos de formato da entidade. Para na primeira regra violada e
     devolve `falha([erro])`.
  3. Persiste através do repositório injetado.
  4. Devolve `ok(...)` (ou `ok()` quando `Resultado<void>`).

## Interface de repositório

- Declarada em `<agregado>.repositorio.ts`, só como contrato (interface, sem
  implementação). A implementação concreta vive em `src/infra/repositorios`.
- Nunca é alterada para acomodar uma necessidade de UI ou de infra — só o que o domínio
  precisa.

## Regra de fronteira

Nenhum import de runtime: sem Prisma, Next, React, Zod, `process.env` nem I/O direto —
tudo passa pela interface de repositório.

## Esqueleto de referência

```ts
import { ErroDeDominio } from "../compartilhado/erro-de-dominio.erro";
import { falha, ok, Resultado } from "../compartilhado/resultado";
import { Agregado, DadosAgregado } from "./agregado.entidade";
import { AgregadoRepositorio } from "./agregado.repositorio";

export class AcaoAgregadoCasoDeUso {
  constructor(private readonly repositorio: AgregadoRepositorio) {}

  async executar(dados: DadosAgregado): Promise<Resultado<void>> {
    const agregado = new Agregado(dados);
    const errosDeFormato = agregado.validar();
    if (errosDeFormato.length > 0) {
      return falha(errosDeFormato);
    }

    const existente = await this.repositorio.buscarPorId(agregado.id ?? "");
    if (!existente) {
      return falha([new ErroDeDominio("AGREGADO.NAO_ENCONTRADO")]);
    }

    await this.repositorio.salvar(agregado);
    return ok();
  }
}
```
