import { useContext } from "react";

import { TemplatesContext } from "../context";
import { type TemplatesContextType } from "../types";

export const useTemplates = () => useContext<TemplatesContextType>(TemplatesContext);
