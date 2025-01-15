"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ActionButton from "../ActionButton";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "../../ui/form";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

export interface FeaturedBanner {
  id: string;
  title: string;
  link: string;
  linkTitle: string;
  imageUrl: string;
  publicId: string;
}

const FeaturedBannerSchema = z.object({
  title: z.string().nonempty("Título é obrigatório"),
  link: z
    .string()
    .nonempty("Link é obrigatório")
    .url("Link deve ser uma URL válida"),
  linkTitle: z.string().nonempty("Título do link é obrigatório"),
  file: z
    .instanceof(File)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      {
        message:
          "Formato de arquivo inválido. Apenas JPEG, PNG e GIF são permitidos.",
      }
    )
    .optional(),
});

type FeaturedBannerFormInputs = z.infer<typeof FeaturedBannerSchema>;

interface Props {
  initialValue?: FeaturedBanner;
  btnTitle?: string;
  busy?: boolean;
  onSubmit?: () => Promise<void>;
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
  const [uploading, setUploading] = useState(false);

  const formMethods = useForm<FeaturedBannerFormInputs>({
    resolver: zodResolver(FeaturedBannerSchema),
    defaultValues: initialValue
      ? {
          title: initialValue.title,
          link: initialValue.link,
          linkTitle: initialValue.linkTitle,
          file: undefined,
        }
      : {
          title: "",
          link: "",
          linkTitle: "",
          file: undefined,
        },
  });

  const {
    handleSubmit,
    watch,
    reset,
    resetField,
    formState: { isSubmitting, errors },
    setValue,
  } = formMethods;

  const watchFile = watch("file");

  useEffect(() => {
    if (watchFile && watchFile instanceof File) {
      const objectUrl = URL.createObjectURL(watchFile);
      setPreview(objectUrl);

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

  const onFormSubmit: SubmitHandler<FeaturedBannerFormInputs> = async (
    data
  ) => {
    try {
      setUploading(true);
      let imageUrl = initialValue?.imageUrl || "";
      let publicId = initialValue?.publicId || "";

      if (data.file) {
        const folder = "featured-banners"; // Ajuste conforme a necessidade do projeto
        const uploadResult = await uploadToCloudinary(data.file, folder);
        imageUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      }

      const payload = {
        title: data.title,
        link: data.link,
        linkTitle: data.linkTitle,
        imageUrl,
        publicId,
      };

      let response;
      if (isForUpdate && initialValue) {
        response = await fetch(`/api/featured-banners/${initialValue.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/featured-banners`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao processar o banner.");
      }

      toast({
        title: "Sucesso!",
        description: isForUpdate
          ? "Banner atualizado com sucesso!"
          : "Banner criado com sucesso!",
        variant: "default",
      });

      reset({
        title: "",
        link: "",
        linkTitle: "",
      });
      resetField("file");

      setPreview("");
      router.refresh();
      router.push("/dashboard/featured-banners");

      if (onSubmit) {
        await onSubmit();
      }
    } catch (error: any) {
      console.error("Erro ao processar o banner:", error);
      toast({
        title: "Erro!",
        description: error?.message || "Ocorreu um erro ao processar o banner.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-md">
      <h2 className="text-3xl font-semibold mb-8 text-center">
        {isForUpdate ? "Atualizar Banner" : "Criar Novo Banner"}
      </h2>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          <FormField
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="banner-file"
                  className="block mb-2 text-lg font-medium text-gray-700"
                >
                  Banner
                </FormLabel>
                <FormControl>
                  <input
                    type="file"
                    accept="image/*"
                    id="banner-file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("file", file, { shouldValidate: true });
                      }
                    }}
                  />
                </FormControl>
                <label htmlFor="banner-file" className="block cursor-pointer">
                  <div className="h-80 w-full flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-md relative transition-transform duration-200 hover:scale-105">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="Banner Preview"
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-gray-500 text-lg">
                          Selecione um Banner
                        </span>
                        <span className="text-gray-500">1140 x 380</span>
                      </div>
                    )}
                  </div>
                </label>
                <FormDescription className="mt-2 text-sm text-gray-500">
                  {isForUpdate
                    ? "Selecione uma nova imagem para substituir a atual."
                    : "Selecione uma imagem para o banner."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="title"
                  className="block mb-2 text-lg font-medium text-gray-700"
                >
                  Título
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    {...field}
                    id="title"
                    placeholder="Título do Banner"
                    className={`mt-1 block w-full border ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm p-4 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </FormControl>
                <FormDescription className="mt-1 text-sm text-gray-500">
                  {isForUpdate
                    ? "Atualize o título do banner."
                    : "Insira um título para o banner."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-6">
            <FormField
              name="link"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel
                    htmlFor="link"
                    className="block mb-2 text-lg font-medium text-gray-700"
                  >
                    Link
                  </FormLabel>
                  <FormControl>
                    <input
                      type="url"
                      {...field}
                      id="link"
                      placeholder="https://exemplo.com"
                      className={`mt-1 block w-full border ${
                        errors.link ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm p-4 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </FormControl>
                  <FormDescription className="mt-1 text-sm text-gray-500">
                    {isForUpdate
                      ? "Atualize o link do banner."
                      : "Insira o link associado ao banner."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="linkTitle"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel
                    htmlFor="linkTitle"
                    className="block mb-2 text-lg font-medium text-gray-700"
                  >
                    Título do Link
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      {...field}
                      id="linkTitle"
                      placeholder="Título do Link"
                      className={`mt-1 block w-full border ${
                        errors.linkTitle ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm p-4 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </FormControl>
                  <FormDescription className="mt-1 text-sm text-gray-500">
                    {isForUpdate
                      ? "Atualize o título do link."
                      : "Insira um título para o link."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-24">
            <ActionButton
              busy={isSubmitting || busy || uploading}
              title={isForUpdate ? "Atualizar" : "Enviar"}
              disabled={isSubmitting || busy || uploading}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FeaturedBannerForm;
