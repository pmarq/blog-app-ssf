// app/(admin)/dashboard/posts/update/[id]/page.tsx
export const dynamic = "force-dynamic";

import AdminLayout from "@/app/components/layout/AdminLayout";
import EditorWrapper from "./EditorWrapper";
import { getPostById } from "@/lib/posts";
import { notFound } from "next/navigation";

interface PageProps {
  // ⬇️ params é uma Promise
  params: Promise<{ id: string }>;
}

export default async function UpdatePage({ params }: PageProps) {
  // aguarde antes de acessar id
  const { id } = await params;

  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <AdminLayout title="Atualização de Post">
      <div className="max-w-4xl mx-auto">
        <EditorWrapper post={post} />
      </div>
    </AdminLayout>
  );
}
