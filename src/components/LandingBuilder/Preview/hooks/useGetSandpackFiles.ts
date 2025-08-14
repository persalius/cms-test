import { useMemo } from "react";
import { useEditor } from "@/shared/editor/context";
import { useLanding } from "@/shared/landing/context";
import { useTemplates } from "@/shared/template/context";
import type { FileList } from "@/shared/types/file";
import { TemplateCompiler } from "@/shared/utils/templateCompiler";
import type { SandpackBundlerFiles } from "@codesandbox/sandpack-client";
import previewEditorScript from "../preview-editor.js?raw";

const injectEditorScript = (html: string, script: string): string => {
  const headClose = html.indexOf("</head>");
  if (headClose !== -1) {
    return (
      html.slice(0, headClose) +
      `<script>${script}</script>` +
      html.slice(headClose)
    );
  }
  return `<script>${script}</script>` + html;
};

function minifyHtmlSync(html: string): string {
  // Удаляет все переносы строк и табуляцию
  html = html.replace(/[\r\n\t]+/g, "");
  // Заменяет несколько пробелов между текстом и тегом на один
  html = html.replace(/ ([ ]+)(<(?=[a-zA-Z]))/g, " $2");
  // Заменяет несколько пробелов между закрывающим тегом и текстом на один
  html = html.replace(/(>)[ ]+ /g, "$1 ");
  return html;
}

export const useGetSandpackFiles = () => {
  const { editorState } = useEditor();
  const { templates } = useTemplates();
  const { landingState } = useLanding();

  const templateInstances = landingState.templateInstances;
  const activeHtml = editorState.activeHtml;
  const editorType = editorState.type;
  const templateKey =
    editorState.type === "template" ? editorState.templateKey : undefined;

  const files = useMemo((): FileList => {
    return editorState.type === "template"
      ? templates[editorState.templateKey] || {}
      : landingState.files;
  }, [editorState, landingState.files, templates]);

  // Files for Sandpack
  const sandpackFiles = useMemo((): SandpackBundlerFiles => {
    const compiled = TemplateCompiler.compileForSandpack(
      files,
      templateInstances,
      templates,
      editorType,
      templateKey
    );

    // Только для landing: вставляем скрипт для редакирования в head
    if (editorType === "landing" && compiled[activeHtml]) {
      compiled[activeHtml].code = minifyHtmlSync(compiled[activeHtml].code);
      compiled[activeHtml].code = injectEditorScript(
        compiled[activeHtml].code,
        previewEditorScript
      );
    }

    return compiled;
  }, [
    files,
    templateInstances,
    templates,
    editorType,
    templateKey,
    activeHtml,
  ]);

  return { sandpackFiles };
};
