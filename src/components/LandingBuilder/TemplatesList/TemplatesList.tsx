import { useEditor } from "@/shared/editor/context/hooks/useEditor";
import { SelectionButton } from "../SelectionButton/SelectionButton";
import { useAddTemplate } from "./hooks/useAddTemplate";
import { useTemplates } from "@/shared/template/context";

export const TemplatesList = () => {
  const { templates } = useTemplates();
  const { handleEditTemplate } = useEditor();
  const { handleAddTemplate } = useAddTemplate();

  return (
    <div style={{ display: "flex", gap: "12px" }}>
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
    </div>
  );
};
