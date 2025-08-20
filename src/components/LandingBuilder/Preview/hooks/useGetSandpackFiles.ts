import { useCallback, useMemo } from "react";
import type { FileList } from "@/shared/types/file";
import { TemplateCompiler } from "@/shared/utils/templateCompiler";
import type { SandpackBundlerFiles } from "@codesandbox/sandpack-client";
import previewEditorScript from "../preview-editor.js?raw";
import { getImageBlob, getIsImage } from "@/shared/utils/image";
import { IMAGE_EXTENSIONS } from "@/shared/constants/image";
import { useEditor } from "@/shared/context/editor";
import { useTemplates } from "@/shared/context/template";
import { useLanding } from "@/shared/context/landing";
import { getTemplateFilesForCurrentPage } from "@/shared/utils/template";

// function minifyHtmlSync(html: string): string {
//   // Удаляет все переносы строк и табуляцию
//   html = html.replace(/[\r\n\t]+/g, "");
//   // Заменяет несколько пробелов между текстом и тегом на один
//   html = html.replace(/ ([ ]+)(<(?=[a-zA-Z]))/g, " $2");
//   // Заменяет несколько пробелов между закрывающим тегом и текстом на один
//   html = html.replace(/(>)[ ]+ /g, "$1 ");
//   return html;
// }

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

const patchImagesInHtmlFiles = (
  files: SandpackBundlerFiles,
  activeHtml: string
): SandpackBundlerFiles => {
  // Собираем карту картинок по расширению
  const imageMap: Record<string, string> = {};
  Object.entries(files).forEach(([path, file]) => {
    if (getIsImage(path) && file.code) {
      imageMap[path.replace(/^\//, "")] = getImageBlob(path, file.code);
    }
  });

  // Заменяем пути в HTML на dataURL
  if (files[activeHtml] && files[activeHtml].code) {
    let html = files[activeHtml].code;
    const srcRegex = new RegExp(
      `src=["']([^"']+\\.(${IMAGE_EXTENSIONS.join("|")}))["']`,
      "gi"
    );
    html = html.replace(srcRegex, (match, imgPath) => {
      const dataUrl = imageMap[imgPath];
      return dataUrl ? `src="${dataUrl}"` : match;
    });
    files[activeHtml].code = html;
  }

  return files;
};

export const useGetSandpackFiles = () => {
  const { editorState } = useEditor();
  const { templates } = useTemplates();
  const { landingState } = useLanding();

  const templateInstances = landingState.templateInstances;
  const activeHtml = editorState.activeHtml;
  const editorType = editorState.type;

  const getFiles = useCallback((): FileList | null => {
    if (editorState.type === "template") {
      return templates[editorState.templateKey] || {};
    }
    if (editorState.type === "landing") {
      const templateFiles = getTemplateFilesForCurrentPage({
        landingState,
        activeHtml,
        templates,
      });
      return { ...landingState.files, ...templateFiles };
    }
    return null;
  }, [editorState, landingState, templates, activeHtml]);

  // Files for Sandpack
  const sandpackFiles = useMemo((): SandpackBundlerFiles | null => {
    const files = getFiles();
    if (
      !Object.keys(templates).length ||
      !files ||
      !Object.keys(files).length ||
      !activeHtml
    ) {
      return null;
    }

    let compiled = TemplateCompiler.compileForSandpack({
      files,
      activeHtml,
      templateInstances,
      templates,
      editorType,
    });

    if (!compiled) {
      return null;
    }

    compiled = patchImagesInHtmlFiles(compiled, activeHtml);

    // Только для landing: вставляем скрипт для редакирования в head
    if (editorType === "landing" && compiled[activeHtml]) {
      // compiled[activeHtml].code = minifyHtmlSync(compiled[activeHtml].code);
      compiled[activeHtml].code = injectEditorScript(
        compiled[activeHtml].code,
        previewEditorScript
      );
    }

    return compiled;
  }, [getFiles, templateInstances, templates, editorType, activeHtml]);

  return { sandpackFiles };
};
