import { useEffect, useState } from "react";
import axios from "axios";
import type { FileList } from "../types/file";
import { getIsImage } from "../utils/image";

const filesFormApi: FileList = {
  "/index.html": {
    code: `<!DOCTYPE html>
<html>
  <head>
    <title>Пример страницы</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <h1>
      Main Page
      <p>
        parargraph
        <span>span</span>
      </p> 
    </h1>
    <script src="scripts/app.js"></script>
  </body>
</html>`,
  },
  "/waiting.html": {
    code: `<!DOCTYPE html>
<html>
  <head>
    <title>Waiting Page</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1>Waiting Page</h1>
  </body>
</html>`,
  },
  "/css/style.css": {
    code: `h1 { color: red; font-family: sans-serif; }`,
  },
  "/scripts/app.js": {
    code: `console.log("Hello from JS");`,
  },
  "/image/logo.png": {
    code: "iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAAJklEQVR4nO3MQQEAAAQEMPTvTIp72QKst1ImNqvVarVarVarH9QH6ZIBO0i8R3wAAAAASUVORK5CYII=",
  },
};

export const useGetLanding = () => {
  const [files, setFiles] = useState<FileList>({});
  const owner = "persalius";
  const repo = "landing";
  const branch = "main";
  const limit = 5;

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(i, i + chunkSize) as unknown as number[]
      );
    }
    return btoa(binary);
  };

  useEffect(() => {
    const fetchRepoFiles = async () => {
      try {
        const { data } = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
        );

        const allFiles = data.tree.filter((item: any) => item.type === "blob");
        const fileMap: FileList = {};

        for (let i = 0; i < allFiles.length; i += limit) {
          const chunk = allFiles.slice(i, i + limit);
          const chunkResults = await Promise.all(
            chunk.map(async (file: any) => {
              const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
              const isImage = getIsImage(file.path);

              const fileRes = await axios.get(rawUrl, {
                responseType: isImage ? "arraybuffer" : "text",
              });

              return {
                path: file.path,
                code: isImage
                  ? arrayBufferToBase64(fileRes.data)
                  : fileRes.data,
              };
            })
          );

          chunkResults.forEach(({ path, code }) => {
            // Важно поставить "/" в начале. Это нужно для CodeSandPack.
            // При сохранении файлов на github "/" в начале нужно удалять.
            fileMap[`/${path}`] = { code };
          });
        }

        setFiles(fileMap);
      } catch (err) {
        console.error("Ошибка при загрузке файлов:", err);
      }
    };

    fetchRepoFiles();
  }, []);

  return { landingFiles: files };
};
