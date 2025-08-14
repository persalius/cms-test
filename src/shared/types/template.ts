import type { FileList } from "./file";

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  attributes: Record<string, string>; // атрибуты шаблона с default value
  files: {
    html: string; // основной HTML файл
    css: string[]; // массив CSS файлов
    js: string[]; // массив JS файлов
  };
  dependencies?: {
    fonts?: string[];
    libraries?: Array<{
      url: string;
      location: "head-end" | "body-start" | "body-end";
    }>;
  };
}

export interface TemplateInstance {
  id: string; // уникальный ID экземпляра шаблона
  templateId: string; // ID исходного шаблона
  htmlFile: string; // в каком HTML файле находится
  templateConfig: TemplateConfig;
}

export type TemplateList = Record<string, FileList>;
