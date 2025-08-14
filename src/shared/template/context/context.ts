import { createContext } from "react";
import type { TemplatesContextType } from "./types";

export const TemplatesContext = createContext<TemplatesContextType>(null!);
