import { useEffect, useState } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import * as parse5 from "parse5";
import { parseFragment, serialize } from "parse5";

type ComponentMap = Record<string, string>;

type SharedComponentName = "Footer" | "Header";

type Props = {
  setPreviewUrl: (code: string) => void;
  previewUrl: string;
};

const DEVICES = {
  desktop: { label: "Desktop", width: "100%", px: 0 },
  tablet: { label: "Tablet", width: "768px", px: 20 },
  mobile: { label: "Mobile", width: "375px", px: 20 },
};

// Функция для подстановки пропсов в шаблон
function renderTemplate(template: string, props: Record<string, any>): string {
  return template.replace(/\{(\w+)(?:=([^}]*))?\}/g, (_, key, defaultValue) => {
    return props[key] ?? defaultValue ?? "";
  });
}

// Рекурсивный обход и замена SharedComponent
function replaceSharedComponents(
  node: parse5.DefaultTreeNode,
  sharedCode: Record<
    SharedComponentName,
    { html: string; css: string; js: string }
  >
) {
  if (!("childNodes" in node) || !node.childNodes) return;

  const newChildNodes: parse5.DefaultTreeNode[] = [];

  for (const child of node.childNodes) {
    if (
      "tagName" in child &&
      child.tagName.toLowerCase() === "sharedcomponent"
    ) {
      const attrs = (child.attrs || []).reduce<Record<string, string>>(
        (acc, attr) => {
          acc[attr.name.toLowerCase()] = attr.value;
          return acc;
        },
        {}
      );

      const name = attrs["name"] as SharedComponentName | undefined;
      if (!name || !sharedCode[name]) {
        newChildNodes.push({
          nodeName: "div",
          tagName: "div",
          attrs: [
            {
              name: "style",
              value: "color:red; font-weight:bold",
            },
          ],
          namespaceURI: "http://www.w3.org/1999/xhtml",
          childNodes: [
            {
              nodeName: "#text",
              value: "Missing or invalid SharedComponent name",
              parentNode: null as any,
            },
          ],
          parentNode: null as any,
        });
        continue;
      }

      // 1. Получаем HTML из дочерних узлов <SharedComponent>
      const childrenHtml = parse5.serialize({
        nodeName: "#document-fragment",
        childNodes: child.childNodes || [],
      });

      // 2. Подставляем props + children в шаблон
      // Расширяем props, добавляя ключ children с HTML
      const propsWithChildren = { ...attrs, children: childrenHtml };

      const renderedHtml = renderTemplate(
        sharedCode[name].html,
        propsWithChildren
      );

      // 3. Парсим результат в узлы
      const fragment = parse5.parseFragment(renderedHtml);

      for (const fragChild of fragment.childNodes) {
        fragChild.parentNode = node;
      }

      newChildNodes.push(...fragment.childNodes);
    } else {
      replaceSharedComponents(child, sharedCode);
      newChildNodes.push(child);
    }
  }

  node.childNodes = newChildNodes;
}

export default function Editor({ setPreviewUrl, previewUrl }: Props) {
  const [mode, setMode] = useState<"landing" | SharedComponentName>("landing");

  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
  <title>My Landing Page</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`);

  const [css, setCss] = useState(`
    h1 { color: red; }

    @media (max-width: 768px) {
      h1 { color: blue; }
    }

    @media (max-width: 480px) {
      h1 { color: green; }
    }
  `);

  const [js, setJs] = useState("console.log('Loaded');");

  const [sharedCode, setSharedCode] = useState<
    Record<SharedComponentName, { html: string; css: string; js: string }>
  >({
    Footer: {
      html: "<footer><p>{title=Page Footer}</p>{children}</footer>",
      css: "footer { background: #eee; padding: 20px; }",
      js: "",
    },
    Header: {
      html: "<header><h1>{title=Page Header}</h1>{children}</header>",
      css: "header { background: #ccc; padding: 10px; }",
      js: "",
    },
  });

  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );

  useEffect(() => {
    let finalHtml = "";

    if (mode === "landing") {
      // Парсим HTML лендинга
      const document = parse5.parse(html);

      // Заменяем shared компоненты в дереве
      replaceSharedComponents(document, sharedCode);

      // Сериализуем обратно в HTML строку
      const serializedHtml = parse5.serialize(document);

      // Собираем CSS
      const allCss = [...Object.values(sharedCode).map((c) => c.css), css].join(
        "\n"
      );

      // Собираем JS (сначала shared, потом landing)
      const allJs = [...Object.values(sharedCode).map((c) => c.js), js].join(
        "\n"
      );

      // Вставляем CSS и JS в правильные места, немного «вручную»
      // Поскольку parse5 не поддерживает удобное вставление внутрь <head> и <body> — делаем через replace

      finalHtml = serializedHtml;

      // Вставляем CSS в <head>
      finalHtml = finalHtml.replace(
        /<\/head>/i,
        `<style>${allCss}</style></head>`
      );

      // Вставляем JS в конец <body>
      finalHtml = finalHtml.replace(
        /<\/body>/i,
        `<script>${allJs}</script></body>`
      );
    } else {
      // Рендерим только shared компонент
      const shared = sharedCode[mode];
      finalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${shared.css}</style>
</head>
<body>
  ${shared.html}
  <script>${shared.js}</script>
</body>
</html>`;
    }

    const blob = new Blob([finalHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [html, css, js, sharedCode, mode]);

  const editors =
    mode === "landing"
      ? [
          { lang: "html", value: html, set: setHtml },
          { lang: "css", value: css, set: setCss },
          { lang: "js", value: js, set: setJs },
        ]
      : [
          {
            lang: "html",
            value: sharedCode[mode].html,
            set: (v: string) =>
              setSharedCode((prev) => ({
                ...prev,
                [mode]: { ...prev[mode], html: v },
              })),
          },
          {
            lang: "css",
            value: sharedCode[mode].css,
            set: (v: string) =>
              setSharedCode((prev) => ({
                ...prev,
                [mode]: { ...prev[mode], css: v },
              })),
          },
          {
            lang: "js",
            value: sharedCode[mode].js,
            set: (v: string) =>
              setSharedCode((prev) => ({
                ...prev,
                [mode]: { ...prev[mode], js: v },
              })),
          },
        ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Кнопки переключения между landing и shared компонентами */}
      <div style={{ display: "flex", gap: 8, padding: "8px 12px" }}>
        <button
          onClick={() => setMode("landing")}
          style={{
            fontWeight: mode === "landing" ? "bold" : "normal",
            padding: "6px 12px",
          }}
        >
          Landing Page
        </button>
        {(Object.keys(sharedCode) as SharedComponentName[]).map((name) => (
          <button
            key={name}
            onClick={() => setMode(name)}
            style={{
              fontWeight: mode === name ? "bold" : "normal",
              padding: "6px 12px",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Панель вставки shared компонентов — только в режиме landing */}
      {mode === "landing" && (
        <div style={{ display: "flex", gap: 8, padding: "8px 12px" }}>
          <span>Вставить компонент:</span>
          {(Object.keys(sharedCode) as SharedComponentName[]).map(
            (compName) => (
              <button
                key={compName}
                onClick={() => {
                  const tag = `<SharedComponent name="${compName}"></SharedComponent>`;
                  setHtml((prev) => prev + "\n" + tag);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                {compName}
              </button>
            )
          )}
        </div>
      )}

      {/* Device selector */}
      <div style={{ display: "flex", gap: 8, padding: "8px 12px" }}>
        {(["desktop", "tablet", "mobile"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: device === d ? "2px solid blue" : "1px solid #ccc",
              background: device === d ? "#eef" : "white",
              cursor: "pointer",
              fontWeight: device === d ? "bold" : "normal",
            }}
          >
            {DEVICES[d].label}
          </button>
        ))}
      </div>

      {/* Editors and preview */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Editors */}
        <div
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 12,
          }}
        >
          {editors.map((ed) => (
            <MonacoEditor
              key={ed.lang}
              height="200px"
              language={ed.lang}
              value={ed.value}
              onChange={(v) => v && ed.set(v)}
            />
          ))}
        </div>

        {/* Preview */}
        <div
          style={{
            width: "50%",
            padding: 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f5f5f5",
          }}
        >
          <div
            style={{
              width: DEVICES[device].width,
              padding: DEVICES[device].px,
              background: "white",
              border: "1px solid #ccc",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <iframe
              src={previewUrl}
              style={{
                width: "100%",
                height: "600px",
                border: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
