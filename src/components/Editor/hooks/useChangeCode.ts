import { useCallback, useMemo } from "react";
import debounce from "lodash.debounce";

export interface Props {
  activeFile: string;
  onUpdateFiles: (file: string, value: string) => void;
}

export const useChangeCode = ({ onUpdateFiles, activeFile }: Props) => {
  const debouncedSetFiles = useMemo(
    () =>
      debounce((file: string, value: string) => {
        onUpdateFiles(file, value);
      }, 400),
    [onUpdateFiles]
  );

  const onChangeCode = useCallback(
    (value?: string) => debouncedSetFiles(activeFile, value || ""),
    [activeFile, debouncedSetFiles]
  );

  return { onChangeCode };
};
