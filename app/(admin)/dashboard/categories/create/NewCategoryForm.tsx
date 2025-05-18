//app/dashboard/categories/create/new-category-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { PlusCircleIcon } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { createCategory } from "../action";

export default function NewCategoryForm() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await createCategory(title);

    setLoading(false);

    if (!response.success) {
      toast({
        title: "Erro",
        description: response.error || "Não foi possível criar a categoria.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Categoria criada com sucesso!",
      variant: "success",
    });

    router.push("/dashboard/categories");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        placeholder="Nome da categoria"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        <PlusCircleIcon className="w-4 h-4 mr-2" />
        {loading ? "Criando..." : "Criar Categoria"}
      </Button>
    </form>
  );
}
