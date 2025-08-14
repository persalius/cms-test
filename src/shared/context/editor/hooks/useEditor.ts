import { useContext } from "react";

import { EditorContext } from "../context";
import { type EditorContextType } from "../types";

export const useEditor = () => useContext<EditorContextType>(EditorContext);
