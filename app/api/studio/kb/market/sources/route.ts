import { NextRequest, NextResponse } from "next/server";
import { auth, portalDb } from "@/firebase/server";

export const runtime = "nodejs";

const normalizeId = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
};

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await auth.verifyIdToken(token);
    if (!decoded.admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const orgId = normalizeId(url.searchParams.get("orgId") || "inlevor") || "inlevor";
    const marketScope = normalizeId(url.searchParams.get("marketScope") || "br") || "br";
    const marketProjectId = `market__${orgId}__${marketScope}`.slice(0, 180);

    const snap = await portalDb
      .collection("kb_projects")
      .doc(marketProjectId)
      .collection("sources")
      .get();

    const sources = snap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
      .sort((a, b) => {
        const aMs = Number((a as any).updatedAt?.toMillis?.() || 0);
        const bMs = Number((b as any).updatedAt?.toMillis?.() || 0);
        return bMs - aMs;
      })
      .map((source) => ({
        id: String((source as any).id || ""),
        label: String((source as any).label || ""),
        type: String((source as any).type || ""),
        documentType: String((source as any).documentType || ""),
        storagePath: String((source as any).storagePath || ""),
        preparationStatus: String((source as any).preparationStatus || "not_started"),
        indexationStatus: String((source as any).indexationStatus || "not_started"),
        updatedAt: (source as any).updatedAt || null,
      }));

    return NextResponse.json({
      success: true,
      orgId,
      marketScope,
      marketProjectId,
      sources,
    });
  } catch (error) {
    console.error("[studio/kb/market/sources] error:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao carregar fontes." },
      { status: 500 },
    );
  }
}

