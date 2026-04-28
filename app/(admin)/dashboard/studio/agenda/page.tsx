// app/(admin)/dashboard/studio/agenda/page.tsx

import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

const STATUS_COLORS: Record<string, string> = {
  Rascunho: "bg-muted text-muted-foreground",
  Agendado: "bg-primary/10 text-primary",
  Publicado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const PLACEHOLDER_ITEMS = [
  { title: "Como fazer pão de fermentação natural", status: "Publicado", date: "10/04/2026" },
  { title: "5 técnicas de corte que todo cozinheiro deve saber", status: "Agendado", date: "02/05/2026" },
  { title: "Introdução às especiarias asiáticas", status: "Rascunho", date: "—" },
];

export default function StudioAgendaPage() {
  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <StudioNav />

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Calendário Editorial
          </h1>
          <p className="text-muted-foreground text-sm">
            Planeje e acompanhe a publicação de cada post — rascunho, agendado
            ou publicado.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Título
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Data prevista
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PLACEHOLDER_ITEMS.map((item) => (
                <tr key={item.title} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3 text-foreground">{item.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Gestão completa de agendamento estará disponível em breve. Por ora,
          use esta visão para planejar manualmente.
        </p>
      </div>
    </AdminLayout>
  );
}
