import type { FileList } from "@/shared/types/file";
import { useState } from "react";

const FileTextIcon = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const ChevronDownIcon = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FolderIcon = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
  </svg>
);

interface Props {
  files: FileList | null;
  onSelectFile: (path: string) => void;
  activeFile: string;
}

export const FileExplorer = ({ files, onSelectFile, activeFile }: Props) => {
  const [openFolders, setOpenFolders] = useState({});

  const handleFolderClick = (path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (items, prefix = "") => {
    return Object.keys(items).map((name) => {
      const path = `${prefix}/${name}`;
      const item = items[name];
      if (item.type === "directory") {
        const isOpen = openFolders[path];
        return (
          <div key={path} style={{ paddingLeft: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "0.25rem",
                borderRadius: "0.25rem",
                backgroundColor: openFolders[path] ? "#f1f5f9" : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f5f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = openFolders[path]
                  ? "#f1f5f9"
                  : "transparent")
              }
              onClick={() => handleFolderClick(path)}
            >
              <ChevronDownIcon
                style={{
                  width: "1rem",
                  height: "1rem",
                  marginRight: "0.25rem",
                  transform: isOpen ? "rotate(0)" : "rotate(-90deg)",
                  transition: "transform 0.2s",
                }}
              />
              <FolderIcon
                style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }}
              />
              <span>{name}</span>
            </div>
            <div style={{ paddingLeft: "1rem" }}>
              {isOpen && item.children && renderTree(item.children, path)}
            </div>
          </div>
        );
      } else {
        const isActive = path === activeFile;
        return (
          <div
            key={path}
            style={{
              paddingLeft: "2rem",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "0.25rem",
              backgroundColor: isActive ? "#e0f2fe" : "transparent",
              color: isActive ? "#1e40af" : "#0f172a",
              fontWeight: isActive ? "500" : "400",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = isActive
                ? "#e0f2fe"
                : "#f1f5f9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = isActive
                ? "#e0f2fe"
                : "transparent")
            }
            onClick={() => onSelectFile(path)}
          >
            <FileTextIcon
              style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }}
            />
            <span>{name}</span>
          </div>
        );
      }
    });
  };

  const buildFileTree = (files) => {
    const tree = {};
    Object.keys(files).forEach((path) => {
      const parts = path.split("/").filter(Boolean);
      let currentLevel = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!currentLevel[part]) {
          currentLevel[part] = {
            type: i === parts.length - 1 ? "file" : "directory",
            children: i === parts.length - 1 ? undefined : {},
            content:
              typeof files[path] === "string"
                ? files[path]
                : files[path]?.code || "",
          };
        }
        currentLevel = currentLevel[part].children;
      }
    });
    return tree;
  };

  const fileTree = buildFileTree(files);

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: "#f8fafc",
        minWidth: "200px",
        maxWidth: "300px",
        overflowY: "auto",
        borderRight: "1px solid #e2e8f0",
        height: "100%",
      }}
    >
      {Object.keys(files || {}).length ? (
        renderTree(fileTree)
      ) : (
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Files not loaded
        </p>
      )}
    </div>
  );
};
