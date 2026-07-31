export class ErroDeDominio {
  constructor(
    public readonly codigo: string,
    public readonly campo?: string,
  ) {}
}

export class AgregadorDeErros {
  private readonly erros: ErroDeDominio[] = [];

  adicionar(codigo: string, campo?: string): void {
    this.erros.push(new ErroDeDominio(codigo, campo));
  }

  paraLista(): ErroDeDominio[] {
    return this.erros;
  }

  vazio(): boolean {
    return this.erros.length === 0;
  }
}
