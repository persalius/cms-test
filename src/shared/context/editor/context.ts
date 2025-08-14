import { createContext } from "react";
import type { EditorContextType } from "./types";

export const EditorContext = createContext<EditorContextType>(null!);
