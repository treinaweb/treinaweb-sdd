import { Tutor } from "./tutor.entidade";

export interface TutorRepositorio {
  salvar(tutor: Tutor): Promise<Tutor>;
  buscarPorId(id: string): Promise<Tutor | null>;
  buscarPorEmail(email: string): Promise<Tutor | null>;
  listar(): Promise<Tutor[]>;
  excluir(id: string): Promise<void>;
}
