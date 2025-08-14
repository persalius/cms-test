import type { FileList } from "@/shared/types/file";
import type { TemplateInstance } from "@/shared/types/template";
import type { Dispatch, SetStateAction } from "react";

export interface LandingState {
  files: FileList; // исходные файлы для редактирования
  templateInstances: TemplateInstance[]; // информация о вставленных шаблонах
  templateFilesAdded: Set<string>; // отслеживание уже добавленных файлов шаблонов
}

export type LandingContextType = {
  landingState: LandingState;
  onUpdateLandingFiles: (file: string, value: string) => void;
  setLandingState: Dispatch<SetStateAction<LandingState>>;
};
