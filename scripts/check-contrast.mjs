/**
 * WCAG 2.1 Contrast Ratio Verification Script
 *
 * Implements the relative luminance formula defined in WCAG 2.1:
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 * Contrast ratio: (L1 + 0.05) / (L2 + 0.05)
 */

function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    return {
      r: Number.parseInt(cleanHex[0] + cleanHex[0], 16),
      g: Number.parseInt(cleanHex[1] + cleanHex[1], 16),
      b: Number.parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  return {
    r: Number.parseInt(cleanHex.substring(0, 2), 16),
    g: Number.parseInt(cleanHex.substring(2, 4), 16),
    b: Number.parseInt(cleanHex.substring(4, 6), 16),
  };
}

function sRgbToLinear(c) {
  const normalized = c / 255;
  if (normalized <= 0.04045) {
    return normalized / 12.92;
  }
  return ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = sRgbToLinear(r);
  const G = sRgbToLinear(g);
  const B = sRgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const CONTRAST_TEST_PAIRS = [
  {
    label: "Body text on white page",
    fg: "#0F172A",
    bg: "#FFFFFF",
    min: 4.5,
  },
  {
    label: "Secondary text on white page",
    fg: "#334155",
    bg: "#FFFFFF",
    min: 4.5,
  },
  {
    label: "Muted text on white page",
    fg: "#475569",
    bg: "#FFFFFF",
    min: 4.5,
  },
  {
    label: "Muted text on slate-50 panel",
    fg: "#475569",
    bg: "#F8FAFC",
    min: 4.5,
  },
  {
    label: "Link / eyebrow terracotta on white",
    fg: "#C2410C",
    bg: "#FFFFFF",
    min: 4.5,
  },
  {
    label: "White header text on charcoal",
    fg: "#FFFFFF",
    bg: "#111827",
    min: 4.5,
  },
  {
    label: "Body text (#E2E8F0) on charcoal",
    fg: "#E2E8F0",
    bg: "#111827",
    min: 4.5,
  },
  {
    label: "Secondary text (#CBD5E1) on charcoal",
    fg: "#CBD5E1",
    bg: "#111827",
    min: 4.5,
  },
  {
    label: "Amber nav active link (#FBBF24) on charcoal",
    fg: "#FBBF24",
    bg: "#111827",
    min: 4.5,
  },
  {
    label: "CTA button: white on brand-700 stop",
    fg: "#FFFFFF",
    bg: "#C2410C",
    min: 4.5,
  },
  {
    label: "CTA button: white on brand-800 stop",
    fg: "#FFFFFF",
    bg: "#9A3412",
    min: 4.5,
  },
  {
    label: "Amber badge: #9A3412 on #FEF3C7",
    fg: "#9A3412",
    bg: "#FEF3C7",
    min: 4.5,
  },
  {
    label: "Charcoal badge: #F1F5F9 on #1E293B",
    fg: "#F1F5F9",
    bg: "#1E293B",
    min: 4.5,
  },
  {
    label: "Green badge: #14532D on #DCFCE7",
    fg: "#14532D",
    bg: "#DCFCE7",
    min: 4.5,
  },
  {
    label: "Footer links: #E2E8F0 on charcoal",
    fg: "#E2E8F0",
    bg: "#111827",
    min: 4.5,
  },
  {
    label: "Placeholder text: #64748B on white",
    fg: "#64748B",
    bg: "#FFFFFF",
    min: 4.5,
  },
];

function runContrastAudit() {
  console.log(
    "================================================================================",
  );
  console.log(
    "                       DESIGN TOKEN WCAG CONTRAST AUDIT                         ",
  );
  console.log(
    "================================================================================",
  );
  console.log(
    "| " +
      "Label".padEnd(42) +
      " | " +
      "FG".padEnd(9) +
      " | " +
      "BG".padEnd(9) +
      " | " +
      "Ratio".padEnd(8) +
      " | " +
      "Min".padEnd(5) +
      " | " +
      "Result".padEnd(6) +
      " |",
  );
  console.log(
    "|--------------------------------------------|-----------|-----------|----------|-------|--------|",
  );

  let failedCount = 0;

  for (const pair of CONTRAST_TEST_PAIRS) {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const passed = ratio >= pair.min;
    if (!passed) failedCount++;

    const formattedRatio = `${ratio.toFixed(2)}:1`;
    const formattedMin = `${pair.min.toFixed(1)}:1`;
    const status = passed ? "✅ PASS" : "❌ FAIL";

    console.log(
      `| ${pair.label.padEnd(42)} | ${pair.fg.padEnd(9)} | ${pair.bg.padEnd(9)} | ${formattedRatio.padEnd(8)} | ${formattedMin.padEnd(5)} | ${status.padEnd(6)} |`,
    );
  }

  console.log(
    "================================================================================",
  );
  console.log(
    `Audit Summary: ${CONTRAST_TEST_PAIRS.length} pairs evaluated. ${failedCount} failures.`,
  );

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runContrastAudit();
