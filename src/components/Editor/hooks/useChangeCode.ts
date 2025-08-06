import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { FileList } from "../../../shared/types/file";

export interface Props {
  activeFile: string;
  setFiles: Dispatch<SetStateAction<FileList>>;
}

export const useChangeCode = ({ setFiles, activeFile }: Props) => {
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const onChangeCode = useCallback(
    (value?: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setFiles((prevFiles: FileList) => {
          const newFiles = { ...prevFiles };
          if (newFiles[activeFile]) {
            newFiles[activeFile] = {
              ...newFiles[activeFile],
              content: value || "",
            };
          }
          return newFiles;
        });
      }, 400);
    },
    [activeFile, setFiles]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [activeFile]);

  return { onChangeCode };
};
