// app/(admin)/dashboard/featured-banners/page.tsx
export const dynamic = "force-dynamic";

import FeaturedBannerTable from "@/app/components/common/featured-banner/FeaturedProductTable";
import React from "react";
import { Banner, FeaturedBanner } from "@/app/models/Banners";
import { getFeaturedBanners } from "./action";
import AdminLayout from "@/app/components/layout/AdminLayout";

export default async function Page() {
  const banners: Banner[] = await getFeaturedBanners(); // Obtenha os banners do Firestore

  // Transforme Banner[] em FeaturedBanner[]
  const featuredBanners: FeaturedBanner[] = banners.map((banner) => ({
    id: banner.id,
    title: banner.title,
    link: banner.link,
    linkTitle: banner.linkTitle,
    imageUrl: banner.banner.url, // Mapeie url para imageUrl
    publicId: banner.banner.public_id, // Mapeie public_id para publicId
  }));

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Featured Banners</h1>
        <FeaturedBannerTable banners={featuredBanners} />
      </div>
    </AdminLayout>
  );
}
