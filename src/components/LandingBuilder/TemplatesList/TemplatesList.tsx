import { useTemplates } from "@/shared/context/template";
import { SelectionButton } from "../SelectionButton/SelectionButton";
import { useAddTemplate } from "./hooks/useAddTemplate";
import { useEditor } from "@/shared/context/editor";

export const TemplatesList = () => {
  const { templates } = useTemplates();
  const { handleEditTemplate } = useEditor();
  const { handleAddTemplate } = useAddTemplate();

  return (
    <>
      {Object.entries(templates).map(([repoName, template]) => {
        const { name } = template["/template.json"]
          ? JSON.parse(template["/template.json"].code)
          : {};

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
