import MonacoEditor from "@monaco-editor/react";

import { getLanguageFromPath } from "./utils";
import { useChangeCode } from "./hooks/useChangeCode";

import type { FileList } from "../../../shared/types/file";
import { useUpdateFiles } from "./hooks/useUpdateFiles";

export interface Props {
  files: FileList;
  activeFile: string;
}

export const Editor = ({ files, activeFile }: Props) => {
  const { onUpdateFiles } = useUpdateFiles();
  const { onChangeCode } = useChangeCode({ activeFile, onUpdateFiles });

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
