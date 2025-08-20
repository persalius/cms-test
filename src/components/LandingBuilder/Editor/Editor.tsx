import MonacoEditor from "@monaco-editor/react";

import { getLanguageFromPath } from "./utils";
import { useChangeCode } from "./hooks/useChangeCode";

import type { FileList } from "../../../shared/types/file";
import { useUpdateFiles } from "./hooks/useUpdateFiles";
import { Button } from "../ui/button";
import { useCompileScss } from "./hooks/useCompileScss";

export interface Props {
  files: FileList | null;
  activeFile: string;
}

export const Editor = ({ files, activeFile }: Props) => {
  const code = files?.[activeFile]?.code || "";

  const { onUpdateFiles } = useUpdateFiles();
  const { onChangeCode } = useChangeCode({ activeFile, onUpdateFiles });
  const { compileScss } = useCompileScss({
    code,
    path: activeFile,
    onUpdateFiles,
  });

  const currentFileExtension = activeFile.split(".").pop();
  const isScssExtension = currentFileExtension === "scss";
  const isCssExtension = currentFileExtension === "css";

  const isScssFiles = Object.keys(files || {}).some((file) =>
    file.endsWith(".scss")
  );
  const isReadOnly = isScssFiles && isCssExtension;

  return (
    <div className="flex-1 h-full">
      <div className="flex items-center justify-between py-2 px-4 bg-gray-100 text-gray-800 font-medium h-14">
        {activeFile}
        {isScssExtension && (
          <Button className="cursor-pointer" onClick={compileScss}>
            Compile
          </Button>
        )}
      </div>
      <MonacoEditor
        className="h-full"
        key={activeFile}
        language={getLanguageFromPath(activeFile)}
        onChange={onChangeCode}
        value={code}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: 2,
          readOnly: isReadOnly,
        }}
      />
    </div>
  );
};
