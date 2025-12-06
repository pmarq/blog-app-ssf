import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioCuradoria() {
  const items = [
    { id: "c1", type: "PDF", title: "Relatório mercado SP 2025", status: "extraído" },
    { id: "c2", type: "Imagem", title: "Fachada contemporânea", status: "curado" },
    { id: "c3", type: "PDF", title: "Dados FIPE-Zap", status: "pendente" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-2">
        <StudioNav />
        <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
          Curadoria
        </h1>
        <p className="text-secondary-dark dark:text-secondary-light">
          Ingestão de PDFs/imagens, extração de texto e referências, prompts
          Visia (mock).
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-3 text-sm bg-secondary-light/10 dark:bg-secondary-dark/30"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{item.type}</span>
                <span className="text-xs text-secondary-dark/80 dark:text-secondary-light/80">
                  {item.status}
                </span>
              </div>
              <p className="text-secondary-dark dark:text-secondary-light text-sm">
                {item.title}
              </p>
              <div className="mt-2 flex gap-2 text-xs">
                <button className="px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition">
                  Extrair texto
                </button>
                <button className="px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition">
                  Enviar ao Visia
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
