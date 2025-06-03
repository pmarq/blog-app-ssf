"use server";

import { sendVerificationEmail } from "@/app/utils/email";
import { auth } from "@/firebase/server";
import { registerUserSchema } from "@/validation/registerUser";

export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
}) => {
  const validation = registerUserSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message || "Invalid data",
    };
  }

  try {
    // Cria o usuário (sem armazenar o retorno em uma variável não usada)
    await auth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    const actionCodeSettings = {
      url: `${process.env.APP_URL}/verify-email`,
      handleCodeInApp: true,
    };

    const verificationLink = await auth.generateEmailVerificationLink(
      data.email,
      actionCodeSettings
    );

    // Envia o e-mail de verificação
    await sendVerificationEmail(data.email, verificationLink);

    return {
      error: false,
      message:
        "User registered successfully. Check your email to verify your account.",
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Could not register user";
    console.error("Error during registration:", message);
    return {
      error: true,
      message,
    };
  }
};
