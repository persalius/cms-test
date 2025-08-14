import { useEffect, useMemo, useState, type ReactNode } from "react";
import { HTMLInjectorsContext } from "./context";
import type { HTMLInjectorsContextType } from "./types";
import type { HTMLInjectorList } from "@/shared/types/html-injector";

interface Props {
  children: ReactNode;
  htmlInjectorsList: HTMLInjectorList;
}

export const HTMLInjectorProvider = ({
  children,
  htmlInjectorsList,
}: Props) => {
  const [htmlInjectors, setHtmlInjectors] = useState<HTMLInjectorList>({});

  useEffect(() => {
    if (
      Object.keys(htmlInjectors).length &&
      Object.keys(htmlInjectorsList).length
    )
      return;
    setHtmlInjectors(htmlInjectorsList);
  }, [htmlInjectors, htmlInjectorsList]);

  const contextValue: HTMLInjectorsContextType = useMemo(
    () => ({
      htmlInjectors,
      setHtmlInjectors,
    }),
    [htmlInjectors]
  );

  return (
    <HTMLInjectorsContext.Provider value={contextValue}>
      {children}
    </HTMLInjectorsContext.Provider>
  );
};
