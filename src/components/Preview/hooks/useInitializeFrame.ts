import previewEditorScript from "../preview-editor.js?raw";
import { useEffect, useMemo, useRef } from "react";
import {
  loadSandpackClient,
  type SandpackBundlerFiles,
  type SandpackClient,
} from "@codesandbox/sandpack-client";
import type {
  TemplateInstance,
  TemplateList,
} from "../../../shared/types/template";
import type { FileList } from "../../../shared/types/file";
import { TemplateCompiler } from "../../../shared/utils/templateCompiler";

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

type Props = {
  files: FileList;
  activeHtml: string;
  templateInstances: TemplateInstance[];
  templates: TemplateList;
  editorType: "landing" | "template";
  templateKey?: string;
};

export const useInitializeFrame = ({
  files,
  activeHtml,
  templateInstances,
  templates,
  editorType,
  templateKey,
}: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientRef = useRef<SandpackClient | null>(null);

  // Мемоизируем компиляцию файлов для Sandpack
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

  useEffect(() => {
    let cancelled = false;

    if (!iframeRef.current) return;

    const initializeClient = async () => {
      try {
        const client = await loadSandpackClient(
          iframeRef.current!,
          {
            files: sandpackFiles,
            template: "static",
          },
          {
            experimental_enableServiceWorker: true,
          }
        );

        if (!cancelled) {
          clientRef.current = client;
        }
      } catch (error) {
        console.error("Failed to load Sandpack client:", error);
      }
    };

    initializeClient();

    return () => {
      cancelled = true;
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!clientRef.current) {
      return;
    }

    const entryFile = editorType === "template" ? "/index.html" : activeHtml;
    const activeFileContent = sandpackFiles[entryFile]?.code;

    const filesForSandpack = {
      ...sandpackFiles,
      "/index.html": { code: activeFileContent || "File not found" },
    };

    try {
      clientRef.current.updateSandbox({ files: filesForSandpack });
    } catch (error) {
      console.error("Failed to update sandbox:", error);
    }
  }, [sandpackFiles, activeHtml, editorType]);

  return { iframeRef };
};
