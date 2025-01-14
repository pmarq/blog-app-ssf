// app/(admin)/dashboard/page.tsx
import FeaturedBannerForm from "@/app/components/common/featured-banner/FeaturedBannerForm";
import AdminLayout from "@/app/components/layout/AdminLayout";
import React from "react";

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="p-4">
        <FeaturedBannerForm />
      </div>
    </AdminLayout>
  );
}
