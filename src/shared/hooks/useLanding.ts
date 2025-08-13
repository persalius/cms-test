import { useCallback, useState } from "react";
import type { FileList } from "../types/file";
import type { LandingState } from "../types/landng";

const filesFormApi: FileList = {
  "/index.html": {
    code: `<!DOCTYPE html>
<html>
  <head>
    <title>Пример страницы</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <h1>
      Main  Page
      <p>
        parargraph
        <span>span</span>
      </p> 
    </h1>
    <script src="/scripts/app.js"></script>
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
  // "/public/logo.png": {
  //   code: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAAJklEQVR4nO3MQQEAAAQEMPTvTIp72QKst1ImNqvVarVarVarH9QH6ZIBO0i8R3wAAAAASUVORK5CYII=",
  // },
};

export const useLanding = () => {
  const [landingState, setLandingState] = useState<LandingState>({
    files: filesFormApi,
    templateInstances: [],
    templateFilesAdded: new Set(),
  });

  const onUpdateLandingFiles = useCallback((file: string, value: string) => {
    setLandingState((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [file]: {
          ...prev.files[file],
          code: value,
        },
      },
    }));
  }, []);

  return {
    landingState,
    setLandingState,
    onUpdateLandingFiles,
  };
};
