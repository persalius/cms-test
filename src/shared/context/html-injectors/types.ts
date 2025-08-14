import type { HTMLInjectorList } from "@/shared/types/html-injector";
import type { Dispatch, SetStateAction } from "react";

export type HTMLInjectorsContextType = {
  htmlInjectors: HTMLInjectorList;
  setHtmlInjectors: Dispatch<SetStateAction<HTMLInjectorList>>;
};
