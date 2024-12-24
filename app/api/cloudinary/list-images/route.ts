// app/api/cloudinary/list-images/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");

  if (!folder) {
    return NextResponse.json(
      { error: "Parâmetro 'folder' é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 100,
    });

    const resources = result.resources.map((resource: any) => ({
      src: resource.secure_url,
      public_id: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
    }));

    return NextResponse.json({ resources }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar imagens no Cloudinary:", error);
    return NextResponse.json(
      { error: "Erro ao listar imagens" },
      { status: 500 }
    );
  }
}
