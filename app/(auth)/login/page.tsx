import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

import Link from "next/link";
import LoginForm from "./login-form";

export default function Login() {
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
