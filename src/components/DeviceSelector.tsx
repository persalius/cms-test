import { DEVICES } from "../shared/constants/device";
import type { Device } from "../shared/types/device";

interface Props {
  device: Device;
  setDevice: (devivce: Device) => void;
}

export const DeviceSelector = ({ device, setDevice }: Props) => {
  return (
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
  );
};
