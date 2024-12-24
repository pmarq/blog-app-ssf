"use client";

import { Editor } from "@tiptap/react";
import { AiFillCaretDown } from "react-icons/ai";
import { RiDoubleQuotesL } from "react-icons/ri";
import {
  BsTypeStrikethrough,
  BsBraces,
  BsCode,
  BsTypeBold,
  BsListOl,
  BsListUl,
  BsTypeUnderline,
  BsTypeItalic,
  BsImageFill,
  BsYoutube,
} from "react-icons/bs";
import InserLink from "./link/InsertLink";
import { linkOpition } from "./link/LinkForm";
import DropdownOptions from "../DropDownOptions";
import Button from "./Button";
import EmbedYoutube from "./EmbedYoutube";

interface Props {
  editor: Editor | null;
  onOpenImageClick?(): void;
}

export default function ToolBar({
  editor,
  onOpenImageClick,
}: Props): JSX.Element | null {
  if (!editor) return null;

  const options = [
    {
      label: "Paragraph",
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "Heading 1",
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ];

  const getLabel = (): string => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    return "Paragraph";
  };

  const handleLinkSubmit = ({ url, openInNewTab }: linkOpition) => {
    const { commands } = editor;
    if (openInNewTab) commands.setLink({ href: url, target: "_blank" });
    else commands.setLink({ href: url });
  };

  const handleEmbedYoutube = (url: string) => {
    editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const Head = () => {
    return (
      <div className="flex items-center  space-x-2 text-primary-dark dark:text-primary">
        <p>{getLabel()}</p>
        <AiFillCaretDown />
      </div>
    );
  };

  return (
    <div className="flex items-center">
      {/* paragraph heading 1, 2, 3 */}
      <DropdownOptions options={options} head={<Head />} />

      <div className="h-4 w-[1px] bg-secondary-dark dark:bg-secondary-light mx-8" />

      <div className="flex items-center space-x-3">
        <Button
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BsTypeBold />
        </Button>

        <Button
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <BsTypeItalic />
        </Button>

        <Button
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <BsTypeUnderline />
        </Button>

        <Button
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <BsTypeStrikethrough />
        </Button>
      </div>

      <div className="h-4 w-[1px] bg-secondary-dark dark:bg-secondary-light mx-8" />

      <div className="flex items-center space-x-3">
        <Button
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <RiDoubleQuotesL />
        </Button>

        <Button
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <BsCode />
        </Button>

        <Button
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <BsBraces />
        </Button>

        <InserLink onSubmit={handleLinkSubmit} />

        <Button
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <BsListOl />
        </Button>

        <Button
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <BsListUl />
        </Button>
      </div>

      <div className="h-4 w-[1px] bg-secondary-dark dark:bg-secondary-light mx-8" />

      <div className="flex items-center space-x-3">
        <EmbedYoutube onSubmit={handleEmbedYoutube} />

        <Button onClick={onOpenImageClick}>
          <BsImageFill />
        </Button>
      </div>
    </div>
  );
}
