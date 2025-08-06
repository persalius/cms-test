import type { Dispatch, RefObject, SetStateAction } from "react";
import type { FileList } from "../../shared/types/file";

export interface Props {
  previewRef: RefObject<HTMLIFrameElement | null>;
  files: FileList;
  setFiles: Dispatch<SetStateAction<FileList>>;
  activeFile: string;
  activeHtml: string;
}
