import { ImageResponse } from "next/og";

export const alt = "PromptVault - Your personal AI prompt library";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#07070b",
          // Beautiful glowing background gradients
          backgroundImage: "radial-gradient(circle at 25% 25%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #d946ef 0%, transparent 50%)",
          fontWeight: 700,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          <svg width="100" height="100" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#8b5cf6" />
                <stop offset="100%" stop-color="#d946ef" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#grad)" />
            <path d="M32 14 C 32 24, 24 32, 14 32 C 24 32, 32 40, 32 50 C 32 40, 40 32, 50 32 C 40 32, 32 24, 32 14 Z" fill="white" />
          </svg>
          <span style={{ fontSize: 72, letterSpacing: "-0.05em" }}>PromptVault</span>
        </div>
        <div style={{ fontSize: 40, color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>
          Your personal AI prompt library
        </div>
      </div>
    ),
    { ...size }
  );
}