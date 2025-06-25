import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import RegisterForm from "./register-form";
import Link from "next/link";

export default function Register() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Cadastro</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter>
        Já tem uma conta?
        <Link href="/login" className="pl-2 underline">
          Faça login aqui
        </Link>
      </CardFooter>
    </Card>
  );
}
