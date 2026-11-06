"use client";

import { useEffect, useId, useRef } from "react";
import { fieldLabel } from "@/components/classes";
import { sanitizeRichText } from "@/lib/rich-text";

const tools = [
  { command: "bold", label: "Gras", title: "Mettre en gras", mark: "B" },
  { command: "italic", label: "Italique", title: "Mettre en italique", mark: "I" },
  { command: "formatBlock:h2", label: "Titre", title: "Titre de section", mark: "H2" },
  { command: "formatBlock:h3", label: "Sous-titre", title: "Sous-titre", mark: "H3" },
  { command: "insertUnorderedList", label: "Liste", title: "Liste à puces", mark: "•" },
  { command: "insertOrderedList", label: "Numéros", title: "Liste numérotée", mark: "1." },
  { command: "formatBlock:blockquote", label: "Citation", title: "Citation", mark: "”" },
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
  const started = useRef(false);
  const initial = sanitizeRichText(defaultValue);

  useEffect(() => {
    if (started.current || !editorRef.current) {
      return;
    }

    started.current = true;
    editorRef.current.innerHTML = initial;
    if (fieldRef.current) {
      fieldRef.current.value = initial;
    }
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
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  function sync() {
    const next = sanitizeRichText(editorRef.current?.innerHTML ?? "");
    if (fieldRef.current) {
      fieldRef.current.value = next;
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
    const href = window.prompt("Adresse du lien (https:// ou /fr/…)")?.trim() ?? "";
    if (!/^https:\/\/\S+$/i.test(href) && !/^\/(fr|en)(\/[a-z0-9-]+)*$/.test(href)) {
      return;
    }

    editorRef.current?.focus();
    document.execCommand("createLink", false, href);
    sync();
  }

  return (
    <div>
      <label className={fieldLabel} htmlFor={editorId}>
        {label}
      </label>
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
          title="Insérer un lien"
          aria-label="Insérer un lien"
          className="inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-[0.8125rem] font-semibold text-ink hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={addLink}
        >
          <span aria-hidden="true">↗</span>
          <span className="sr-only">Lien</span>
        </button>
      </div>
      <div
        id={editorId}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Écrivez le texte ici."
        className="article-editor article-body mt-0 min-h-64 border border-t-0 border-line bg-canvas px-4 py-4 text-base leading-[1.7] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        onInput={sync}
      />
      <textarea ref={fieldRef} name={name} defaultValue={initial} hidden />
    </div>
  );
}
