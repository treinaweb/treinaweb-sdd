import { ReactNode } from "react";

export function Cartao({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-hairline bg-canvas ${padded ? "p-8" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
