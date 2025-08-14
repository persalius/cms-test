import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { TemplatesContext } from "./context";
import type { TemplateList } from "@/shared/types/template";
import type { TemplatesContextType } from "./types";

interface Props {
  children: ReactNode;
  templatesList: TemplateList;
}

export const TemplateProvider = ({ children, templatesList }: Props) => {
  const [templates, setTemplates] = useState<TemplateList>({});

  const onUpdateTemplates = useCallback(
    (templateKey: string, file: string, value: string) => {
      setTemplates((prevTemplates) => ({
        ...prevTemplates,
        [templateKey]: {
          ...prevTemplates[templateKey],
          [file]: {
            ...prevTemplates[templateKey][file],
            code: value,
          },
        },
      }));
    },
    []
  );

  useEffect(() => {
    if (Object.keys(templates).length) return;
    setTemplates(templatesList);
  }, [templates, templatesList]);

  const contextValue: TemplatesContextType = useMemo(
    () => ({
      templates,
      onUpdateTemplates,
    }),
    [templates, onUpdateTemplates]
  );

  return (
    <TemplatesContext.Provider value={contextValue}>
      {children}
    </TemplatesContext.Provider>
  );
};
