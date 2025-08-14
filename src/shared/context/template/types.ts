import type { TemplateList } from "@/shared/types/template";

export type TemplatesContextType = {
  templates: TemplateList;
  onUpdateTemplates: (templateKey: string, file: string, value: string) => void;
};
