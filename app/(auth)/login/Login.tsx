"use client";

import Link from "next/link";
import LoginForm from "./login-form";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function Login() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Exemplo: mostra mensagem após registro bem-sucedido
    if (searchParams.get("verify") === "1") {
      toast({
        title: "Conta verificada!",
        description: "Seu e-mail foi verificado. Agora é só fazer login.",
        variant: "success",
      });
    }
    // Pode adicionar outros tratamentos, como reset de senha, etc.
  }, [searchParams, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter>
        Não tem uma conta?
        <Link href="/register" className="underline pl-2">
          Cadastre-se aqui.
        </Link>
      </CardFooter>
    </Card>
  );
}
