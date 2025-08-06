// import React, { useEffect, useState } from "react";
// import { Sandpack } from "@codesandbox/sandpack-react";

type GitHubItem = {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
};

type FileEntry = {
  path: string;
  content: string;
};

const GITHUB_API_BASE = "https://api.github.com/repos";
const OWNER = "persalius"; // <-- поменяй на своего
const REPO = "cms"; // <-- поменяй на своего
const BRANCH = "main"; // или master
const ROOT_DIR = ""; // стартовая папка

async function fetchAllFiles(path: string = ROOT_DIR): Promise<FileEntry[]> {
  const res = await fetch(
    `${GITHUB_API_BASE}/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`
  );

  if (!res.ok) throw new Error(`Failed to load path: ${path}`);

  const items: GitHubItem[] = await res.json();

  const files: FileEntry[] = [];

  for (const item of items) {
    if (item.type === "file" && item.download_url) {
      const content = await fetch(item.download_url).then((r) => r.text());
      files.push({ path: item.path, content });
    } else if (item.type === "dir") {
      const subFiles = await fetchAllFiles(item.path);
      files.push(...subFiles);
    }
  }

  return files;
}

// export default function GitHubLandingSandpack() {
//   const [files, setFiles] = useState<FileEntry[] | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchAllFiles()
//       .then(setFiles)
//       .catch((e) => setError(e.message));
//   }, []);

//   if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

//   if (!files) return <div>Loading files from GitHub...</div>;

//   // Собираем объект файлов с путями для Sandpack
//   const sandpackFiles: Record<string, { code: string; language: string }> = {};

//   files.forEach(({ path, content }) => {
//     let language = "text";
//     if (path.endsWith(".html")) language = "html";
//     else if (path.endsWith(".css")) language = "css";
//     else if (path.endsWith(".js")) language = "js";

//     sandpackFiles["/" + path] = { code: content, language };
//   });

//   // Находим index.html
//   const indexHtmlKey = Object.keys(sandpackFiles).find((p) =>
//     p.toLowerCase().endsWith("index.html")
//   );

//   if (indexHtmlKey) {
//     let html = sandpackFiles[indexHtmlKey].code;

//     // Авто-вставка <link> для CSS файлов (кроме встроенного style.css, если есть)
//     const cssPaths = Object.keys(sandpackFiles).filter(
//       (p) => p.endsWith(".css") && p !== "/style.css"
//     );
//     cssPaths.forEach((cssPath) => {
//       if (!html.includes(cssPath)) {
//         html = html.replace(
//           /<\/head>/i,
//           `  <link rel="stylesheet" href=".${cssPath}" />\n</head>`
//         );
//       }
//     });

//     // Авто-вставка <script> для JS файлов (кроме index.js, если есть)
//     const jsPaths = Object.keys(sandpackFiles).filter(
//       (p) => p.endsWith(".js") && p !== "/index.js"
//     );
//     jsPaths.forEach((jsPath) => {
//       if (!html.includes(jsPath)) {
//         html = html.replace(
//           /<\/body>/i,
//           `  <script src=".${jsPath}"></script>\n</body>`
//         );
//       }
//     });

//     sandpackFiles[indexHtmlKey].code = html;
//   }

//   // Добавим если нет index.js и style.css — чтобы не было ошибок
//   if (!sandpackFiles["/index.js"]) {
//     sandpackFiles["/index.js"] = { code: "// no js", language: "js" };
//   }
//   if (!sandpackFiles["/style.css"]) {
//     sandpackFiles["/style.css"] = { code: "/* no css */", language: "css" };
//   }

//   // Включаем automaticLayout через onMount
//   function handleEditorMount(monaco, editor) {
//     editor.updateOptions({ automaticLayout: true });
//   }

//   return (
//     <div style={{ height: "90vh" }}>
//       <Sandpack
//         template="static"
//         files={sandpackFiles}
//         options={{
//           showNavigator: true,
//           showLineNumbers: true,
//           showTabs: true,
//           wrapContent: true,
//           editorHeight: 500,
//         }}
//         onMount={handleEditorMount}
//       />
//     </div>
//   );
// }

import Editor from "@monaco-editor/react";
import {
  useActiveCode,
  SandpackStack,
  FileTabs,
  useSandpack,
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { useEffect } from "react";

export function MySandpack() {
  const files = {
    "/index.html": {
      code: `<html>
  <head>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <h1 contenteditable="true">Hello, Sandpack!</h1>

    <script src="/scripts/app.js"></script>
  </body>
</html>`,
    },
    "/waiting.html": {
      code: `<html>
  <head>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1 contenteditable="true">Hello, Sandpack!</h1>
  </body>
</html>`,
    },
    "/css/style.css": `h1 { color: red; font-family: sans-serif; }`,
    "/scripts/app.js": {
      code: `console.log("Hello from JS");`,
    },
  };

  // useEffect(() => {
  //   fetchAllFiles()
  //     .then((data) => console.log(data))
  //     .catch((e) => setError(e.message));
  // }, []);

  return (
    <SandpackProvider
      template="static"
      files={files}
      customSetup={{
        entry: "/index.html",
      }}
      options={{
        visibleFiles: ["/css/style.css"],
        activeFile: "/index.html",
      }}
    >
      <SandpackLayout>
        <MonacoEditor />
        <SandpackPreview showOpenInCodeSandbox={false} showNavigator />
      </SandpackLayout>
    </SandpackProvider>
  );
}

const getLanguageFromPath = (filePath: string): string => {
  if (filePath.endsWith(".js")) return "javascript";
  if (filePath.endsWith(".ts")) return "typescript";
  if (filePath.endsWith(".jsx")) return "javascript";
  if (filePath.endsWith(".tsx")) return "typescript";
  if (filePath.endsWith(".html")) return "html";
  if (filePath.endsWith(".css")) return "css";
  if (filePath.endsWith(".json")) return "json";
  return "plaintext";
};

export const MonacoEditor = () => {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();

  const activeFile = sandpack.activeFile;
  const language = getLanguageFromPath(activeFile);

  return (
    <SandpackStack
      style={{
        height: "100vh",
        margin: 0,
        display: "flex",
        flexDirection: "row",
      }}
    >
      <SandpackFileExplorer style={{ width: 140 }} />
      <div style={{ flex: 1 }}>
        <FileTabs closableTabs />
        <Editor
          width="100%"
          height="100%"
          language={language}
          key={sandpack.activeFile}
          defaultValue={code}
          onChange={(value) => updateCode(value || "")}
        />
      </div>
    </SandpackStack>
  );
};
