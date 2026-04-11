import AdminLayout from "@/app/components/layout/AdminLayout";
import Link from "next/link";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioLibraryPage() {
  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-6">
        <StudioNav />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
            Biblioteca
          </h1>
          <p className="text-secondary-dark dark:text-secondary-light">
            Centralize materiais (PDFs, referências, templates) e valide a busca
            antes de usar em automações.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <LibraryCard
            title="Mercado (KB)"
            description="Envie PDFs de mercado para o Qdrant com escopo por org e região. Teste a busca sem misturar com projetos."
            href="/dashboard/studio/kb-market"
          />
          <LibraryCard
            title="Curadoria (extração)"
            description="Ingestão e extração de PDFs/imagens. Use para validar texto e estrutura antes de indexar."
            href="/dashboard/studio/curadoria"
          />
          <LibraryCard
            title="Marca & Templates"
            description="Organize assets por formato (carrossel/story/capa de blog) para padronizar geração de imagens e layouts."
            href="/dashboard/studio/asset-sets"
          />
        </div>

        <div className="rounded border border-secondary-dark/30 dark:border-secondary-light/20 bg-secondary-light/10 dark:bg-secondary-dark/30 p-4">
          <div className="text-sm font-semibold text-secondary-dark dark:text-secondary-light">
            Fluxo recomendado
          </div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-secondary-dark/90 dark:text-secondary-light/90 space-y-1">
            <li>Suba materiais em Mercado (KB) ou use Curadoria para checar o conteúdo.</li>
            <li>Teste a busca e confirme que as evidências fazem sentido.</li>
            <li>Volte em Criar para gerar texto e imagens com base na biblioteca.</li>
          </ol>
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

function LibraryCard({ title, description, href }: CardProps) {
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

