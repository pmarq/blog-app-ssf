// app/api/cloudinary/list-images/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/firebase/server";


 // Ajuste o caminho conforme a sua estrutura de pastas

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
    // Obter o token de autenticação do cabeçalho Authorization
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Autenticação necessária." },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verificar o token de autenticação
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return NextResponse.json(
        { error: "Token de autenticação inválido ou expirado." },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Verificar se a pasta solicitada pertence ao usuário autenticado
    const expectedFolder = `gallery/${uid}`;
    if (folder !== expectedFolder) {
      return NextResponse.json(
        { error: "Acesso negado à pasta solicitada." },
        { status: 403 }
      );
    }

    // Interagir com o Cloudinary para listar as imagens
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 100,
    });

    const resources = result.resources.map((resource: any) => ({
      src: `${resource.secure_url}?f_auto,q_auto`, // serve WebP/AVIF e compressão automática
      public_id: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
    }));

    console.log("Recursos retornados do Cloudinary:", resources); // Adicione este log

    return NextResponse.json({ resources }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar imagens no Cloudinary:", error);
    return NextResponse.json(
      { error: "Erro ao listar imagens" },
      { status: 500 }
    );
  }
}
