# Como executar uma spec

Instruções padrão válidas para **qualquer** especificação deste projeto.
Toda spec referencia este arquivo.

## Antes de começar
1. Leia a spec inteira antes de escrever qualquer linha de código.
2. Carregue os arquivos citados nas seções **Referências** da spec.
3. Não invente requisitos. O que não está na spec, nas referências ou nas skills
   citadas, não deve ser implementado.
4. Se algo estiver ambíguo a ponto de impedir a execução, pare e pergunte.
   Ambiguidade pequena: escolha o caminho mais simples e registre a decisão na evidência.

## Durante a execução
5. Execute as tarefas na ordem em que aparecem dentro de cada grupo.
6. Quando a tarefa indicar uma **skill**, script ou gerador, use-o como implementação
   principal. Só complemente à mão o que a ferramenta não cobrir — e registre o desvio.
7. Ao concluir cada tarefa: marque o checkbox e escreva a evidência na linha
   imediatamente abaixo dela.
8. **Nunca** remova, renumere, reescreva ou reordene uma tarefa da spec.
9. Se uma tarefa não puder ser concluída, deixe o checkbox vazio e registre
   `BLOQUEIO:` com o motivo, no lugar da evidência.
10. Não altere arquivos fora do escopo da spec. Se precisar tocar em algo não previsto,
    registre na evidência da tarefa correspondente.

## Formato da evidência

```
> Evidência (DD-MM-AAAA HH:MM) — o que foi feito | arquivos: caminho1, caminho2 | verificação: comando → resultado
```

Uma linha por tarefa. Objetivo: rastreabilidade, não relatório.

## Ao final
11. Execute o bloco **Verificação final** da spec e registre o resultado de cada item.
12. A spec só está concluída quando **todos** os checkboxes estiverem marcados e com
    evidência registrada.
13. Escreva no fim da spec: `STATUS: CONCLUÍDA` ou `STATUS: PARCIAL — <n> bloqueios`.

## Sempre válido
Os critérios de `.spec/shared/criterios-de-verificacao.md` valem para toda spec,
mesmo que ela não os repita.
