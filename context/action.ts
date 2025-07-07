"use server";

import { auth } from "@/firebase/server";
import { cookies } from "next/headers";

/* ─────────── remover ─────────── */
export const removeToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("firebaseAuthToken");
  cookieStore.delete("firebaseAuthRefreshToken");
};

/* ─────────── gravar ─────────── */
export const setToken = async ({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) => {
  try {
    /* 1. valida o ID-token */
    const decoded = await auth.verifyIdToken(token);
    if (!decoded) return;

    /* 2. promove a admin se o e-mail estiver listado */
    const user = await auth.getUser(decoded.uid);
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim());

    if (adminEmails.includes(user.email ?? "") && !user.customClaims?.admin) {
      await auth.setCustomUserClaims(decoded.uid, { admin: true });
    }

    /* 3. grava os cookies */
    const cookieStore = await cookies();
    const commonOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/", // ← novo
      sameSite: "lax", // ← novo
    } as const;

    cookieStore.set("firebaseAuthToken", token, commonOpts);
    cookieStore.set("firebaseAuthRefreshToken", refreshToken, commonOpts);
  } catch (err) {
    console.error("setToken error:", err);
  }
};
