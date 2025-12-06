import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioPipeline() {
  const stages = [
    { id: "p1", title: "Brief Zona Sul", stage: "Brief", owner: "CMO" },
    { id: "p2", title: "Carousel retrofit", stage: "AssetSet", owner: "Design" },
    { id: "p3", title: "Post blog premium", stage: "Post", owner: "Content" },
    { id: "p4", title: "Campanha stories", stage: "Aprovação", owner: "CMO" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-2">
        <StudioNav />
        <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
          Pipeline
        </h1>
        <p className="text-secondary-dark dark:text-secondary-light">
          Kanban Brief → AssetSet → Post → Aprovação → Agendamento/Publicação
          (mock).
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {stages.map((item) => (
            <div
              key={item.id}
              className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-3 bg-secondary-light/10 dark:bg-secondary-dark/30"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{item.title}</span>
                <span className="text-xs text-secondary-dark/80 dark:text-secondary-light/80">
                  {item.stage}
                </span>
              </div>
              <p className="text-sm text-secondary-dark dark:text-secondary-light">
                Owner: {item.owner}
              </p>
              <div className="mt-2 flex gap-2 text-xs">
                <button className="px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition">
                  Mover próximo
                </button>
                <button className="px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition">
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
