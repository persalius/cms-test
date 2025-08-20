import { useCallback, useMemo, useState, type ReactNode } from "react";

import { EditorContext } from "./context";
import type { EditorContextType, EditorStateType } from "./types";

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [editorState, setEditorState] = useState<EditorStateType>({
    type: "landing",
    activeFile: "/index.html",
    activeHtml: "/index.html",
  });

  const handleEditLanding = useCallback(() => {
    setEditorState({
      type: "landing",
      activeFile: "/index.html",
      activeHtml: "/index.html",
    });
  }, []);

  const handleEditTemplate = useCallback((templateKey: string) => {
    setEditorState({
      type: "template",
      activeFile: "/index.html",
      activeHtml: "/index.html",
      templateKey,
    });
  }, []);

  const handleSelectFile = useCallback(
    (path: string) => {
      setEditorState((prevState) => {
        const { type } = prevState;

        if (type === "template") {
          return {
            ...prevState,
            activeFile: path,
            activeHtml: "/index.html",
          };
        }

        if (type === "landing") {
          const newActiveHtml = path.endsWith(".html")
            ? path
            : prevState.activeHtml;
          return {
            ...prevState,
            activeFile: path,
            ...(newActiveHtml ? { activeHtml: newActiveHtml } : null),
          };
        }

        return prevState;
      });
    },
    [setEditorState]
  );

  const contextValue: EditorContextType = useMemo(
    () => ({
      editorState,
      setEditorState,
      handleEditLanding,
      handleEditTemplate,
      handleSelectFile,
    }),
    [editorState, handleEditLanding, handleEditTemplate, handleSelectFile]
  );

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};
