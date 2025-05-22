// app/api/featured-banners/[id]/route.ts

import { NextResponse } from "next/server";
import {
  deleteFeaturedBanner,
  getFeaturedBannerById,
  updateFeaturedBanner,
} from "@/app/(admin)/dashboard/featured-banners/action";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const banner = await getFeaturedBannerById(id);
    if (!banner) {
      return NextResponse.json(
        { error: true, message: "Banner não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(banner, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao obter banner:", error);
    return NextResponse.json(
      { error: true, message: "Erro ao obter o banner." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const data = await request.json();

    const { title, link, linkTitle, imageUrl, publicId } = data;

    // Validar dados
    if (!title || !link || !linkTitle || !imageUrl || !publicId) {
      return NextResponse.json(
        { error: true, message: "Dados do banner estão incompletos." },
        { status: 400 }
      );
    }

    const bannerData = {
      title,
      link,
      linkTitle,
      imageUrl,
      publicId,
    };

    const response = await updateFeaturedBanner(id, bannerData);

    if (response.error) {
      return NextResponse.json(
        { error: true, message: response.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar banner via API:", error);
    return NextResponse.json(
      { error: true, message: "Falha ao atualizar o banner." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const response = await deleteFeaturedBanner(id);

    if (response.error) {
      return NextResponse.json(
        { error: true, message: response.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao deletar banner via API:", error);
    return NextResponse.json(
      { error: true, message: "Falha ao deletar o banner." },
      { status: 500 }
    );
  }
}
