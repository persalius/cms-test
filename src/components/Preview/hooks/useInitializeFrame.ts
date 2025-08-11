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
    return TemplateCompiler.compileForSandpack(
      files,
      templateInstances,
      templates,
      editorType,
      templateKey
    );
  }, [files, templateInstances, templates, editorType, templateKey]);

  useEffect(() => {
    let cancelled = false;

    if (!iframeRef.current) return;

    const initializeClient = async () => {
      try {
        const client = await loadSandpackClient(
          iframeRef.current!,
          {
            files: files,
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

    // Для шаблонов всегда используем /index.html
    // Для лендинга используем activeHtml
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
