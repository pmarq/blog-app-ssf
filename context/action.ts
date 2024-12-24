"use server";

import { auth } from "@/firebase/server";
import { cookies } from "next/headers";

export const removeToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("firebaseAuthToken");
  cookieStore.delete("firebaseAuthRefreshToken");
};

export const setToken = async ({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) => {
  try {
    const verifiedToken = await auth.verifyIdToken(token);
    if (!verifiedToken) {
      return;
    }

    const userRecord = await auth.getUser(verifiedToken.uid);

    // Obtendo a lista de e-mails admin da variável de ambiente
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim());

    // Se o email do usuário estiver na lista de admins e ele ainda não for admin
    if (
      adminEmails.includes(userRecord.email || "") &&
      !userRecord.customClaims?.admin
    ) {
      await auth.setCustomUserClaims(verifiedToken.uid, { admin: true });
    }

    const cookieStore = await cookies();
    cookieStore.set("firebaseAuthToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    cookieStore.set("firebaseAuthRefreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  } catch (e) {
    console.log(e);
  }
};
