import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E91E8C 0%, #C8167A 100%)",
          borderRadius: 96,
          color: "white",
          fontSize: 280,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        U
      </div>
    ),
    { ...size }
  );
}
