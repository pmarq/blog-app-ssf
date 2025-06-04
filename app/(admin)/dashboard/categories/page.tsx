export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import CategoryListClient from "./CategoryListClient";
import { Button } from "@/app/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import AdminLayout from "@/app/components/layout/AdminLayout";

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        {/* Título */}
        <h1 className="text-2xl font-semibold">Categorias</h1>

        {/* Botão abaixo do título */}
        <div>
          <Link href="/dashboard/categories/create">
            <Button>
              <PlusCircleIcon className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </Link>
        </div>

        {/* Lista de categorias */}
        <CategoryListClient />
      </div>
    </AdminLayout>
  );
}
