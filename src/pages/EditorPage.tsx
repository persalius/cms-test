import { useRef, useState } from "react";
import { useGetInitialFiles } from "../shared/hooks/useGetInitialFiles";
import { Editor } from "../components/Editor/Editor";
import { Preview } from "../components/Preview";
import type { Device } from "../shared/types/device";
import { DeviceSelector } from "../components/DeviceSelector";
import { FileExplorer } from "../components/FileExplorer";
import type { FileList } from "../shared/types/file";
import { Preview2 } from "../components/Preview2";

export default function EditorPage() {
  const previewRef = useRef<HTMLIFrameElement | null>(null);
  const { initialFiles, initialFile } = useGetInitialFiles();

  const [device, setDevice] = useState<Device>("desktop");

  const [files, setFiles] = useState<FileList>(initialFiles);
  const [activeFile, setActiveFile] = useState(initialFile);
  const [activeHtml, setActiveHtml] = useState(initialFile);

  const handleSelectFile = (path: string) => {
    setActiveFile(path);
    if (path.endsWith(".html")) {
      setActiveHtml(path);
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <h1 style={{ padding: "12px 24px" }}>Editor</h1>

      <DeviceSelector device={device} setDevice={setDevice} />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          height: "500px",
          boxSizing: "border-box",
        }}
      >
        <FileExplorer
          files={files}
          onSelectFile={handleSelectFile}
          activeFile={activeFile}
        />
        <Editor
          previewRef={previewRef}
          files={files}
          setFiles={setFiles}
          activeFile={activeFile}
          activeHtml={activeHtml}
        />
        <Preview previewRef={previewRef} device={device} />
        {/* <Preview2 files={files} activeHtml={activeHtml} device={device} /> */}
      </div>

      {/* <MySandpack>
        <MonacoEditor />
      </MySandpack> */}
    </div>
  );
}
