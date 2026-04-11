import { NextRequest, NextResponse } from "next/server";
import { auth, portalDb, portalStorage } from "@/firebase/server";

export const runtime = "nodejs";

const normalizeId = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const safeFileName = (value: string) =>
  value
    .trim()
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180) || "documento.pdf";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const authToken = String(form.get("authToken") || "").trim();

    const orgIdRaw = String(form.get("orgId") || "inlevor").trim();
    const marketScopeRaw = String(form.get("marketScope") || "br").trim();
    const autoIndex = String(form.get("autoIndex") || "true").trim() !== "false";

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "authToken e obrigatorio." },
        { status: 401 },
      );
    }

    const verified = await auth.verifyIdToken(authToken);
    if (!verified.admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Envie um PDF em 'file'." },
        { status: 400 },
      );
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Apenas PDFs sao aceitos." },
        { status: 400 },
      );
    }

    const orgId = normalizeId(orgIdRaw) || "inlevor";
    const marketScope = normalizeId(marketScopeRaw) || "br";
    const marketProjectId = `market__${orgId}__${marketScope}`.slice(0, 180);

    const sourceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    const filename = safeFileName(file.name || "documento.pdf");
    const storagePath = `kb/market/${orgId}/${marketScope}/sources/${sourceId}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await portalStorage.bucket().file(storagePath).save(buffer, {
      contentType: file.type || "application/pdf",
      resumable: false,
    });

    const now = new Date();
    const projectRef = portalDb.collection("kb_projects").doc(marketProjectId);
    const sourceRef = projectRef.collection("sources").doc(sourceId);
    const preparationId = `${marketProjectId}__${sourceId}`;
    const preparationRef = portalDb.collection("kb_preparations").doc(preparationId);

    const projectSnap = await projectRef.get();
    const nextSourceCount =
      (projectSnap.exists ? Number(projectSnap.data()?.sourceCount || 0) : 0) + 1;

    const batch = portalDb.batch();

    batch.set(
      projectRef,
      {
        entityType: "market",
        orgId,
        marketScope,
        latestSourceId: sourceId,
        sourceCount: nextSourceCount,
        updatedAt: now,
        createdAt: projectSnap.exists ? projectSnap.data()?.createdAt || now : now,
      },
      { merge: true },
    );

    batch.set(
      sourceRef,
      {
        id: sourceId,
        label: "Documento de mercado",
        type: "market_doc",
        documentType: "market_document",
        entityType: "market",
        entityId: marketProjectId,
        linkedProjectId: "",
        storagePath,
        owner: "blog",
        status: "uploaded",
        preparationStatus: "queued",
        indexationStatus: "not_started",
        shouldIndexInKnowledgeBase: true,
        shouldAffectAutofill: false,
        shouldAffectPublicDescription: false,
        kbDomain: "market",
        orgId,
        marketScope,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    batch.set(
      preparationRef,
      {
        id: preparationId,
        projectId: marketProjectId,
        sourceId,
        storagePath,
        sourceType: "market_doc",
        documentType: "market_document",
        status: "queued",
        autoIndex,
        kbDomain: "market",
        orgId,
        marketScope,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    await batch.commit();

    return NextResponse.json({
      success: true,
      marketProjectId,
      sourceId,
      storagePath,
      preparationId,
    });
  } catch (error) {
    console.error("[studio/kb/market/add-source] error:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao adicionar documento de mercado." },
      { status: 500 },
    );
  }
}
