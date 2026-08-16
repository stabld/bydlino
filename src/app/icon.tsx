import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#111113",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span style={{ color: "#FAFAF8", fontSize: 20, fontWeight: 700 }}>R</span>
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#FF4D6D",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
