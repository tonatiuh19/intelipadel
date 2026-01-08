// Build a Stripe appearance object at runtime by reading CSS variables
function hslFromVar(
  root: CSSStyleDeclaration | null,
  name: string,
  fallback = "",
) {
  if (!root) return fallback;
  const val = root.getPropertyValue(name).trim();
  if (!val) return fallback;
  // If value already contains 'hsl(' or '#' return as-is (trimmed)
  if (val.startsWith("#") || val.startsWith("hsl") || val.startsWith("rgb"))
    return val;
  // Otherwise assume it's an HSL triplet like "220 13% 18%" and wrap it
  return `hsl(${val})`;
}

export default function getStripeAppearance() {
  const root =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement)
      : null;

  const colorBackground = hslFromVar(root, "--card", "#000000ff");
  const colorText = hslFromVar(root, "--card-foreground", "#000000");
  const colorPrimary = hslFromVar(root, "--club-primary", "#0570de");
  const colorDanger = hslFromVar(root, "--destructive", "#bf0a0a");
  const colorMuted = hslFromVar(root, "--muted-foreground", "#94a3b8");
  const inputBg = hslFromVar(root, "--input", "#ffffff");
  const borderColor = hslFromVar(root, "--border", "#e6e6e6");

  function withAlpha(color: string, alpha: number) {
    if (!color) return color;
    const a = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0");
    if (color.startsWith("#")) {
      // Append alpha as hex (e.g. #RRGGBBAA)
      return `${color}${a}`;
    }
    if (color.startsWith("hsl(")) {
      return color.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
    }
    if (color.startsWith("rgb(")) {
      return color.replace(/^rgb\(/, "rgba(").replace(/\)$/, `, ${alpha})`);
    }
    return color;
  }

  return {
    theme: "stripe",
    variables: {
      colorBackground,
      colorText,
      colorPrimary,
      colorDanger,
      colorMuted,
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      spacingUnit: "6px",
      borderRadius: "8px",
    },
    rules: {
      ".Input": {
        background: inputBg,
        color: colorText,
        border: `1px solid ${borderColor}`,
        boxShadow: "none",
        borderRadius: "8px",
        padding: "10px 12px",
      },
      ".Input:focus": {
        boxShadow: `0 0 0 3px ${withAlpha(colorPrimary, 0.12)}`,
        border: `1px solid ${colorPrimary}`,
      },
      ".Input--invalid": {
        borderColor: colorDanger,
      },
      ".Tab": {
        borderRadius: "8px",
      },
      ".Tab--selected": {
        background: withAlpha(colorPrimary, 0.08),
        color: colorPrimary,
      },
      ".Brand": {
        color: colorPrimary,
      },
      ".Wallet": {
        borderRadius: "8px",
      },
      ".Error": {
        color: colorDanger,
      },
    },
  } as const;
}
