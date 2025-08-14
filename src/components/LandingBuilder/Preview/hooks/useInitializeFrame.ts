import { useEffect, useRef } from "react";
import {
  loadSandpackClient,
  type SandpackBundlerFiles,
  type SandpackClient,
} from "@codesandbox/sandpack-client";
import { useEditor } from "@/shared/editor/context";

type Props = {
  sandpackFiles: SandpackBundlerFiles;
};

export const useInitializeFrame = ({ sandpackFiles }: Props) => {
  const { editorState } = useEditor();
  const activeHtml = editorState.activeHtml;
  const editorType = editorState.type;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientRef = useRef<SandpackClient | null>(null);

  useEffect(() => {
    if (
      !iframeRef.current ||
      !Object.keys(sandpackFiles).length ||
      clientRef.current
    ) {
      return;
    }

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

        clientRef.current = client;
      } catch (error) {
        console.error("Failed to load Sandpack client:", error);
      }
    };

    initializeClient();
  }, [sandpackFiles]);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!clientRef.current || !Object.keys(sandpackFiles).length) {
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
