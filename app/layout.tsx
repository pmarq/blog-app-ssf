// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Poppins } from "next/font/google";
import { Toaster } from "@/app/components/ui/toaster";
import { AuthProvider } from "@/context/auth";
import UserNav from "./components/common/nav/userNav";

/** ───────────────────────────────────────────
 * 1) BASE: domínio para metadataBase (canônicos/OG)
 *    - NEXT_PUBLIC_BASE_URL (produção)
 *    - VERCEL_URL (previews)
 *    - fallback (se quiser, deixe seu domínio principal)
 * ─────────────────────────────────────────── */
const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://inlevor.com.br");

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

/** (opcional) viewport padrão */
export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
};

/** 2) Metadata global (defaults) */
export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Inlevor – Imóveis de Alto Padrão",
    template: "%s | Inlevor",
  },
  description:
    "Portal Inlevor: lançamentos e oportunidades no mercado imobiliário de alto padrão, com conteúdo, análises e curadoria especializada.",
  applicationName: "Inlevor",
  openGraph: {
    type: "website",
    siteName: "Inlevor",
    url: "/",
    locale: "pt_BR",
    images: [
      {
        url: "/og-default.png", // coloque este arquivo em /public/og-default.png
        width: 1200,
        height: 630,
        alt: "Inlevor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@inlevor", // ajuste se tiver @
    creator: "@inlevor",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "/", // as páginas filhas (ex.: /blog) podem sobrescrever com caminho relativo
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.className} antialiased bg-slate-100`}>
        <AuthProvider>
          <UserNav />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
