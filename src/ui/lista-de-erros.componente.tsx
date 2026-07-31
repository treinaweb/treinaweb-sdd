export function ListaDeErros({ mensagens }: { mensagens: string[] }) {
  if (mensagens.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-1 text-sm text-danger" aria-live="polite">
      {mensagens.map((mensagem, indice) => (
        <li key={indice}>{mensagem}</li>
      ))}
    </ul>
  );
}
