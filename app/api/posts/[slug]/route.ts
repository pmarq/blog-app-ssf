// app/api/images/posts/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Seu código para manipular a requisição, por exemplo:
  // Buscar a imagem relacionada ao slug, etc.

  return NextResponse.json({ message: `Slug recebido: ${slug}` });
}

////////estou usando essa api?
