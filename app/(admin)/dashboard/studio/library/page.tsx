// app/(admin)/dashboard/studio/library/page.tsx

import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioLibraryPage() {
  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <StudioNav />

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Biblioteca</h1>
          <p className="text-muted-foreground text-sm">
            Faça upload de materiais de referência para enriquecer o contexto da
            IA ao criar conteúdo.
          </p>
        </div>

        {/* Upload area */}
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-4xl">📄</div>
          <p className="text-sm font-medium text-foreground">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, TXT — máx. 10 MB por arquivo
          </p>
          <button
            type="button"
            disabled
            className="mt-2 rounded-md border border-primary px-4 py-1.5 text-sm text-primary font-medium opacity-60 cursor-not-allowed"
          >
            Selecionar arquivo (em breve)
          </button>
        </div>

        {/* Lista vazia */}
        <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Nenhum material na biblioteca ainda.
        </div>
      </div>
    </AdminLayout>
  );
}
