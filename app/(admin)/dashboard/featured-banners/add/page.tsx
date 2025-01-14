// app/(admin)/dashboard/page.tsx
import FeaturedBannerForm from "@/app/components/common/featured-banner/FeaturedBannerForm";
import React from "react";


export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Banner</h1>
      <FeaturedBannerForm />
    </div>
  );
}
