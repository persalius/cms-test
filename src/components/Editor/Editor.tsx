import MonacoEditor from "@monaco-editor/react";

import { getLanguageFromPath } from "./utils";
import { useChangeCode } from "./hooks/useChangeCode";

import type { FileList } from "../../shared/types/file";

export interface Props {
  files: FileList;
  updateFiles: (file: string, value: string) => void;
  activeFile: string;
}

export const Editor = ({ files, updateFiles, activeFile }: Props) => {
  const { onChangeCode } = useChangeCode({ activeFile, updateFiles });

  const code = files[activeFile]?.code || "";

  // Эффект для прослушивания сообщений от iframe
  // useEffect(() => {
  //   const handleIframeMessage = (event) => {
  //     // Проверяем, что сообщение пришло от нашего iframe и имеет нужный тип
  //     if (
  //       previewRef.current &&
  //       event.source === previewRef.current.contentWindow &&
  //       event.data.type === "contentChange"
  //     ) {
  //       const updatedHtml = event.data.newContent;
  //       const tempDiv = document.createElement("div");
  //       tempDiv.innerHTML = updatedHtml;
  //       tempDiv
  //         .querySelectorAll("[data-injected]")
  //         .forEach((el) => el.remove());
  //       const cleanedHtml = tempDiv.innerHTML.trim();

  //       setFiles((prevFiles) => {
  //         const newFiles = { ...prevFiles };
  //         if (newFiles[activeHtml]) {
  //           const oldHtml = newFiles[activeHtml].code;
  //           const newHtmlContent = oldHtml.replace(
  //             /<body>[\s\S]*<\/body>/i,
  //             `<body>\n    ${cleanedHtml}\n  </body>`
  //           );
  //           newFiles[activeHtml] = {
  //             ...newFiles[activeHtml],
  //             code: newHtmlContent,
  //           };
  //         }
  //         return newFiles;
  //       });
  //     }
  //   };
  //   window.addEventListener("message", handleIframeMessage);
  //   return () => window.removeEventListener("message", handleIframeMessage);
  // }, [activeFile]);

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        backgroundColor: "#f1f5f9",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #e2e8f0",
          padding: "0.5rem 1rem",
          backgroundColor: "#f1f5f9",
          fontWeight: "500",
          color: "#334155",
        }}
      >
        {activeFile}
      </div>
      <MonacoEditor
        key={activeFile}
        height="100%"
        defaultLanguage={getLanguageFromPath(activeFile)}
        language={getLanguageFromPath(activeFile)}
        value={code}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          // wordWrap: "on",
          fontSize: 14,
          tabSize: 2,
        }}
        onChange={onChangeCode}
      />
    </div>
  );
};
