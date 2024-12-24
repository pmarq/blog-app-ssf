import Link from "next/link";
import { HomeIcon } from "lucide-react";
import AuthButtons from "../auth-buttons";

export default function Navbar() {
  return (
    <nav className="bg-sky-950 text-white p-5 h-24 flex items-center justify-between">
      <Link
        href="/"
        className="text-3xl tracking-widest flex gap-2 items-center uppercase"
      >
        <HomeIcon />
        <span>Fire Homes</span>
      </Link>
      <ul className="flex gap-6 items-center">
        <li>
          <Link
            href="/property-search"
            className="uppercase tracking-widest hover:underline"
          >
            Property search
          </Link>
        </li>
        <li>
          <AuthButtons />
        </li>
      </ul>
    </nav>
  );
}
