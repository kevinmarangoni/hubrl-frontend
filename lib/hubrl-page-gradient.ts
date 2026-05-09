export type HubrlGradientKind = "linear" | "radial";

export type HubrlGradientStop = {
  id: string;
  color: string;
  position: number;
};

export type HubrlPageGradient = {
  kind: HubrlGradientKind;
  angleDeg: number;
  stops: HubrlGradientStop[];
};

export function newGradientStopId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `g${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultHubrlPageGradient(): HubrlPageGradient {
  return {
    kind: "linear",
    angleDeg: 165,
    stops: [
      { id: newGradientStopId(), color: "#4c1d95", position: 0 },
      { id: newGradientStopId(), color: "#6d28d9", position: 45 },
      { id: newGradientStopId(), color: "#c084fc", position: 100 },
    ],
  };
}

function expandShortHex(hex: string): string {
  const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
  if (!m) {
    return hex;
  }
  return `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`.toLowerCase();
}

export function normalizeGradientHex(c: string): string {
  const t = c.trim();
  if (/^#([0-9a-f]{3})$/i.test(t)) {
    return expandShortHex(t);
  }
  if (/^#([0-9a-f]{6})$/i.test(t)) {
    return t.toLowerCase();
  }
  return "#000000";
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.min(100, Math.max(0, n));
}

export function normalizeGradientAngleDeg(deg: number): number {
  if (!Number.isFinite(deg)) {
    return 0;
  }
  const a = deg % 360;
  return a < 0 ? a + 360 : a;
}

/** Gera valor CSS para `background-image` (linear ou radial). */
export function hubrlPageGradientToCss(g: HubrlPageGradient): string {
  const sorted = [...g.stops].sort((a, b) => a.position - b.position);
  const parts = sorted.map((s) => `${normalizeGradientHex(s.color)} ${clampPct(s.position)}%`);
  const angle = normalizeGradientAngleDeg(g.angleDeg);
  if (g.kind === "linear") {
    return `linear-gradient(${angle}deg, ${parts.join(", ")})`;
  }
  return `radial-gradient(circle, ${parts.join(", ")})`;
}

export function clampHubrlPageGradientStops(g: HubrlPageGradient): HubrlPageGradient {
  return {
    ...g,
    stops: g.stops.map((s) => ({
      ...s,
      position: clampPct(s.position),
    })),
  };
}
