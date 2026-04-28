// app/(admin)/dashboard/studio/settings/page.tsx

import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioSettingsPage() {
  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <StudioNav />

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Regras & Voz
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure o tom, os temas prioritários e as regras editoriais para
            que a IA sempre gere conteúdo alinhado com sua identidade.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          {/* Tom de voz */}
          <div className="space-y-2">
            <label
              htmlFor="tone"
              className="block text-sm font-medium text-foreground"
            >
              Tom de voz padrão
            </label>
            <select
              id="tone"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue="informal"
            >
              <option value="informal">Informal e acessível</option>
              <option value="formal">Formal e técnico</option>
              <option value="educativo">Educativo e didático</option>
              <option value="inspiracional">Inspiracional</option>
            </select>
          </div>

          {/* Público-alvo */}
          <div className="space-y-2">
            <label
              htmlFor="audience"
              className="block text-sm font-medium text-foreground"
            >
              Público-alvo
            </label>
            <input
              id="audience"
              type="text"
              placeholder="Ex.: Cozinheiros iniciantes e entusiastas da gastronomia"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Temas prioritários */}
          <div className="space-y-2">
            <label
              htmlFor="topics"
              className="block text-sm font-medium text-foreground"
            >
              Temas prioritários (pilares de conteúdo)
            </label>
            <textarea
              id="topics"
              rows={3}
              placeholder="Ex.: Fermentação, Técnicas de corte, Especiarias do mundo, Receitas rápidas"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Regras editoriais */}
          <div className="space-y-2">
            <label
              htmlFor="rules"
              className="block text-sm font-medium text-foreground"
            >
              Regras e restrições editoriais
            </label>
            <textarea
              id="rules"
              rows={3}
              placeholder="Ex.: Evitar jargões técnicos sem explicação. Sempre incluir dica prática ao final. Não usar a palavra 'delicioso'."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-60 cursor-not-allowed"
          >
            Salvar configurações
            <span className="text-xs">(em breve)</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
