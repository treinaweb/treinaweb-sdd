import { ComponentProps } from "react";

type Variante = "primaria" | "secundaria" | "link";
type Tom = "padrao" | "perigo";

const CLASSE_BASE_POR_VARIANTE: Record<Variante, string> = {
  primaria: "px-4 py-2 rounded-sm font-medium bg-primary text-on-primary hover:brightness-95",
  secundaria:
    "px-4 py-2 rounded-sm font-medium bg-canvas text-ink border border-hairline-strong hover:bg-canvas-soft",
  link: "underline hover:text-ink-mute",
};

const COR_DO_LINK_POR_TOM: Record<Tom, string> = {
  padrao: "text-ink",
  perigo: "text-danger",
};

export function Botao({
  variante = "secundaria",
  tom = "padrao",
  className = "",
  ...props
}: ComponentProps<"button"> & { variante?: Variante; tom?: Tom }) {
  const corDoLink = variante === "link" ? COR_DO_LINK_POR_TOM[tom] : "";

  return (
    <button
      className={`text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${CLASSE_BASE_POR_VARIANTE[variante]} ${corDoLink} ${className}`.trim()}
      {...props}
    />
  );
}
