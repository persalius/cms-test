import { twMerge } from "tailwind-merge";
import { useInitializeFrame } from "./hooks/useInitializeFrame";
import { DEVICES } from "../../../shared/constants/device";
import { useGetSandpackFiles } from "./hooks/useGetSandpackFiles";

interface Props {
  isFullView: boolean;
  device: keyof typeof DEVICES;
}

export const Preview = ({ isFullView, device }: Props) => {
  const { sandpackFiles } = useGetSandpackFiles();
  const { iframeRef } = useInitializeFrame({ sandpackFiles });

  return (
    <div
      className={twMerge(
        isFullView ? "w-full" : "w-1/2",
        "h-full p-3 flex justify-center bg-zinc-100"
      )}
    >
      <div
        className="border border-gray-300 overflow-hidden bg-white"
        style={{
          width: DEVICES[device].width,
          padding: DEVICES[device].px,
        }}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          title="HTML Preview"
          sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};
