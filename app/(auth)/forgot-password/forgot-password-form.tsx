"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { auth } from "@/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!auth) {
          setMessage("Firebase não configurado. Verifique as variáveis de ambiente.");
          return;
        }
        await sendPasswordResetEmail(auth, email);
        setMessage("Se existir uma conta com este e-mail, enviaremos o link de reset.");
      }}
      className="flex flex-col gap-4"
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button className="w-full" type="submit">
        Reset Password
      </Button>
      {message ? <div className="text-sm text-slate-600">{message}</div> : null}
    </form>
  );
}
