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
            Studio
          </h1>
          <p className="text-secondary-dark dark:text-secondary-light">
            Área do Content Ops Studio. Endpoints mock já disponíveis: ideias,
            visual, curadoria, guardrails, jobs (blog/instagram).
          </p>
          <p className="text-xs text-secondary-dark/80 dark:text-secondary-light/80">
            Nada aqui publica ou altera posts ainda; é apenas a landing do
            Studio.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StudioCard
            title="Briefs"
            description="Crie e gerencie briefs. Abra no editor ou gere post a partir do brief."
            href="/dashboard/studio/briefs"
          />
          <StudioCard
            title="Curadoria"
            description="Ingestão de PDFs/imagens, extração de texto e referências, prompts Visia."
            href="/dashboard/studio/curadoria"
          />
          <StudioCard
            title="Asset Sets"
            description="Agrupe assets por formato (carousel/stories/ads/blog) e aplique guardrails."
            href="/dashboard/studio/asset-sets"
          />
          <StudioCard
            title="Pipeline"
            description="Kanban Brief → AssetSet → Post → Aprovação → Agendamento/Publicação."
            href="/dashboard/studio/pipeline"
          />
          <StudioCard
            title="Métricas"
            description="Insights de blog + Instagram com distribution logs."
            href="/dashboard/studio/metrics"
          />
          <StudioCard
            title="Guardrails"
            description="Regras de paleta/tipografia/ratio/CTA com severidade info/warn/block."
            href="/dashboard/studio/settings/guardrails"
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
