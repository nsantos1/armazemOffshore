"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { uploadImage } from "@/lib/uploads-client";

export interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  i: string;
  a: () => void;
  t: string;
  sep?: false;
}
type ToolbarEntry = ToolbarButton | { sep: true };

// Editor WYSIWYG simples baseado em `contentEditable` + `document.execCommand`.
// TODO: document.execCommand está deprecated nos navegadores; ao evoluir o editor,
// migrar para uma lib mantida (TipTap, Lexical, Slate) que produza o mesmo HTML.
export function RichEditor({ value, onChange, placeholder = "Comece a escrever..." }: RichEditorProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, []); // initial only

  const exec = (cmd: string, arg: string | null = null) => {
    document.execCommand(cmd, false, arg ?? undefined);
    if (ref.current) onChange(ref.current.innerHTML);
  };
  const onInput = () => { if (ref.current) onChange(ref.current.innerHTML); };

  const addLink = () => {
    const url = prompt("URL do link:");
    if (url) exec("createLink", url);
  };
  const addImage = async () => {
    const file = await new Promise<File | undefined>(res => {
      const inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*";
      inp.onchange = () => res(inp.files?.[0]);
      inp.click();
    });
    if (!file) return;
    try {
      const url = await uploadImage(file);
      exec("insertImage", url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao enviar a imagem.");
    }
  };
  const insertBlock = (tag: string) => {
    exec("formatBlock", tag);
  };

  const btns: ToolbarEntry[] = [
    { i: "Bold", a: () => exec("bold"), t: "Negrito" },
    { i: "Italic", a: () => exec("italic"), t: "Itálico" },
    { i: "Underline", a: () => exec("underline"), t: "Sublinhado" },
    { sep: true },
    { i: "Heading1", a: () => insertBlock("h2"), t: "Título" },
    { i: "Heading2", a: () => insertBlock("h3"), t: "Subtítulo" },
    { i: "Type", a: () => insertBlock("p"), t: "Parágrafo" },
    { sep: true },
    { i: "List", a: () => exec("insertUnorderedList"), t: "Lista" },
    { i: "ListOrdered", a: () => exec("insertOrderedList"), t: "Lista numerada" },
    { i: "Quote", a: () => insertBlock("blockquote"), t: "Citação" },
    { sep: true },
    { i: "Link", a: addLink, t: "Link" },
    { i: "Image", a: addImage, t: "Imagem" },
    { i: "Code", a: () => insertBlock("pre"), t: "Bloco de código" },
    { sep: true },
    { i: "Undo", a: () => exec("undo"), t: "Desfazer" },
    { i: "Redo", a: () => exec("redo"), t: "Refazer" },
  ];

  return (
    <div className="rt-editor rounded-md border border-slate-300 bg-white overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-200 bg-bg-soft">
        {btns.map((b, i) => "sep" in b
          ? <div key={i} className="w-px h-5 bg-slate-300 mx-1" />
          : <button key={i} type="button" title={b.t} onClick={b.a}
              className="grid place-items-center w-8 h-8 rounded text-primary hover:bg-white"><Icon name={b.i} className="w-4 h-4" /></button>
        )}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        data-placeholder={placeholder}
        className="px-4 py-4 text-[15px] text-primary focus:outline-none"
        style={{ minHeight: 360 }}
      />
    </div>
  );
}
