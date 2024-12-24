import { NextResponse } from "next/server";
import { auth } from "@/firebase/server";

export async function POST(request: Request) {
  try {
    const { oobCode, email } = await request.json();

    if (!oobCode || !email) {
      return NextResponse.json(
        { error: true, message: "Missing oobCode or email" },
        { status: 400 }
      );
    }

    // Obtem o usuário pelo e-mail
    const user = await auth.getUserByEmail(email);

    if (!user.emailVerified) {
      // Atualiza o status de verificação do e-mail no Admin SDK
      await auth.updateUser(user.uid, { emailVerified: true });

      return NextResponse.json({
        error: false,
        message: "Email verified successfully!",
      });
    }

    return NextResponse.json({
      error: true,
      message: "Email is already verified.",
    });
  } catch (e: any) {
    console.error("Error verifying email:", e.message);

    return NextResponse.json(
      { error: true, message: e.message || "Could not verify email" },
      { status: 400 }
    );
  }
}
