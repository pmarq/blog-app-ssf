"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/dashboard/studio/create", label: "✦ Criar com IA" },
  { href: "/dashboard/studio", label: "Início" },
  { href: "/dashboard/studio/library", label: "Biblioteca" },
  { href: "/dashboard/studio/agenda", label: "Calendário" },
  { href: "/dashboard/studio/settings", label: "Regras & Voz" },
];

export default function StudioNav() {
  const pathname = usePathname();

  const renderLink = (link: { href: string; label: string }) => {
    const active = pathname === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`px-3 py-1 rounded border transition text-sm ${
          active
            ? "border-primary text-primary bg-primary/10 font-medium"
            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-wrap gap-2 mb-4">
      {primaryLinks.map(renderLink)}
    </nav>
  );
}
