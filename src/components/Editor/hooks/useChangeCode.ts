import { useCallback, useMemo } from "react";
import debounce from "lodash.debounce";

export interface Props {
  activeFile: string;
  updateFiles: (file: string, value: string) => void;
}

export const useChangeCode = ({ updateFiles, activeFile }: Props) => {
  const debouncedSetFiles = useMemo(
    () =>
      debounce((file: string, value: string) => {
        updateFiles(file, value);
      }, 400),
    [updateFiles]
  );

  const onChangeCode = useCallback(
    (value?: string) => debouncedSetFiles(activeFile, value || ""),
    [activeFile, debouncedSetFiles]
  );

  return { onChangeCode };
};
