import AdminLayout from "@/app/components/layout/AdminLayout";
import Link from "next/link";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioLanding() {
  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-6">
        <StudioNav />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
            Criar
          </h1>
          <p className="text-secondary-dark dark:text-secondary-light">
            Gere conteúdos (blog, Instagram, newsletter) e imagens a partir da
            Biblioteca.
          </p>
          <p className="text-xs text-secondary-dark/80 dark:text-secondary-light/80">
            Se a Biblioteca ainda estiver vazia, comece por Mercado (KB) para
            subir PDFs e testar busca.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StudioCard
            title="Conteúdos"
            description="Crie peças e variações por canal. Use isso como “fila de produção” antes do calendário."
            href="/dashboard/studio/briefs"
          />
          <StudioCard
            title="Biblioteca"
            description="Suba materiais (PDFs, referências, templates) e valide a busca. Mercado e projetos ficam separados."
            href="/dashboard/studio/library"
          />
          <StudioCard
            title="Calendário"
            description="Planeje cadência por canal e acompanhe status do que está pronto para publicar."
            href="/dashboard/studio/agenda"
          />
          <StudioCard
            title="Regras & Voz"
            description="Defina temas (pilares), tom e regras de conteúdo para manter consistência e evitar erros."
            href="/dashboard/studio/settings/editorial"
          />
          <StudioCard
            title="Métricas"
            description="Insights de blog + Instagram com distribution logs."
            href="/dashboard/studio/metrics"
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
};

function StudioCard({ title, description, href }: CardProps) {
  return (
    <Link
      href={href}
      className="block rounded border border-secondary-dark/30 dark:border-secondary-light/20 bg-secondary-light/10 dark:bg-secondary-dark/30 p-4 hover:scale-[0.99] transition"
    >
      <h2 className="text-lg font-semibold text-highlight-light dark:text-highlight-dark mb-1">
        {title}
      </h2>
      <p className="text-sm text-secondary-dark dark:text-secondary-light">
        {description}
      </p>
    </Link>
  );
}
