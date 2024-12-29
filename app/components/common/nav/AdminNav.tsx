"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Box,
  Users,
  Mail,
  Contact,
  ChevronsLeft,
  ChevronsRight,
  LucideProps,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ComponentType<LucideProps>;
  href: string;
}

const NAV_OPEN_WIDTH = "w-60";
const NAV_CLOSE_WIDTH = "w-12";
const NAV_VISIBILITY = "nav-visibility";

export default function AdminNav() {
  const navRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  const navItems: NavItem[] = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/posts", icon: Box, label: "Posts" },
    { href: "/dashboard/users", icon: Users, label: "Users" },
    { href: "/dashboard/comments", icon: Mail, label: "Comments" },
    { href: "/dashboard/contact", icon: Contact, label: "Contact" },
  ];

  // Função que gerencia a expansão/recolhimento do menu
  const toggleNav = (visibility: boolean) => {
    if (!navRef.current) return;
    const { classList } = navRef.current;
    if (visibility) {
      classList.remove(NAV_OPEN_WIDTH);
      classList.add(NAV_CLOSE_WIDTH);
    } else {
      classList.add(NAV_OPEN_WIDTH);
      classList.remove(NAV_CLOSE_WIDTH);
    }
  };

  // Inverte o estado do menu e salva no localStorage
  const updateNavState = () => {
    toggleNav(visible);
    const newState = !visible;
    setVisible(newState);
    localStorage.setItem(NAV_VISIBILITY, JSON.stringify(newState));
  };

  // Ao montar o componente, recupera o estado anterior do menu
  useEffect(() => {
    const navState = localStorage.getItem(NAV_VISIBILITY);
    if (navState !== null) {
      const newState = JSON.parse(navState);
      setVisible(newState);
      toggleNav(!newState);
    } else {
      setVisible(true); // por padrão, expandido
    }
  }, []);

  return (
    <nav
      ref={navRef}
      className="h-screen w-60 shadow-sm 
      bg-secondary-light dark:bg-secondary-dark 
      flex flex-col justify-between transition-width overflow-hidden sticky top-0"
    >
      <div>
        {/* Link principal (Admin) */}
        <Link
          href="/admin"
          title={!visible ? "Admin" : ""} // tooltip nativo quando recolhido
          className="flex items-center space-x-2 p-3 mb-10"
        >
          {visible && (
            <span className="text-highlight-light dark:text-highlight-dark text-xl font-semibold leading-none">
              Admin
            </span>
          )}
        </Link>

        <div className="space-y-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              // Se o menu está recolhido (!visible), exibimos um tooltip nativo no 'title'
              title={!visible ? item.label : ""}
              className="flex items-center 
              text-highlight-light dark:text-highlight-dark text-ml
              p-3 hover:scale-[0.98] transition"
            >
              <item.icon size={24} />
              {visible && (
                <span className="ml-2 leading-none">{item.label}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <button
        onClick={updateNavState}
        className="text-highlight-light dark:text-highlight-dark 
        text-xl p-3 hover:scale-[0.98] transition self-end"
      >
        {visible ? <ChevronsLeft size={25} /> : <ChevronsRight size={25} />}
      </button>
    </nav>
  );
}
