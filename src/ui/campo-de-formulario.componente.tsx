import { ReactNode } from "react";

export const classeEntrada =
  "border border-hairline rounded-sm bg-canvas px-3 py-2 text-sm text-ink";

export function CampoDeFormulario({
  rotulo,
  children,
}: {
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink">
      {rotulo}
      {children}
    </label>
  );
}
