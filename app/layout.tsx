// app/layout.tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Poppins } from "next/font/google";
import { Toaster } from "@/app/components/ui/toaster";
import { AuthProvider } from "@/context/auth";
import UserNav from "./components/common/nav/userNav";

/**
 * Domínio base para metadados absolutos
 * - Em produção, use NEXT_PUBLIC_BASE_URL = https://saboressemfronteiras.com.br
 * - Em previews (Vercel), usa VERCEL_URL
 */
const SITE =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://saboressemfronteiras.com.br");

/**
 * Como este projeto é o BLOG com basePath "/blog",
 * defina o path base das URLs públicas do app.
 * Se no dev você não usa basePath, troque para "" (string vazia).
 */
const PUBLIC_BASE_PATH = "/blog"; // <- importante para canônicos e OG

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Blog | Sabores Sem Fronteiras",
    template: "%s | Sabores Sem Fronteiras",
  },
  description:
    "Receitas, técnicas e cultura gastronômica para cozinhar melhor — conteúdo editorial do Sabores Sem Fronteiras.",
  applicationName: "Sabores Sem Fronteiras",
  openGraph: {
    type: "website",
    siteName: "Sabores Sem Fronteiras",
    // A URL pública da home DESTE app (blog)
    url: `${PUBLIC_BASE_PATH}`,
    locale: "pt_BR",
    images: [
      {
        url: "/blog-og.png",
        width: 1200,
        height: 630,
        alt: "Sabores Sem Fronteiras",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/blog-og.png"],
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
    // canônico padrão do BLOG (páginas filhas podem sobrescrever)
    canonical: `${PUBLIC_BASE_PATH}`,
    // opcional: hreflang
    languages: {
      "pt-BR": `${PUBLIC_BASE_PATH}`,
    },
  },
  // opcional: verificação do GSC (adicione seu token)
  // verification: { google: "XXXXXXXXXXXXXXX" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
