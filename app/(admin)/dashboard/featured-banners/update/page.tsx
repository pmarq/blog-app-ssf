import { notFound } from "next/navigation";
import React from "react";
import AdminLayout from "@/app/components/layout/AdminLayout";
import FeaturedBannerForm from "@/app/components/common/featured-banner/FeaturedBannerForm";
import { getFeaturedBannerById } from "../action";

export default async function UpdateBannerPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: bannerId } = await searchParams;
  if (!bannerId) return notFound();

  const banner = await getFeaturedBannerById(bannerId);
  if (!banner) return notFound();

  // Converte Banner -> FeaturedBanner para o form
  const featuredBanner = {
    id: banner.id,
    title: banner.title,
    link: banner.link,
    linkTitle: banner.linkTitle,
    imageUrl: banner.banner?.url || "",
    publicId: banner.banner?.public_id || "",
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <FeaturedBannerForm initialValue={featuredBanner} />
      </div>
    </AdminLayout>
  );
}
