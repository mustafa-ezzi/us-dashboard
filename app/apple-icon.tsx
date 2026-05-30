import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  try {
    // Try to read the logo from public folder
    const logoPath = join(process.cwd(), "public/logo.png");
    const logoData = readFileSync(logoPath);
    const base64Logo = logoData.toString("base64");

    return new ImageResponse(
      (
        <img
          src={`data:image/png;base64,${base64Logo}`}
          width="180"
          height="180"
          style={{ width: "100%", height: "100%", borderRadius: 40 }}
        />
      ),
      { ...size }
    );
  } catch {
    // Fallback to gradient with U if logo not found
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
            borderRadius: 40,
            color: "white",
            fontSize: 100,
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
}
