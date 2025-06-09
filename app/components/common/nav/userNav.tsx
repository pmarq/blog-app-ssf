// components/Navbar.tsx

import Link from "next/link";
import AuthButtons from "../auth-buttons";
import NextImage from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-slate-100 text-white px-5 h-24 flex items-center justify-between">
      {/* Logo (apenas logo como link para Home) */}
      <Link href="/">
        <NextImage
          src="/logo.svg"
          alt="Logo"
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
            Home
          </Link>
        </li>
        <li className="hidden sm:block md:text-xs text-[16px]">
          <Link
            href="/property-search"
            className="uppercase tracking-widest hover:underline text-sky-950"
          >
            Buscar Imóveis
          </Link>
        </li>
        <li className="hidden sm:block md:text-xs text-[16px]">
          <Link
            href="/blog"
            className="uppercase tracking-widest hover:underline text-sky-950"
          >
            Blog
          </Link>
        </li>
        <li className="hidden sm:block md:text-xs text-[16px]">
          <Link
            href="/#sobre"
            className="uppercase tracking-widest hover:underline text-sky-950"
          >
            Sobre
          </Link>
        </li>
        <li className="hidden sm:block md:text-xs text-[16px]">
          <Link
            href="/#contato"
            className="uppercase tracking-widest hover:underline text-sky-950"
          >
            Contato
          </Link>
        </li>
        <li>
          <AuthButtons />
        </li>
      </ul>
    </nav>
  );
}
