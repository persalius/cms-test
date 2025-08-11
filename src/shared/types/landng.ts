import type { FileList } from "./file";
import type { TemplateInstance } from "./template";

export interface LandingState {
  files: FileList; // исходные файлы для редактирования
  templateInstances: TemplateInstance[]; // информация о вставленных шаблонах
  templateFilesAdded: Set<string>; // отслеживание уже добавленных файлов шаблонов
}
