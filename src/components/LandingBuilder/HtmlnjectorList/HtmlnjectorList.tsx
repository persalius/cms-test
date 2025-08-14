import { useHTMLInjectors } from "@/shared/context/html-injectors";
import { SelectionButton } from "../SelectionButton/SelectionButton";
import { useAddHtmlInjector } from "./hooks/useAddHtmlInjector";

export const HtmlnjectorList = () => {
  const { htmlInjectors } = useHTMLInjectors();
  const { handleAddHtmlInjector } = useAddHtmlInjector();

  return (
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3">
        HTML Injectors:
      </h4>
      <div className="flex gap-3 mb-3">
        {Object.entries(htmlInjectors).map(([repoName, htmlInjector]) => {
          const { name } = htmlInjector["/injector.json"]
            ? JSON.parse(htmlInjector["/injector.json"].code)
            : {};

          return (
            <SelectionButton
              key={repoName}
              name={name}
              onAdd={() => handleAddHtmlInjector(htmlInjector)}
              onPreview={() => {}}
            />
          );
        })}
      </div>
    </>
  );
};
