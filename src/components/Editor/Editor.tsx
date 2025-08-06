import { useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

import { getLanguageFromPath } from "./utils";
import type { Props } from "./types";
import { useChangeCode } from "./hooks/useChangeCode";

// Вспомогательная функция для создания Blob URL.
// Мы будем использовать ее, чтобы браузер понимал, что ресурс изменился.
const createBlobUrl = (content, type) => {
  const blob = new Blob([content], { type });
  return URL.createObjectURL(blob);
};

export const Editor = ({
  previewRef,
  files,
  setFiles,
  activeFile,
  activeHtml,
}: Props) => {
  const { onChangeCode } = useChangeCode({ activeFile, setFiles });

  const code = files[activeFile]?.content || "";

  // useRef для хранения URL-адресов Blob, чтобы управлять ими.
  const cleanupUrlsRef = useRef([]);

  useEffect(() => {
    const iframe = previewRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    // Очищаем старые Blob URL перед созданием новых
    cleanupUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    cleanupUrlsRef.current = [];

    // Создаём Blob URL для каждого файла
    const fileUrls = Object.entries(files).reduce((acc, [path, file]) => {
      const type = path.endsWith(".css")
        ? "text/css"
        : path.endsWith(".js")
        ? "application/javascript"
        : "text/html";
      const blob = new Blob([file.content], { type });
      const url = URL.createObjectURL(blob);
      acc[path] = url;
      cleanupUrlsRef.current.push(url);
      return acc;
    }, {});

    // Получаем содержимое основного HTML-файла
    const htmlContent = files[activeHtml]?.content || "";

    // Используем DOMParser для создания нового документа
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(htmlContent, "text/html");

    // Обновляем ссылки на CSS и JS в новом документе
    newDoc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = link.getAttribute("href");
      if (href && fileUrls[href]) {
        link.setAttribute("href", fileUrls[href]);
      }
    });

    newDoc.querySelectorAll("script[src]").forEach((script) => {
      const src = script.getAttribute("src");
      if (src && fileUrls[src]) {
        script.setAttribute("src", fileUrls[src]);
      }
    });

    // 1. Обновляем содержимое head
    const newHead = newDoc.head;
    const oldHead = iframeDoc.head;
    if (oldHead && newHead) {
      oldHead.innerHTML = newHead.innerHTML;
    }

    // 2. Обновляем содержимое body
    const newBody = newDoc.body;
    const oldBody = iframeDoc.body;
    if (oldBody && newBody) {
      oldBody.innerHTML = newBody.innerHTML;
    }
  }, [files, activeHtml]);

  // Обновляем содержимое iframe, заменяя теги <link> и <script> на встроенные версии
  // useEffect(() => {
  //   const updateIframe = () => {
  //     // Получаем содержимое активного HTML-файла
  //     const htmlFileContent = files[activeHtml]?.content || "";
  //     const cssContent = files["/css/style.css"]?.content || "";
  //     const jsContent = files["/scripts/app.js"]?.content || "";

  //     // Создаем копию HTML для работы
  //     let finalHtml = htmlFileContent;

  //     // Регулярные выражения для поиска тегов
  //     const cssLinkRegex = /<link\s+[^>]*href="\s*\/css\/style\.css\s*"[^>]*>/i;
  //     const jsScriptRegex =
  //       /<script\s+[^>]*src="\s*\/scripts\/app\.js\s*"[^>]*><\/script>/i;

  //     // Если тег <link> существует в HTML, заменяем его на встроенный <style>
  //     if (cssLinkRegex.test(finalHtml)) {
  //       finalHtml = finalHtml.replace(
  //         cssLinkRegex,
  //         `<style data-injected="true">${cssContent}</style>`
  //       );
  //     }

  //     // Если тег <script> существует в HTML, заменяем его на встроенный <script>
  //     if (jsScriptRegex.test(finalHtml)) {
  //       finalHtml = finalHtml.replace(
  //         jsScriptRegex,
  //         `<script data-injected="true">${jsContent}</script>`
  //       );
  //     }

  //     // Добавляем дополнительные стили и скрипты для интерактивности
  //     const headInjection = `
  //       <style data-injected="true">
  //         [contenteditable="true"] {
  //           outline: 2px dashed #007bff;
  //           cursor: pointer;
  //         }
  //         [contenteditable="true"]:hover {
  //           background-color: rgba(0, 123, 255, 0.1);
  //         }
  //       </style>
  //       </head>
  //     `;

  //     const bodyInjection = `
  //       <script data-injected="true">
  //         document.body.addEventListener('dblclick', (e) => {
  //           e.stopPropagation();
  //           if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV'].includes(e.target.tagName)) {
  //             e.target.setAttribute('contenteditable', 'true');
  //             e.target.focus();
  //           }
  //         });
  //         document.body.addEventListener('blur', (e) => {
  //           if (e.target.hasAttribute('contenteditable')) {
  //             e.target.removeAttribute('contenteditable');
  //             window.parent.postMessage({
  //               type: 'contentChange',
  //               newContent: document.body.innerHTML,
  //             }, '*');
  //           }
  //         }, true);
  //       </script>
  //       </body>
  //     `;

  //     // Вставляем инъекции в нужные места
  //     finalHtml = finalHtml.replace("</head>", headInjection);
  //     finalHtml = finalHtml.replace("</body>", bodyInjection);

  //     if (previewRef.current) {
  //       const iframeDoc = previewRef.current.contentDocument;
  //       if (iframeDoc) {
  //         iframeDoc.open();
  //         iframeDoc.write(finalHtml);
  //         iframeDoc.close();
  //       }
  //     }
  //   };
  //   updateIframe();
  // }, [files, activeHtml, previewRef]);

  // Эффект для прослушивания сообщений от iframe
  useEffect(() => {
    const handleIframeMessage = (event) => {
      // Проверяем, что сообщение пришло от нашего iframe и имеет нужный тип
      if (
        previewRef.current &&
        event.source === previewRef.current.contentWindow &&
        event.data.type === "contentChange"
      ) {
        const updatedHtml = event.data.newContent;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = updatedHtml;
        tempDiv
          .querySelectorAll("[data-injected]")
          .forEach((el) => el.remove());
        const cleanedHtml = tempDiv.innerHTML.trim();

        setFiles((prevFiles) => {
          const newFiles = { ...prevFiles };
          if (newFiles[activeHtml]) {
            const oldHtml = newFiles[activeHtml].content;
            const newHtmlContent = oldHtml.replace(
              /<body>[\s\S]*<\/body>/i,
              `<body>\n    ${cleanedHtml}\n  </body>`
            );
            newFiles[activeHtml] = {
              ...newFiles[activeHtml],
              content: newHtmlContent,
            };
          }
          return newFiles;
        });
      }
    };
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [activeFile]);

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        backgroundColor: "#f1f5f9",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #e2e8f0",
          padding: "0.5rem 1rem",
          backgroundColor: "#f1f5f9",
          fontWeight: "500",
          color: "#334155",
        }}
      >
        {activeFile}
      </div>
      <MonacoEditor
        key={activeFile}
        height="100%"
        defaultLanguage={getLanguageFromPath(activeFile)}
        language={getLanguageFromPath(activeFile)}
        value={code}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          fontSize: 14,
          tabSize: 2,
        }}
        onChange={onChangeCode}
      />
    </div>
  );
};
