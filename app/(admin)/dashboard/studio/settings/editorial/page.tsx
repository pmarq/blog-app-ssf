export const dynamic = "force-dynamic";

import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";
import EditorialClient from "./EditorialClient";
import { getEditorialSettings, serializeEditorialSettings } from "@/lib/studio/settings";

export default async function StudioEditorialPage() {
  const settings = await getEditorialSettings();

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-4">
        <StudioNav />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
            Editorial
          </h1>
          <p className="text-secondary-dark dark:text-secondary-light">
            Pilares, cadencia e guardrails para geracao de pautas.
          </p>
        </div>

        <EditorialClient initialSettings={serializeEditorialSettings(settings)} />
      </div>
    </AdminLayout>
  );
}
