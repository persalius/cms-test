import { DEVICES } from "../../shared/constants/device";
import type { Device } from "../../shared/types/device";
import { Button } from "./ui/button";
import type { Dispatch, SetStateAction } from "react";

interface Props {
  device: Device;
  setDevice: (devivce: Device) => void;
  setIsFullView: Dispatch<SetStateAction<boolean>>;
}

export const DeviceSelector = ({ device, setDevice, setIsFullView }: Props) => {
  return (
    <div style={{ display: "flex", gap: 8, padding: "8px 0" }}>
      {(["desktop", "tablet", "mobile"] as const).map((value) => (
        <Button
          key={value}
          onClick={() => setDevice(value)}
          className="cursor-pointer"
          variant={device === value ? "default" : "outline"}
        >
          {DEVICES[value].label}
        </Button>
      ))}

      <Button
        className="cursor-pointer"
        onClick={() => setIsFullView((prev) => !prev)}
        variant="secondary"
      >
        Toggle full view
      </Button>
    </div>
  );
};
