import { ImageResponse } from "next/og";
import { siteConfig } from "@/constants/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0b0f17 0%, #111827 50%, #451a03 100%)",
        color: "#ffffff",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          FS
        </div>
        <span
          style={{
            fontSize: "36px",
            fontWeight: "800",
            letterSpacing: "-0.02em",
            color: "#ffffff",
          }}
        >
          {siteConfig.name}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "1000px",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "800",
            lineHeight: "1.15",
            letterSpacing: "-0.02em",
            margin: 0,
            color: "#ffffff",
          }}
        >
          {siteConfig.tagline}
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#9ca3af",
            lineHeight: "1.4",
            margin: 0,
          }}
        >
          On-demand certified technicians scheduled, dispatched, and paid
          online.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          fontSize: "18px",
          color: "#d97706",
          fontWeight: "600",
        }}
      >
        <span>AC Repair</span>
        <span style={{ color: "#4b5563" }}>•</span>
        <span>Plumbing</span>
        <span style={{ color: "#4b5563" }}>•</span>
        <span>Electrical Work</span>
        <span style={{ color: "#4b5563" }}>•</span>
        <span>Appliance Repair</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
