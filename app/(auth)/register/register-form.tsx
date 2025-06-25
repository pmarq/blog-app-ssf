"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ContinueWithGoogleButton from "@/app/components/common/continue-with-google-button";
import { Button } from "@/app/components/ui/button";
import { registerUserSchema } from "@/validation/registerUser";
import { registerUser } from "./action";

export default function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof registerUserSchema>) => {
    try {
      const response = await registerUser(data);

      if (response?.error) {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Conta criada!",
        description:
          "Enviamos um e-mail de verificação. Clique no link do e-mail para ativar sua conta. Depois faça login.",
        variant: "success",
      });

      // Redireciona para login com um query param
      router.push("/login?from=register");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast({
        title: "Unexpected Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Seu nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Seu nome" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E-mail" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Senha" type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Confirmar senha"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button variant="secondary" type="submit">
            Cadastrar
          </Button>
          <div className="text-center">ou</div>
        </fieldset>
      </form>
      <ContinueWithGoogleButton />
    </Form>
  );
}
