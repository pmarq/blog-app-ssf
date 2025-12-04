// components/FeaturedProductTable.tsx

"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import truncate from "truncate";
import { Trash2, Edit2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { toast } from "@/hooks/use-toast";
import { withBasePath } from "@/lib/withBasePath";

interface FeaturedBanner {
  id: string;
  title: string;
  link: string;
  linkTitle: string;
  imageUrl: string;
  publicId: string;
}

interface Props {
  banners: FeaturedBanner[] | undefined;
}

const TABLE_HEAD = ["Detalhes", "Banner", "Ações"];

const FeaturedBannerTable: React.FC<Props> = ({ banners }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        withBasePath(`/api/featured-banners/${id}`),
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Banner deletado com sucesso!",
          variant: "default",
        });
        router.refresh();
      } else {
        throw new Error(result.message || "Erro ao deletar o banner.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erro ao deletar banner:", error.message);
        toast({
          title: "Erro!",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.error("Erro desconhecido ao deletar banner:", error);
        toast({
          title: "Erro!",
          description: "Ocorreu um erro inesperado ao deletar o banner.",
          variant: "destructive",
        });
      }
    }
  };

  const arrBanners = banners ?? [];

  if (arrBanners.length === 0) {
    return (
      <div className="py-5 text-center">
        <p className="text-gray-500">Nenhum banner cadastrado.</p>
        <Link
          href="/dashboard/featured-banners/add"
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded"
        >
          Criar Novo Banner
        </Link>
      </div>
    );
  }

  return (
    <div className="py-5">
      <Table>
        <TableHeader>
          <TableRow>
            {TABLE_HEAD.map((head, index) => (
              <TableHead key={index}>
                <span className="font-normal leading-none opacity-70">
                  {head}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {arrBanners.map((item, index) => {
            const { id, link, title } = item;
            const isLast = index === arrBanners.length - 1;
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

            return (
              <TableRow key={id} className={classes}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-bold"
                      title={title} // Tooltip com o título completo
                    >
                      {truncate(title, 100)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={link}>
                    <span className="font-bold hover:underline">
                      Ver Banner
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Link
                      className="font-semibold uppercase text-xs text-blue-400 hover:underline flex items-center gap-1"
                      href={`/dashboard/featured-banners/update?id=${id}`} // Ajuste a rota conforme necessário
                    >
                      <Edit2 size={14} />
                      Editar
                    </Link>
                    {/* Botão de Deleção com Ícone */}
                    <button
                      className="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                      onClick={() =>
                        startTransition(() => {
                          void handleDelete(item.id);
                        })
                      }
                      disabled={isPending}
                      aria-label={`Deletar ${title}`}
                    >
                      {isPending ? (
                        <Trash2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Link
        href="/dashboard/featured-banners/add"
        className="mt-2 inline-block bg-blue-500 text-white px-2 py-1 rounded"
      >
        Criar Novo Banner
      </Link>
    </div>
  );
};

export default FeaturedBannerTable;
