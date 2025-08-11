import "./TemplatesList.css";

interface Props {
  name?: string;
  onPreview: () => void;
  onAdd?: () => void;
}

export const SelectionButton = ({ name, onPreview, onAdd }: Props) => {
  return (
    <div className="template-card">
      {name && <p className="template-name">{name}</p>}
      <div className="template-actions">
        <div className="template-buttons">
          <button
            className="template-btn template-btn-preview"
            onClick={onPreview}
            title="Просмотр шаблона"
          >
            👁 Открыть редактор
          </button>
          {onAdd && (
            <button
              className="template-btn template-btn-select"
              onClick={onAdd}
              title="Использовать шаблон"
            >
              ✨ Использовать
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
