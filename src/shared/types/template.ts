import type { FileList } from "./file";

export interface Injection {
  target:
    | `comment:${string}`
    | "start"
    | "end"
    | "before-styles"
    | "before-scripts";
  container: "body" | "head";
}

export interface TemplateFont {
  tag: string;
}

export type TemplateLibraryItem = Injection & {
  tag: string;
};

export interface TemplateLibraries {
  [name: string]: TemplateLibraryItem[];
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  injections?: {
    [path: string]: Injection;
  };
  dependencies?: {
    fonts?: TemplateFont[];
    libraries?: TemplateLibraries;
  };
}

// export type Template = FileList & { "/config.json": { code: TemplateConfig } };

export interface TemplateInstance {
  id: string; // уникальный ID экземпляра шаблона
  templateId: string; // ID исходного шаблона
  htmlFile: string; // в каком HTML файле находится
}

export type TemplateList = Record<string, FileList>;
