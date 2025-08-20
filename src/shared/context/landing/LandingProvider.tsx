import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { LandingContext } from "./context";
import type { LandingContextType, LandingState } from "./types";
import type { FileList } from "@/shared/types/file";

interface Props {
  children: ReactNode;
  landingFiles: FileList;
}

export const LandingProvider = ({ children, landingFiles }: Props) => {
  const [landingState, setLandingState] = useState<LandingState>({
    files: {},
    templateInstances: [],
  });

  useEffect(() => {
    if (
      Object.keys(landingState.files).length ||
      !Object.keys(landingFiles).length
    ) {
      return;
    }

    setLandingState((prevState) => ({
      ...prevState,
      files: landingFiles,
    }));
  }, [landingFiles, landingState]);

  const onUpdateLandingFiles = useCallback((file: string, value: string) => {
    setLandingState((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [file]: {
          ...prev.files[file],
          code: value,
        },
      },
    }));
  }, []);

  const contextValue: LandingContextType = useMemo(
    () => ({
      landingState,
      onUpdateLandingFiles,
      setLandingState,
    }),
    [landingState, onUpdateLandingFiles]
  );

  return (
    <LandingContext.Provider value={contextValue}>
      {children}
    </LandingContext.Provider>
  );
};
