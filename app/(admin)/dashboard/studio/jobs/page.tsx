import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";

const mockJobs = [
  { id: "j1", type: "blog_publish", status: "queued", runAt: "2025-12-06T10:00:00Z" },
  { id: "j2", type: "instagram_publish", status: "running", runAt: "2025-12-06T10:05:00Z" },
  { id: "j3", type: "blog_publish", status: "succeeded", runAt: "2025-12-05T18:00:00Z" },
];

export default function StudioJobs() {
  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-2">
        <StudioNav />
        <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
          Jobs
        </h1>
        <p className="text-secondary-dark dark:text-secondary-light">
          Fila de jobs (mock). Lease/lock e idempotência ainda não habilitados aqui.
        </p>

        <div className="mt-4 overflow-hidden rounded border border-secondary-dark/30 dark:border-secondary-light/30">
          <table className="w-full text-sm">
            <thead className="bg-secondary-light/40 dark:bg-secondary-dark/40 text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Status</th>
                <th className="p-3">runAt</th>
              </tr>
            </thead>
            <tbody>
              {mockJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-t border-secondary-dark/20 dark:border-secondary-light/20"
                >
                  <td className="p-3">{job.id}</td>
                  <td className="p-3">{job.type}</td>
                  <td className="p-3 capitalize">{job.status}</td>
                  <td className="p-3">{job.runAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
