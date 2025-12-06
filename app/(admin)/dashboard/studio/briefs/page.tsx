import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioBriefs() {
  const briefs = [
    { id: "b1", title: "Lançamento Zona Sul", status: "draft", owner: "CMO" },
    { id: "b2", title: "Guia de investimentos 2025", status: "in_review", owner: "CMO" },
    { id: "b3", title: "Stories retrofit", status: "approved", owner: "Design" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-2">
        <StudioNav />
        <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
          Briefs
        </h1>
        <p className="text-secondary-dark dark:text-secondary-light">
          Crie e gerencie briefs. Integração mock por enquanto.
        </p>

        <div className="mt-4 overflow-hidden rounded border border-secondary-dark/30 dark:border-secondary-light/30">
          <table className="w-full text-sm">
            <thead className="bg-secondary-light/40 dark:bg-secondary-dark/40 text-left">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Status</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {briefs.map((b) => (
                <tr key={b.id} className="border-t border-secondary-dark/20 dark:border-secondary-light/20">
                  <td className="p-3">{b.title}</td>
                  <td className="p-3 capitalize">{b.status}</td>
                  <td className="p-3">{b.owner}</td>
                  <td className="p-3 space-x-2">
                    <button className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition">
                      Abrir no editor
                    </button>
                    <button className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition">
                      Criar post
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
