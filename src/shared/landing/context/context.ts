import { createContext } from "react";
import type { LandingContextType } from "./types";

export const LandingContext = createContext<LandingContextType>(null!);
