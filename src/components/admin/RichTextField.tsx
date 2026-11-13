"use client";

import { useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { fieldLabel, supportText } from "@/components/classes";
import { INLINE_IMAGE_MAX_BYTES, RICH_TEXT_MAX_CHARS, sanitizeRichText } from "@/lib/rich-text";

const tools = [
  { command: "bold", label: "Gras", title: "Mettre en gras", mark: "B" },
  { command: "italic", label: "Italique", title: "Mettre en italique", mark: "I" },
  { command: "underline", label: "Souligné", title: "Souligner", mark: "U" },
  { command: "formatBlock:h1", label: "Titre 1", title: "Titre 1", mark: "H1" },
  { command: "formatBlock:h2", label: "Titre 2", title: "Titre 2", mark: "H2" },
  { command: "formatBlock:h3", label: "Titre 3", title: "Titre 3", mark: "H3" },
  { command: "formatBlock:p", label: "Paragraphe", title: "Paragraphe", mark: "P" },
  { command: "insertUnorderedList", label: "Liste", title: "Liste à puces", mark: "•" },
  { command: "insertOrderedList", label: "Numéros", title: "Liste numérotée", mark: "1." },
  { command: "formatBlock:blockquote", label: "Citation", title: "Citation", mark: "”" },
  { command: "insertHorizontalRule", label: "Ligne", title: "Ligne horizontale", mark: "—" },
  { command: "justifyLeft", label: "Gauche", title: "Aligner à gauche", mark: "⬅" },
  { command: "justifyFull", label: "Justifier", title: "Justifier le paragraphe", mark: "☰" },
  { command: "undo", label: "Annuler", title: "Annuler", mark: "↺" },
  { command: "redo", label: "Rétablir", title: "Rétablir", mark: "↻" },
] as const;

export function RichTextField({
  name,
  label,
  defaultValue = "",
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  const editorId = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const started = useRef(false);
  const initial = sanitizeRichText(defaultValue);
  const [notice, setNotice] = useState<string | null>(null);
  const [size, setSize] = useState(initial.length);

  useEffect(() => {
    if (started.current || !editorRef.current) {
      return;
    }

    started.current = true;
    editorRef.current.innerHTML = initial;
    if (fieldRef.current) {
      fieldRef.current.value = initial;
    }
    setSize(initial.length);
  }, [initial]);

  useEffect(() => {
    const editor = editorRef.current;
    const form = editor?.closest("form");
    if (!editor || !form) {
      return;
    }

    const onReset = () => {
      editor.innerHTML = "";
      if (fieldRef.current) {
        fieldRef.current.value = "";
      }
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      setSize(0);
      setNotice(null);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  function sync() {
    const next = sanitizeRichText(editorRef.current?.innerHTML ?? "");
    if (fieldRef.current) {
      fieldRef.current.value = next;
    }
    setSize(next.length);
    if (next.length > RICH_TEXT_MAX_CHARS) {
      setNotice(
        `Limite dépassée : ${next.length.toLocaleString("fr-FR")} / ${RICH_TEXT_MAX_CHARS.toLocaleString("fr-FR")} caractères HTML (images comprises). Réduisez le contenu avant d'enregistrer.`,
      );
    } else if (notice?.startsWith("Limite dépassée")) {
      setNotice(null);
    }
  }

  function apply(command: string) {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    if (command.startsWith("formatBlock:")) {
      const tag = command.slice("formatBlock:".length);
      document.execCommand("formatBlock", false, tag);
      if (document.queryCommandValue("formatBlock").toLowerCase() !== tag) {
        document.execCommand("formatBlock", false, `<${tag}>`);
      }
    } else {
      document.execCommand(command, false);
    }
    sync();
  }

  function addLink() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    const selected = selection?.toString() ?? "";
    const href = window.prompt("Adresse du lien (https:// ou /fr/…)", "https://")?.trim() ?? "";
    if (!href) {
      return;
    }
    if (!/^https:\/\/\S+$/i.test(href) && !/^\/(fr|en)(\/[a-z0-9-]+)*$/.test(href)) {
      setNotice("Lien refusé : utilisez une adresse https:// ou un chemin /fr/… ou /en/…");
      return;
    }

    if (selected.length === 0) {
      const label = window.prompt("Texte du lien", href)?.trim() || href;
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${href.replace(/"/g, "")}">${label.replace(/[<>]/g, "")}</a>`,
      );
    } else {
      document.execCommand("createLink", false, href);
      const node = selection?.anchorNode?.parentElement?.closest("a");
      if (node) {
        node.setAttribute("href", href);
        node.removeAttribute("target");
        node.removeAttribute("rel");
      }
    }
    setNotice(null);
    sync();
  }

  function removeLink() {
    editorRef.current?.focus();
    document.execCommand("unlink", false);
    sync();
  }

  function insertImage(file: File | undefined) {
    if (!file) {
      return;
    }
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
      setNotice("Format d'image non accepté. Utilisez JPEG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > INLINE_IMAGE_MAX_BYTES) {
      setNotice("Cette image dépasse 3,5 Mo. Choisissez un fichier plus léger.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src.startsWith("data:image/")) {
        setNotice("Impossible de lire cette image.");
        return;
      }

      const projected = size + src.length + 64;
      if (projected > RICH_TEXT_MAX_CHARS) {
        setNotice(
          `Ajouter cette image dépasserait la limite du volume (images comprises). Réduisez la taille du fichier ou retirez une image déjà présente. Votre texte actuel est conservé.`,
        );
        return;
      }

      editorRef.current?.focus();
      const safeAlt = file.name.replace(/\.[^.]+$/, "").replace(/[<>"']/g, "").slice(0, 120);
      document.execCommand("insertHTML", false, `<p><img src="${src}" alt="${safeAlt}"></p><p><br></p>`);
      setNotice(null);
      sync();
    };
    reader.onerror = () => setNotice("Impossible de lire cette image.");
    reader.readAsDataURL(file);
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const clipboard = event.clipboardData;
    if (!clipboard) {
      return;
    }

    const imageItem = Array.from(clipboard.items).find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      event.preventDefault();
      insertImage(imageItem.getAsFile() ?? undefined);
      return;
    }

    window.setTimeout(() => {
      sync();
      const html = editorRef.current?.innerHTML ?? "";
      if (/<img\b/i.test(html) && !/data:image\//i.test(html)) {
        setNotice(
          "Les images externes collées ne sont pas conservées. Collez une image fichier (Ctrl+V) ou utilisez l'outil Image.",
        );
        sync();
      }
    }, 0);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      addLink();
    }
  }

  const overLimit = size > RICH_TEXT_MAX_CHARS;

  return (
    <div>
      <label className={fieldLabel} htmlFor={editorId}>
        {label}
      </label>
      <p className={`mt-2 ${supportText}`}>
        Titres, listes, liens (Ctrl+K), citations et images. Collez une image directement dans le texte, ou utilisez l&apos;outil
        Image. Chaque image : 3,5&nbsp;Mo au plus, à l&apos;original. Jusqu&apos;à deux images de cette taille peuvent coexister dans
        le même texte.
      </p>
      <div className="mt-2 flex flex-wrap gap-1 border border-line bg-surface p-2" role="toolbar" aria-label="Mise en forme">
        {tools.map((tool) => (
          <button
            key={tool.command}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            className="inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-[0.8125rem] font-semibold text-ink hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => apply(tool.command)}
          >
            <span aria-hidden="true">{tool.mark}</span>
            <span className="sr-only">{tool.label}</span>
          </button>
        ))}
        <button
          type="button"
          title="Insérer un lien (Ctrl+K)"
          aria-label="Insérer un lien (Ctrl+K)"
          className="inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-[0.8125rem] font-semibold text-ink hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={addLink}
        >
          <span aria-hidden="true">↗</span>
          <span className="sr-only">Lien</span>
        </button>
        <button
          type="button"
          title="Retirer le lien"
          aria-label="Retirer le lien"
          className="inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-[0.8125rem] font-semibold text-ink hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={removeLink}
        >
          <span aria-hidden="true">⨯↗</span>
          <span className="sr-only">Retirer le lien</span>
        </button>
        <button
          type="button"
          title="Insérer une image dans le texte"
          aria-label="Insérer une image dans le texte"
          className="inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-[0.8125rem] font-semibold text-ink hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => fileRef.current?.click()}
        >
          <span aria-hidden="true">▣</span>
          <span className="sr-only">Image</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            insertImage(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      <div
        id={editorId}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Écrivez ici. Ctrl+K pour un lien. Collez une image avec Ctrl+V."
        className="article-editor article-body mt-0 min-h-80 border border-t-0 border-line bg-canvas px-4 py-4 text-base leading-[1.7] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:px-6 md:py-6"
        onInput={sync}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
      />
      <p className={`mt-2 ${overLimit ? "text-[0.9375rem] font-semibold text-danger" : supportText}`}>
        Volume du texte : {size.toLocaleString("fr-FR")} / {RICH_TEXT_MAX_CHARS.toLocaleString("fr-FR")}
        {overLimit ? " — limite dépassée" : ""}
      </p>
      {notice ? <p className="mt-2 text-[0.9375rem] font-semibold text-warning">{notice}</p> : null}
      <textarea ref={fieldRef} name={name} defaultValue={initial} hidden readOnly aria-hidden="true" />
    </div>
  );
}
