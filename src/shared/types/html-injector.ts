import type { FileList } from "./file";

export interface HtmlInjectorConfig {
  id: string;
  name: string;
  description?: string;
  templateString: string;
  version: string;
  attributes: Record<string, string>;
}

export type HTMLInjectorList = Record<string, FileList>;
