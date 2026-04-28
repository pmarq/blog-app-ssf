// app/(admin)/dashboard/studio/page.tsx

import AdminLayout from "@/app/components/layout/AdminLayout";
import Link from "next/link";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioLanding() {
  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-6">
        <StudioNav />

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Studio</h1>
          <p className="text-muted-foreground">
            Produza conteúdo de alta qualidade com IA — blog, rascunhos e muito
            mais.
          </p>
        </div>

        {/* Card principal: Criar com IA */}
        <StudioCard
          title="✦ Criar com IA"
          description="Descreva o conteúdo que você quer criar e a IA gera o rascunho completo (título, slug, meta e corpo do texto) pronto para edição no editor."
          href="/dashboard/studio/create"
          featured
        />

        <div className="grid gap-4 md:grid-cols-2">
          <StudioCard
            title="Biblioteca"
            description="Suba materiais de referência (PDFs, documentos) para alimentar a IA com contexto do seu domínio."
            href="/dashboard/studio/library"
          />
          <StudioCard
            title="Calendário Editorial"
            description="Planeje a cadência de publicação e acompanhe o status de cada post — rascunho, agendado ou publicado."
            href="/dashboard/studio/agenda"
          />
          <StudioCard
            title="Regras & Voz"
            description="Defina temas prioritários, tom de escrita e público-alvo para que a IA sempre gere conteúdo alinhado com sua identidade."
            href="/dashboard/studio/settings"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

type CardProps = {
  title: string;
  description: string;
  href: string;
  featured?: boolean;
};

function StudioCard({ title, description, href, featured }: CardProps) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border p-4 hover:scale-[0.99] transition ${
        featured
          ? "border-primary bg-primary/5 md:col-span-2"
          : "border-border bg-card hover:bg-muted/50"
      }`}
    >
      <h2
        className={`text-lg font-semibold mb-1 ${
          featured ? "text-primary" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
