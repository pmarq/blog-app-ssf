"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/studio", label: "Home" },
  { href: "/dashboard/studio/briefs", label: "Briefs" },
  { href: "/dashboard/studio/curadoria", label: "Curadoria" },
  { href: "/dashboard/studio/asset-sets", label: "Asset Sets" },
  { href: "/dashboard/studio/pipeline", label: "Pipeline" },
  { href: "/dashboard/studio/metrics", label: "Métricas" },
  { href: "/dashboard/studio/settings/guardrails", label: "Guardrails" },
];

export default function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 text-sm mb-4">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1 rounded border transition ${
              active
                ? "border-highlight-light text-highlight-light dark:border-highlight-dark dark:text-highlight-dark bg-secondary-light/30 dark:bg-secondary-dark/30"
                : "border-secondary-dark/30 dark:border-secondary-light/30 text-secondary-dark dark:text-secondary-light hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
