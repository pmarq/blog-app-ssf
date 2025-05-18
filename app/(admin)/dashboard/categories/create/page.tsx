import { Breadcrumbs } from "@/app/components/ui/Breadcrumb";
import NewCategoryForm from "./NewCategoryForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import AdminLayout from "@/app/components/layout/AdminLayout"; // ajuste o caminho se necessário

export default function CreateCategoryPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <Breadcrumbs
          items={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard/categories", label: "Categorias" },
            { label: "Nova Categoria" },
          ]}
        />
        <Card className="mt-5">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Criar Nova Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NewCategoryForm />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
