// app/(admin)/dashboard/posts/update/[slug]/page.tsx

import AdminLayout from "@/app/components/layout/AdminLayout";
import EditorWrapper from "./EditorWrapper";
import { getPostBySlug } from "@/lib/posts";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const UpdatePage = async ({ params }: PageProps) => {
  // Await the params to resolve the promise
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <AdminLayout title="Atualização de Post">
        <div>Post não encontrado</div>
      </AdminLayout>
    );
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

