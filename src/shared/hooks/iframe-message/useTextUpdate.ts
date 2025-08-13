import { type Dispatch, type SetStateAction } from "react";
import { parse } from "node-html-parser";
import type { EditorState } from "../../types/editor";
import type { LandingState } from "../../types/landng";
import { transfomTemplateString } from "../../utils/transfomTemplateString";

interface Props {
  editorState: EditorState;
  landingState: LandingState;
  setLandingState: Dispatch<SetStateAction<LandingState>>;
}

// Функция для замены текста по CSS-селектору
const updateTextInHtml = (
  html: string,
  selector: string,
  newText: string,
  textNodeIndex?: number
): string => {
  const root = parse(html, { lowerCaseTagName: false });
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

export const useTextUpdate = ({
  editorState,
  landingState,
  setLandingState,
}: Props) => {
  const onUpdateText = (event: MessageEvent) => {
    const { elementSelector, newText, textNodeIndex } = event.data.payload;
    const htmlFile = editorState.activeHtml;
    const html = landingState.files[htmlFile]?.code || "";

    if (!html) {
      alert("HTML file not found");
      return;
    }

    const updatedHtml = updateTextInHtml(
      html,
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
