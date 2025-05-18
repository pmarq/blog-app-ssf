// components/editor/index.tsx

"use client";

import { ChangeEventHandler, useEffect, useState } from "react";
import { useEditor, EditorContent, getMarkRange, Range } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import TipTapImage from "@tiptap/extension-image";
import EditLink from "./link/EditLink";
import GalleryModal, { ImageSelectionResult } from "./GalleryModal";
import ToolBar from "./ToolBar";
import SEOForm, { SeoResult } from "./SeoForm";
import ThumbnailSelector from "./ThumbnailSelector";
import ActionButton from "../ActionButton";
import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { Thumbnail } from "@/app/models/Post";
import { ThumbnailData } from "@/app/models/ThumbnailData";
import { Category, getCategories } from "@/lib/categories";

export interface FinalPost extends SeoResult {
  title: string;
  content: string;
  thumbnail?: File | string | ThumbnailData | Thumbnail | null;
  categoryId?: string;
}

interface Props {
  initialValue?: FinalPost;
  btnTitle?: string;
  busy?: boolean;
  onSubmit(post: FinalPost): Promise<void>;
}

export default function Editor({
  initialValue,
  btnTitle = "Submit",
  busy = false,
  onSubmit,
}: Props): JSX.Element {
  const [selectionRange, setSelectionRange] = useState<Range>();
  const [showGallery, setShowGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{ src: string }>>([]);
  const [seoInitialValue, setSeoInitialValue] = useState<SeoResult>();
  const [post, setPost] = useState<FinalPost>({
    title: "",
    content: "",
    meta: "",
    tags: "",
    slug: "",
  });

  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        autolink: false,
        linkOnPaste: false,
        openOnClick: false,
      }),
      Placeholder.configure({ placeholder: "Type something" }),
      Youtube.configure({
        width: 840,
        height: 472.5,
        HTMLAttributes: { class: "mx-auto rounded" },
      }),
      TipTapImage.configure({ HTMLAttributes: { class: "mx-auto" } }),
    ],
    editorProps: {
      handleClick(view, pos, event) {
        const { state } = view;
        const range = getMarkRange(
          state.doc.resolve(pos),
          state.schema.marks.link
        );
        if (range) setSelectionRange(range);
      },
      attributes: {
        class:
          "prose prose-lg focus:outline-none dark:prose-invert max-w-full mx-auto h-full",
      },
    },
    content: "",
    onUpdate: ({ editor }) => {
      // Exemplo: se quiser capturar o conteúdo a cada digitação
    },
    immediatelyRender: false, // Essencial para evitar problemas de SSR
  });

  // Função para obter o token de autenticação
  const getAuthToken = async (): Promise<string | null> => {
    if (!currentUser) {
      return null;
    }
    try {
      const token = await currentUser.getIdToken();
      return token;
    } catch (error) {
      console.error("Erro ao obter token de autenticação:", error);
      return null;
    }
  };

  // Função para buscar imagens da galeria
  const fetchImages = async () => {
    const token = await getAuthToken();
    if (!token) {
      toast({
        title: "Erro!",
        description:
          "Você precisa estar autenticado para acessar a galeria de imagens.",
        variant: "destructive",
      });
      router.push("/login"); // Redireciona para a página de login
      return;
    }

    try {
      const res = await fetch(
        `/api/cloudinary/list-images?folder=gallery/${currentUser?.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("RES===>", res);

      if (!res.ok) {
        throw new Error("Falha na requisição para listar imagens.");
      }
      const { resources } = await res.json();
      console.log("Recursos recebidos da API no Frontend:", resources); // Adicione este log

      if (Array.isArray(resources)) {
        setImages(resources.map((r: any) => ({ src: r.src }))); // Corrigido: use 'r.src' em vez de 'r.secure_url'
      }
    } catch (error) {
      console.error("Erro ao buscar imagens:", error);
      toast({
        title: "Erro!",
        description: "Não foi possível buscar as imagens da galeria.",
        variant: "destructive",
      });
    }
  };

  // Função para abrir a galeria e buscar imagens
  const handleOpenGallery = async () => {
    await fetchImages();
    setShowGallery(true);
  };

  // (1) Chamado ao clicar em alguma imagem da galeria
  const handleImageSelection = (result: ImageSelectionResult) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .setImage({ src: result.src, alt: result.altText })
      .run();
  };

  // (2) Chamado quando o modal faz upload e retorna a URL final
  const handleFileSelect = (imageUrl: string) => {
    // Adiciona à galeria
    setImages((prev) => [{ src: imageUrl }, ...prev]);
    // Insere no editor
    editor
      ?.chain()
      .focus()
      .setImage({ src: imageUrl, alt: "Uploaded Image" })
      .run();
  };

  // Submit do post
  const handleSubmit = async () => {
    // 1) Verifica se o usuário está autenticado
    const token = await getAuthToken();
    if (!token) {
      toast({
        title: "Erro!",
        description: "Você precisa estar autenticado para criar um post.",
        variant: "destructive",
      });
      router.push("/login"); // Redireciona para a página de login
      return;
    }

    // 2) Verifica se título e conteúdo estão preenchidos
    if (!post.title.trim()) {
      toast({
        title: "Erro!",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!editor || !editor.getHTML().trim()) {
      toast({
        title: "Erro!",
        description: "O conteúdo do post é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    // 3) Monta objeto final
    const finalContent = editor.getHTML();

    // Faz upload do thumbnail usando uploads assinados
    let finalThumbnail:
      | string
      | Thumbnail
      | File
      | ThumbnailData
      | null
      | undefined = post.thumbnail;
    if (post.thumbnail instanceof File) {
      try {
        setUploading(true);

        // Define a pasta para thumbnails, utilizando um ID único (ex.: timestamp)
        const folder = `thumbnails/${Date.now()}`;

        // Faz o upload utilizando a função utilitária
        const uploadResponse = await uploadToCloudinary(post.thumbnail, folder);

        // Mapeia UploadResponse para Thumbnail
        finalThumbnail = {
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
        };

        console.log("Thumbnail enviado com sucesso:", finalThumbnail);
      } catch (error: any) {
        console.error("Erro ao enviar thumbnail:", error);
        toast({
          title: "Erro!",
          description: "Não foi possível enviar o thumbnail.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Cria o objeto final
    const updatedPost: FinalPost = {
      ...post,
      thumbnail: finalThumbnail,
      content: finalContent,
    };

    // 4) Chama a função onSubmit do pai
    try {
      await onSubmit(updatedPost);
      /*  toast({
        title: "Sucesso!",
        description: "Post criado com sucesso.",
        variant: "default",
      });
      // 5) Redireciona para a página de posts (opcional)
      router.push("/dashboard/posts"); */
    } catch (error: any) {
      console.error("Erro ao criar post:", error);
      toast({
        title: "Erro!",
        description: "Não foi possível criar o post.",
        variant: "destructive",
      });
    }
  };

  // Atualiza o título
  const updateTitle: ChangeEventHandler<HTMLInputElement> = ({ target }) =>
    setPost({ ...post, title: target.value });

  // Atualiza SEO
  const updateSeoValue = (result: SeoResult) => {
    const tagsArray =
      typeof result.tags === "string"
        ? result.tags.split(",").map((tag) => tag.trim())
        : result.tags;

    setPost({ ...post, ...result, tagsArray });
  };

  // Atualiza thumbnail localmente (sem upload imediato)
  const updateThumbnail = (file: File) => {
    setPost({ ...post, thumbnail: file });
  };

  // Se houve clique em link (para editar)
  useEffect(() => {
    if (editor && selectionRange) {
      editor.commands.setTextSelection(selectionRange);
    }
  }, [editor, selectionRange]);

  // Se vier initialValue (edição)
  useEffect(() => {
    if (!initialValue) return;
    setPost({ ...initialValue });
    if (initialValue.content) {
      editor?.commands.setContent(initialValue.content);
    }
    const { meta, slug, tags } = initialValue;
    setSeoInitialValue({ meta, slug, tags });
  }, [initialValue, editor]);

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const cats = await getCategories();
      cats.sort((a, b) => a.title.localeCompare(b.title)); // <-- ordena por título
      setCategories(cats);
    };
    fetch();
  }, []);

  return (
    <>
      <div className="p-3 dark:bg-primary-dark bg-primary transition">
        <div className="sticky top-0 z-10 dark:bg-primary-dark bg-primary">
          {/* Cabeçalho: Thumbnail + Botão Submit */}
          <div className="flex items-center justify-between mb-3">
            <ThumbnailSelector
              initialValue={(() => {
                if (!post.thumbnail) return undefined;
                if (typeof post.thumbnail === "string") return post.thumbnail;
                if (
                  "url" in post.thumbnail &&
                  typeof post.thumbnail.url === "string"
                ) {
                  return post.thumbnail.url;
                }
                return undefined;
              })()}
              onChange={updateThumbnail}
            />
            <div className="inline-block">
              <ActionButton
                busy={busy || uploading}
                title={btnTitle}
                onClick={handleSubmit}
              />
            </div>
          </div>
          {/*Categorias*/}
          <select
            value={post.categoryId || ""}
            onChange={(e) => setPost({ ...post, categoryId: e.target.value })}
            className="mt-6 mb-6 p-2 border rounded text-sm"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>

          {/* Título */}
          <input
            type="text"
            className="py-2 outline-none bg-transparent w-full border-0 border-b-[1px] border-secondary-dark dark:border-secondary-light text-3xl font-semibold italic text-primary-dark dark:text-primary mb-3"
            placeholder="Title"
            onChange={updateTitle}
            value={post.title}
          />

          {/* Barra de Ferramentas (ToolBar) */}
          <ToolBar editor={editor} onOpenImageClick={handleOpenGallery} />

          <div className="h-[1px] w-full bg-secondary-dark dark:bg-secondary-light my-3" />
        </div>

        {/* Se existe editor, renderiza Link Editor */}
        {editor ? <EditLink editor={editor} /> : null}

        {/* Conteúdo do Editor */}
        <EditorContent editor={editor} className="min-h-[300px]" />

        <div className="h-[1px] w-full bg-secondary-dark dark:bg-secondary-light my-3" />

        {/* Formulário de SEO */}
        <SEOForm
          onChange={updateSeoValue}
          title={post.title}
          initialValue={seoInitialValue}
        />
      </div>

      {/* Modal de Galeria de Imagens */}
      <GalleryModal
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleImageSelection}
        onFileSelect={handleFileSelect}
        images={images}
        uploading={uploading}
      />
    </>
  );
}
