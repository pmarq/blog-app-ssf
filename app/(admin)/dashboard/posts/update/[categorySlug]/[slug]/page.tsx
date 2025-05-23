// app/(admin)/dashboard/posts/update/[categoySlug]/[slug]/page.tsx

import AdminLayout from "@/app/components/layout/AdminLayout";
import EditorWrapper from "./EditorWrapper";
import { getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation"; // Import necessário

interface PageProps {
  params: Promise<{
    slug: string;
    categorySlug: string;
  }>;
}

const UpdatePage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const { slug, categorySlug } = resolvedParams;

  const post = await getPostBySlug(slug);

  // ✅ Aqui entra a verificação para garantir coerência
  if (!post || post.categorySlug !== categorySlug) {
    notFound(); // Evita inconsistência entre URL e dados
  }

  return (
    <AdminLayout title="Atualização de Post">
      <div className="max-w-4xl mx-auto">
        <EditorWrapper post={post} />
      </div>
    </AdminLayout>
  );
};

export default UpdatePage;
