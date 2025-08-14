import { useContext } from "react";

import { HTMLInjectorsContext } from "../context";
import { type HTMLInjectorsContextType } from "../types";

export const useHTMLInjectors = () =>
  useContext<HTMLInjectorsContextType>(HTMLInjectorsContext);
