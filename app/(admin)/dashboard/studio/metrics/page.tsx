import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

export default function StudioMetrics() {
  const metrics = [
    { id: "m1", title: "Post blog premium", channel: "blog", impressions: 1200, ctr: "2.1%" },
    { id: "m2", title: "Carousel retrofit", channel: "instagram", impressions: 5400, ctr: "1.8%" },
    { id: "m3", title: "Stories Zona Sul", channel: "instagram", impressions: 3100, ctr: "2.4%" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-2">
        <StudioNav />
        <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
          Métricas
        </h1>
        <p className="text-secondary-dark dark:text-secondary-light">
          Insights de blog + Instagram e distribution logs (mock).
        </p>

        <div className="mt-4 overflow-hidden rounded border border-secondary-dark/30 dark:border-secondary-light/30">
          <table className="w-full text-sm">
            <thead className="bg-secondary-light/40 dark:bg-secondary-dark/40 text-left">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Canal</th>
                <th className="p-3">Impressões</th>
                <th className="p-3">CTR</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => (
                <tr key={row.id} className="border-t border-secondary-dark/20 dark:border-secondary-light/20">
                  <td className="p-3">{row.title}</td>
                  <td className="p-3 capitalize">{row.channel}</td>
                  <td className="p-3">{row.impressions}</td>
                  <td className="p-3">{row.ctr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
