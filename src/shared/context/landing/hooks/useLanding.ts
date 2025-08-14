import { useContext } from "react";

import { LandingContext } from "../context";
import { type LandingContextType } from "../types";

export const useLanding = () => useContext<LandingContextType>(LandingContext);
