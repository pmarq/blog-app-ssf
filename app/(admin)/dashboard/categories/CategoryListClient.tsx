//app/dashboard/categories/CategoryListClient.tsx

"use client";

import { useEffect, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { deleteCategory, getAllCategories } from "./action";

export default function CategoryListClient() {
  const [categories, setCategories] = useState<{ id: string; title: string }[]>(
    []
  );
  const [loading, startTransition] = useTransition();
  const { toast } = useToast();

  // Buscar categorias na montagem do componente
  useEffect(() => {
    const fetch = async () => {
      const cats = await getAllCategories();
      setCategories(cats);
    };
    fetch();
  }, []);

  // Função de exclusão com confirmação
  const handleDelete = (id: string) => {
    const confirmDelete = confirm("Deseja realmente excluir esta categoria?");
    if (!confirmDelete) return;

    // Transição correta com função síncrona
    startTransition(() => {
      void deleteCategory(id).then((result) => {
        if (!result.success) {
          toast({
            title: "Erro",
            description: result.error || "Erro ao excluir categoria.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Sucesso",
          description: "Categoria excluída.",
          variant: "success",
        });

        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      });
    });
  };

  // Caso não existam categorias
  if (categories.length === 0) {
    return <p className="text-gray-500">Nenhuma categoria cadastrada.</p>;
  }

  return (
    <ul className="space-y-2">
      {categories.map((cat) => (
        <li
          key={cat.id}
          className="border p-3 rounded flex items-center justify-between"
        >
          <span>{cat.title}</span>
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={() => handleDelete(cat.id)}
          >
            <Trash2Icon className="w-4 h-4 mr-1" />
            Excluir
          </Button>
        </li>
      ))}
    </ul>
  );
}
