import { useEditor } from "@/shared/context/editor";
import { useLanding } from "@/shared/context/landing";
import { fileToBase64 } from "@/shared/utils/image";
import { parseHtml } from "@/shared/utils/parser";

interface Props {
  editImageSelector: string | null;
  onClose: () => void;
}

export const useSubmit = ({ editImageSelector, onClose }: Props) => {
  const { landingState, setLandingState } = useLanding();
  const { editorState } = useEditor();
  const { files } = landingState;
  const { activeHtml } = editorState;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editImageSelector || !activeHtml) {
      return;
    }

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newSrc = formData.get("image-path") as string;
    const pictureFile = formData.get("picture") as File | null;

    const html = files[activeHtml].code;
    const root = parseHtml(html);
    const imgEl = root.querySelector(editImageSelector);

    let updatedFiles = { ...files };

    if (newSrc) {
      imgEl?.setAttribute("src", newSrc);

      updatedFiles = {
        ...files,
        [activeHtml]: { code: root.toString() },
      };
    } else if (pictureFile) {
      const pictureName = pictureFile?.name || "";
      const pictureBase64Url = await fileToBase64(pictureFile);

      const path = `images/${pictureName}`;
      imgEl?.setAttribute("src", path);

      updatedFiles = {
        ...files,
        [activeHtml]: { code: root.toString() },
        [path]: { code: pictureBase64Url },
      };
    }

    setLandingState((prev) => ({
      ...prev,
      files: updatedFiles,
    }));

    onClose();
  };

  return { handleSubmit };
};
