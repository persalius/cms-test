import type { FileList } from "../types/file";

const filesFormApi: FileList = {
  "/index.html": {
    content: `<!DOCTYPE html>
<html>
  <head>
    <title>Пример страницы</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <h1>Main  Page</h1>
    <script src="/scripts/app.js"></script>
  </body>
</html>`,
  },
  "/waiting.html": {
    content: `<!DOCTYPE html>
<html>
  <head>
    <title>Waiting Page</title>
  </head>
  <body>
    <h1>Waiting Page</h1>
  </body>
</html>`,
  },
  "/css/style.css": {
    content: `h1 { color: red; font-family: sans-serif; }`,
  },
  "/css/header.css": {
    content: `header { background: green }`,
  },
  "/scripts/app.js": {
    content: `console.log("Hello from JS");`,
  },
};

export const useGetInitialFiles = () => {
  const initialFile: string =
    Object.keys(filesFormApi).find((path) => path.endsWith(".html")) ||
    Object.keys(filesFormApi)[0];

  return { initialFiles: filesFormApi, initialFile };
};
