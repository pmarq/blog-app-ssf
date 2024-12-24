// app/admin/posts/create/page.tsx

import { Metadata } from "next";
import CreatePost from "./createPost";
import AdminLayout from "@/app/components/layout/AdminLayout";

// Define metadata for the page
export const metadata: Metadata = {
  title: "New Post | Dev Blogs",
  description: "Create a new blog post",
};

export default function Create() {
  return (
    <AdminLayout>
      <CreatePost />
    </AdminLayout>
  );
}
