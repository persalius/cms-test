import { type Dispatch, type SetStateAction } from "react";
import type { EditorState } from "../../types/editor";
import type { LandingState } from "../../types/landng";
import { parse } from "node-html-parser/dist/nodes/html";

interface Props {
  editorState: EditorState;
  landingState: LandingState;
  setLandingState: Dispatch<SetStateAction<LandingState>>;
}

// Функция для замены текста по CSS-селектору
const updateTextInHtml = (
  html: string,
  selector: string,
  newText: string
): string => {
  const root = parse(html, { lowerCaseTagName: false });
  const element = root.querySelector(selector);
  if (element) {
    element.set_content(newText);
  }
  let result = root.toString();
  result = result.replace(/<Template([^>]*)><\/Template>/g, "<Template$1 />");

  return result;
};

export const useTextUpdated = ({
  editorState,
  landingState,
  setLandingState,
}: Props) => {
  const onUpdateText = (event: MessageEvent) => {
    if (event.data?.type === "TEXT_UPDATED") {
      const { elementSelector, newText } = event.data.payload;
      const htmlFile = editorState.activeHtml;
      const html = landingState.files[htmlFile]?.code || "";

      if (!html) {
        alert("HTML file not found");
        return;
      }

      const updatedHtml = updateTextInHtml(html, elementSelector, newText);

      setLandingState((prev) => ({
        ...prev,
        files: {
          ...prev.files,
          [htmlFile]: { code: updatedHtml },
        },
      }));
    }
  };

  return { onUpdateText };
};
