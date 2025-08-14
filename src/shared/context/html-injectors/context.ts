import { createContext } from "react";
import type { HTMLInjectorsContextType } from "./types";

export const HTMLInjectorsContext = createContext<HTMLInjectorsContextType>(null!);
