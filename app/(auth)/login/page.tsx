"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

import LoginForm from "./login-form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("from") === "register") {
      toast({
        title: "Verifique seu e-mail!",
        description:
          "Enviamos um e-mail de verificação. Clique no link para ativar sua conta antes de fazer login.",
        variant: "success", // ou "info", "default", depende do seu design
      });
    }
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
        Don&apos;t have an account?
        <Link href="/register" className="underline pl-2">
          Register here.
        </Link>
      </CardFooter>
    </Card>
  );
}
