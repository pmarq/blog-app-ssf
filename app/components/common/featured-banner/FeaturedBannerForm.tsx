// components/FeaturedBannerForm.tsx

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadToCloudinary, UploadResponse } from "@/lib/cloudinaryUpload"; // Funções de upload existentes
import { toast } from "@/hooks/use-toast"; // Hook de toast personalizado
import { useRouter } from "next/navigation";
import ActionButton from "../ActionButton"; // Componente de botão reutilizável
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "../../ui/form";

import { createFeaturedBanner, updateFeaturedBanner } from "@/app/(admin)/dashboard/featured-banners/action";

// Interface para o Banner
export interface FeaturedBanner {
  id: string;
  title: string;
  link: string;
  linkTitle: string;
  imageUrl: string;
  publicId: string;
  file?: File;
}

// Esquema de validação com Zod
const FeaturedBannerSchema = z.object({
  title: z.string().nonempty("Título é obrigatório"),
  link: z.string().nonempty("Link é obrigatório").url("Link deve ser uma URL válida"),
  linkTitle: z.string().nonempty("Título do link é obrigatório"),
  file: z
    .any()
    .optional()
    .refine(
      (file) => {
        if (!file) return true; // Arquivo opcional para atualização
        return ["image/jpeg", "image/png", "image/gif"].includes(file.type);
      },
      { message: "Formato de arquivo inválido. Apenas JPEG, PNG e GIF são permitidos." }
    ),
});

type FeaturedBannerFormInputs = z.infer<typeof FeaturedBannerSchema>;

interface Props {
  initialValue?: FeaturedBanner;
  btnTitle?: string;
  busy?: boolean;
  onSubmit?: (banner: FeaturedBanner) => Promise<void>; // Função opcional de submissão
}

const FeaturedBannerForm: React.FC<Props> = ({
  initialValue,
  btnTitle = "Enviar",
  busy = false,
  onSubmit,
}) => {
  const router = useRouter();
  const [isForUpdate, setIsForUpdate] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeaturedBannerFormInputs>({
    resolver: zodResolver(FeaturedBannerSchema),
    defaultValues: initialValue
      ? {
          title: initialValue.title,
          link: initialValue.link,
          linkTitle: initialValue.linkTitle,
          file: undefined, // Campo de arquivo não deve ter valor padrão
        }
      : {
          title: "",
          link: "",
          linkTitle: "",
          file: undefined,
        },
  });

  // Monitorar o campo "file" para pré-visualização
  const watchFile = watch("file");

  useEffect(() => {
    if (watchFile && watchFile instanceof File) {
      const objectUrl = URL.createObjectURL(watchFile);
      setPreview(objectUrl);

      // Libera memória quando o componente é desmontado ou o arquivo muda
      return () => URL.revokeObjectURL(objectUrl);
    } else if (initialValue?.imageUrl) {
      setPreview(initialValue.imageUrl);
    } else {
      setPreview("");
    }
  }, [watchFile, initialValue]);

  useEffect(() => {
    if (initialValue) {
      setIsForUpdate(true);
      if (initialValue.imageUrl) {
        setPreview(initialValue.imageUrl);
      }
    }
  }, [initialValue]);

  const onFormSubmit: SubmitHandler<FeaturedBannerFormInputs> = async (data) => {
    try {
      let bannerUrl = initialValue?.imageUrl || "";
      let publicId = initialValue?.publicId || "";

      if (data.file) {
        // Fazer upload da nova imagem
        const uploadResponse: UploadResponse = await uploadToCloudinary(data.file, "banners");
        bannerUrl = uploadResponse.secure_url;
        publicId = uploadResponse.public_id;
      }

      if (isForUpdate) {
        // Atualizar o banner existente
        await updateFeaturedBanner(initialValue!.id, {
          title: data.title,
          link: data.link,
          linkTitle: data.linkTitle,
          imageUrl: bannerUrl,
          publicId: publicId,
        });
        toast({
          title: "Sucesso!",
          description: "Banner atualizado com sucesso!",
          variant: "default",
        });
      } else {
        // Criar um novo banner
        const newBanner: Omit<FeaturedBanner, "id"> = {
          title: data.title,
          link: data.link,
          linkTitle: data.linkTitle,
          imageUrl: bannerUrl,
          publicId: publicId,
        };
        await createFeaturedBanner(newBanner);
        toast({
          title: "Sucesso!",
          description: "Banner criado com sucesso!",
          variant: "default",
        });
      }

      reset({
        title: "",
        link: "",
        linkTitle: "",
        file: undefined,
      });
      setPreview("");
      router.refresh();
      router.push("/dashboard/banners"); // Ajuste a rota conforme necessário
    } catch (error: any) {
      console.error("Erro ao processar o banner:", error);
      toast({
        title: "Erro!",
        description: error?.message || "Ocorreu um erro ao processar o banner.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Upload de Imagem */}
        <FormItem>
          <FormLabel htmlFor="banner-file">Banner</FormLabel>
          <FormControl>
            <input
              type="file"
              accept="image/*"
              {...register("file")}
              className="hidden"
              id="banner-file"
            />
            <label htmlFor="banner-file" className="block cursor-pointer">
              <div className="h-[380px] w-full flex flex-col items-center justify-center border border-dashed border-blue-gray-400 rounded relative">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Banner Preview"
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <>
                    <span className="text-gray-500">Selecione um Banner</span>
                    <span className="text-gray-500">1140 x 380</span>
                  </>
                )}
              </div>
            </label>
          </FormControl>
          <FormDescription>
            {isForUpdate
              ? "Selecione uma nova imagem para substituir a atual."
              : "Selecione uma imagem para o banner."}
          </FormDescription>
          {/* <FormMessage>{errors.file?.message}</FormMessage> */}
        </FormItem>

        {/* Título */}
        <FormItem>
          <FormLabel htmlFor="title">Título</FormLabel>
          <FormControl>
            <input
              type="text"
              {...register("title")}
              id="title"
              placeholder="Título do Banner"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </FormControl>
          <FormDescription>
            {isForUpdate
              ? "Atualize o título do banner."
              : "Insira um título para o banner."}
          </FormDescription>
          <FormMessage>{errors.title?.message}</FormMessage>
        </FormItem>

        {/* Link */}
        <FormItem>
          <FormLabel htmlFor="link">Link</FormLabel>
          <FormControl>
            <input
              type="url"
              {...register("link")}
              id="link"
              placeholder="https://exemplo.com"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </FormControl>
          <FormDescription>
            {isForUpdate
              ? "Atualize o link do banner."
              : "Insira o link associado ao banner."}
          </FormDescription>
          <FormMessage>{errors.link?.message}</FormMessage>
        </FormItem>

        {/* Título do Link */}
        <FormItem>
          <FormLabel htmlFor="linkTitle">Título do Link</FormLabel>
          <FormControl>
            <input
              type="text"
              {...register("linkTitle")}
              id="linkTitle"
              placeholder="Título do Link"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </FormControl>
          <FormDescription>
            {isForUpdate
              ? "Atualize o título do link."
              : "Insira um título para o link."}
          </FormDescription>
          <FormMessage>{errors.linkTitle?.message}</FormMessage>
        </FormItem>

        {/* Botão de Submissão */}
        <div className="text-right">
          <ActionButton
            busy={isSubmitting || busy}
            title={isForUpdate ? "Atualizar" : "Enviar"}
          />
        </div>
      </form>
    </Form>
  );
};

export default FeaturedBannerForm;
