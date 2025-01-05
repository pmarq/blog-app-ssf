// components/Navbar.tsx

import Link from "next/link";
import { HomeIcon } from "lucide-react";
import AuthButtons from "../auth-buttons";
import SearchBar from "../SearchBar"; // Importar a SearchBar

export default function Navbar() {
  return (
    <nav className="bg-sky-950 text-white p-5 h-24 flex items-center justify-between">
      {/* Logo */}
      <Link
        href="/"
        className="text-3xl tracking-widest flex gap-2 items-center uppercase"
      >
        <HomeIcon />
        <span>BLOG-INLEVOR</span>
      </Link>

      {/* Barra de Busca e Botões de Autenticação */}
      <ul className="flex gap-6 items-center">
        {/* Barra de Busca */}
        <li>
          <SearchBar />
        </li>
        {/* Botões de Autenticação */}
        <li>
          <AuthButtons />
        </li>
      </ul>
    </nav>
  );
}
