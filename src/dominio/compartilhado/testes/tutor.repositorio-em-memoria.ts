import { Tutor } from "../../tutor/tutor.entidade";
import { TutorRepositorio } from "../../tutor/tutor.repositorio";

export class TutorRepositorioEmMemoria implements TutorRepositorio {
  private readonly tutores = new Map<string, Tutor>();
  private proximoId = 1;

  async salvar(tutor: Tutor): Promise<Tutor> {
    const id = tutor.id ?? String(this.proximoId++);
    const tutorSalvo = new Tutor({ ...tutor, id });
    this.tutores.set(id, tutorSalvo);
    return tutorSalvo;
  }

  async buscarPorId(id: string): Promise<Tutor | null> {
    return this.tutores.get(id) ?? null;
  }

  async buscarPorEmail(email: string): Promise<Tutor | null> {
    const emailNormalizado = email.trim().toLowerCase();
    for (const tutor of this.tutores.values()) {
      if (tutor.email === emailNormalizado) {
        return tutor;
      }
    }
    return null;
  }

  async listar(): Promise<Tutor[]> {
    return Array.from(this.tutores.values());
  }

  async excluir(id: string): Promise<void> {
    this.tutores.delete(id);
  }
}
