"use server";

import { auth, firestore, portalDb } from "@/firebase/server";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { registerUserSchema } from "@/validation/registerUser";

const firebaseErrorMessages: Record<string, string> = {
  "auth/email-already-exists":
    "Este e-mail já está registrado. Tente fazer login ou recuperar sua senha.",
  "auth/email-already-in-use":
    "Este e-mail já está registrado. Tente fazer login ou recuperar sua senha.",
  "auth/invalid-email": "Informe um e-mail válido.",
  "auth/invalid-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/invalid-display-name": "Nome de usuário inválido.",
  "auth/invalid-argument":
    "Dados informados inválidos. Revise e tente novamente.",
  "auth/operation-not-allowed": "O cadastro está temporariamente indisponível.",
  "auth/uid-already-exists": "Já existe um usuário com este identificador.",
  "auth/user-not-found": "Usuário não encontrado.",
};

export const registerUser = async (data: {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}) => {
  const validation = registerUserSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "An error occurred",
    };
  }

  let userRecord;

  try {
    // 1. Cria o usuário no AUTH CENTRALIZADO
    userRecord = await auth.createUser({
      displayName: data.name,
      email: data.email,
      password: data.password,
    });

    // Define claims padrão
    await auth.setCustomUserClaims(userRecord.uid, { role: "user" });

    // 2. Cria perfis nos dois Firestore em paralelo
    await Promise.all([
      firestore.collection("users").doc(userRecord.uid).set({
        name: data.name,
        email: data.email,
        createdAt: new Date(),
        role: "user",
      }),
      portalDb.collection("users").doc(userRecord.uid).set({
        name: data.name,
        email: data.email,
        createdAt: new Date(),
        role: "user",
      }),
    ]);

    // 3. Gera link de verificação de email
    const actionCodeSettings = {
      url: `${process.env.APP_URL}/verify-email`,
      handleCodeInApp: true,
    };

    const verificationLink = await auth.generateEmailVerificationLink(
      data.email,
      actionCodeSettings
    );

    // 4. Envia email de verificação
    await sendVerificationEmail(data.email, verificationLink);

    return {
      error: false,
      message: "User created successfully in both databases!",
    };
  } catch (e: unknown) {
    // Acesso seguro às propriedades do erro (sem perder type safety)
    const code =
      typeof e === "object" && e && "code" in e ? (e as any).code : undefined;
    const message =
      (code && firebaseErrorMessages[code]) ||
      (typeof e === "object" && e && "message" in e
        ? (e as any).message
        : undefined) ||
      "Não foi possível registrar o usuário. Tente novamente.";

    // Rollback se necessário
    if (userRecord?.uid) {
      try {
        await auth.deleteUser(userRecord.uid);
      } catch (rollbackErr) {
        // Loga erro de rollback, se necessário
        console.error(
          "Rollback failed (could not delete user from Auth):",
          rollbackErr
        );
      }
    }

    return {
      error: true,
      message,
    };
  }
};
