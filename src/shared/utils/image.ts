import { IMAGE_EXTENSIONS } from "../constants/image";

export const getIsImage = (path: string) => {
  return IMAGE_EXTENSIONS.some((ext) => path.endsWith(`.${ext}`));
};

export const getMimeType = (filename: string) => {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
    return "image/jpeg";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  if (filename.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
};

export const getImageBlob = (path: string, code: string) => {
  const mime = getMimeType(path);
  return `data:${mime};base64,${code}`;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result = "data:image/png;base64,...."
      const result = reader.result as string;
      // Обрезаем префикс, если нужен только base64
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
