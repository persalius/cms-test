import { transfomTemplateString } from "../../utils/template";
import { useEditor } from "@/shared/context/editor";
import { useLanding } from "@/shared/context/landing";
import { parseHtml } from "@/shared/utils/parser";

// Функция для замены текста по CSS-селектору
const updateTextInHtml = (
  html: string,
  selector: string,
  newText: string,
  textNodeIndex?: number
): string => {
  const root = parseHtml(html);
  const element = root.querySelector(selector);

  if (element) {
    if (typeof textNodeIndex === "number" && textNodeIndex >= 0) {
      // Меняем только нужный текстовый узел
      const textNodes = element.childNodes.filter((n) => n.nodeType === 3);
      if (textNodes[textNodeIndex]) {
        // Заменяем неразрывные пробелы на обычные
        textNodes[textNodeIndex].rawText = (newText ?? "").replace(
          /\u00A0/g,
          " "
        );
      }
    } else {
      // Меняем весь текст/контент (как сейчас)
      element.set_content(newText);
    }
  }

  return transfomTemplateString(root.toString());
};

export const useUpdateText = () => {
  const { editorState } = useEditor();
  const { landingState, setLandingState } = useLanding();

  const onUpdateText = (event: MessageEvent) => {
    const { elementSelector, newText, textNodeIndex } = event.data.payload;
    const htmlFile = editorState.activeHtml!;
    const htmlCode = landingState.files[htmlFile].code;

    const updatedHtml = updateTextInHtml(
      htmlCode,
      elementSelector,
      newText,
      textNodeIndex
    );

    setLandingState((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [htmlFile]: { code: updatedHtml },
      },
    }));
  };

  return { onUpdateText };
};
