// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as sass from "https://jspm.dev/sass";

interface Props {
  code: string;
  path: string;
  onUpdateFiles: (file: string, value: string) => void;
}

const toCssPath = (filePath: string) => {
  console.log("filePath", filePath);
  let newPath = filePath.replace(/\/(scss|sass)\//, "/css/");
  newPath = newPath.replace(/\.(scss|sass)$/, ".css");
  console.log("newPath", newPath);
  return newPath;
};

export const useCompileScss = ({ code, path, onUpdateFiles }: Props) => {
  const compileScss = async () => {
    const result = await sass.compileString(code);
    onUpdateFiles(toCssPath(path), result.css);
  };

  return { compileScss };
};
