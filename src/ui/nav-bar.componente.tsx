"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AlternadorDeTema } from "@/ui/alternador-de-tema.componente";

const ITENS_DE_NAVEGACAO = [
  { href: "/tutores", rotulo: "Tutores" },
  { href: "/pets", rotulo: "Pets" },
  { href: "/agenda", rotulo: "Agenda" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-8 border-b border-hairline px-8 py-4">
      <Link href="/" className="text-base font-medium text-ink">
        PetCare Agenda
      </Link>
      <div className="flex gap-6 text-sm">
        {ITENS_DE_NAVEGACAO.map((item) => {
          const ativo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={ativo ? "font-medium text-ink" : "text-ink-mute hover:text-ink"}
            >
              {item.rotulo}
            </Link>
          );
        })}
      </div>
      <AlternadorDeTema className="ml-auto" />
    </nav>
  );
}
