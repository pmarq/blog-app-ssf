"use client";

import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";
import { passwordValidation } from "@/validation/registerUser";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import ContinueWithGoogleButton from "./common/continue-with-google-button";

const formSchema = z.object({
  email: z.string().email(),
  password: passwordValidation,
});

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const auth = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await auth?.loginWithEmail(data.email, data.password);
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Error!",
        description:
          e.code === "auth/invalid-credential"
            ? "Incorrect credentials"
            : "An error occurred",
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
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Email" />
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
                  <FormControl>
                    <Input {...field} placeholder="Password" type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit" variant="secondary">
            Login
          </Button>
          <div>
            Forgotten your password?
            <Link href="/forgot-password" className="pl-2 underline">
              Reset it here.
            </Link>
          </div>
          <div className="text-center pb-5">or</div>
        </fieldset>
      </form>
      <ContinueWithGoogleButton />
    </Form>
  );
}
