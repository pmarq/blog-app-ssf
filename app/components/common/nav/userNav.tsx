// components/Navbar.tsx

import Link from "next/link";
import AuthButtons from "../auth-buttons";
import NextImage from "next/image";

export default function Navbar() {
  const mainSiteUrl =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://saboressemfronteiras.com.br";

  return (
    <nav className="bg-slate-100 text-white px-5 h-24 flex items-center justify-between">
      {/* Logo (apenas logo como link para Home) */}
      <Link href="/">
        <NextImage
          src="/logo.svg"
          alt="Sabores Sem Fronteiras"
          width={230}
          height={90}
          className="
            w-[clamp(120px,30vw,230px)]  /* Logo menor em mobile, original em telas maiores */
            h-auto                       /* Mantém a proporção do logo */
          "
        />
      </Link>
      {/* Barra de Busca e Botões de Autenticação */}
      <ul className="flex gap-3 lg:gap-6 items-center">
        <li className="hidden sm:block md:text-xs text-[16px]">
          <Link
            href="/"
            className="uppercase tracking-widest hover:underline text-sky-950"
          >
            Início
          </Link>
        </li>
        <li className="hidden sm:block md:text-xs text-[16px]">
          <a
            href={mainSiteUrl}
            className="uppercase tracking-widest hover:underline text-sky-950"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ir para o site
          </a>
        </li>

        <li>
          <AuthButtons />
        </li>
      </ul>
    </nav>
  );
}
