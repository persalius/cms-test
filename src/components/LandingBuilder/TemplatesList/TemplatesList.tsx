import { useTemplates } from "@/shared/context/template";
import { SelectionButton } from "../SelectionButton/SelectionButton";
import { useAddTemplate } from "./hooks/useAddTemplate";
import { useEditor } from "@/shared/context/editor";
import type { FileList } from "@/shared/types/file";

const getName = (template: FileList) => {
  let name = "";

  try {
    if (template["/config.json"]) {
      const parsed = template["/config.json"]
        ? JSON.parse(template["/config.json"].code)
        : {};
      name = parsed.name;
    }
  } catch {
    name = "";
  }

  return name;
};

export const TemplatesList = () => {
  const { templates } = useTemplates();
  const { handleEditTemplate } = useEditor();
  const { handleAddTemplate } = useAddTemplate();

  return (
    <>
      {Object.entries(templates).map(([repoName, template]) => {
        const name = getName(template);

        return (
          <SelectionButton
            key={repoName}
            name={name}
            onAdd={() => handleAddTemplate(template)}
            onPreview={() => handleEditTemplate(repoName)}
          />
        );
      })}
    </>
  );
};
