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
