import type { RefObject } from "react";
import { DEVICES } from "../shared/constants/device";
import type { Device } from "../shared/types/device";

interface Props {
  device: Device;
  previewRef: RefObject<HTMLIFrameElement | null>;
}

export const Preview = ({ device, previewRef }: Props) => {
  return (
    <div
      style={{
        width: "50%",
        padding: 12,
        display: "flex",
        justifyContent: "center",
        background: "rgb(248, 250, 252)",
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
          ref={previewRef}
          style={{
            width: "100%",
            height: "600px",
            border: "none",
          }}
        />
      </div>
    </div>
  );
};
