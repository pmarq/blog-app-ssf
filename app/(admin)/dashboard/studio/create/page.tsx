// app/(admin)/dashboard/studio/create/page.tsx

import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioCreatePage() {
  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <StudioNav />

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            ✦ Criar com IA
          </h1>
          <p className="text-muted-foreground text-sm">
            Descreva o conteúdo que você quer gerar. A IA produz um rascunho
            completo pronto para edição.
          </p>
        </div>

        {/* Placeholder — campo de prompt */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-foreground"
            >
              O que você quer criar?
            </label>
            <textarea
              id="prompt"
              rows={5}
              placeholder="Ex.: Um artigo sobre técnicas de fermentação natural para pão artesanal, tom informal, voltado para iniciantes..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="format"
                className="block text-sm font-medium text-foreground"
              >
                Formato
              </label>
              <select
                id="format"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="blog">Post de Blog</option>
                <option value="newsletter">Newsletter</option>
                <option value="social">Redes Sociais</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="tone"
                className="block text-sm font-medium text-foreground"
              >
                Tom
              </label>
              <select
                id="tone"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="informal">Informal</option>
                <option value="formal">Formal</option>
                <option value="educativo">Educativo</option>
                <option value="inspiracional">Inspiracional</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-60 cursor-not-allowed"
          >
            Gerar Conteúdo
            <span className="text-xs">(em breve)</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          A integração com IA estará disponível em breve. Por ora, use este
          espaço para rabiscar prompts e estruturar suas ideias.
        </p>
      </div>
    </AdminLayout>
  );
}
