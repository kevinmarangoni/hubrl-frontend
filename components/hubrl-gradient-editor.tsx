"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColorPickerField } from "@/components/color-picker-field";
import {
  createDefaultHubrlPageGradient,
  hubrlPageGradientToCss,
  newGradientStopId,
  normalizeGradientAngleDeg,
  type HubrlGradientStop,
  type HubrlPageGradient,
} from "@/lib/hubrl-page-gradient";

type HubrlGradientEditorProps = {
  value: HubrlPageGradient;
  onChange: (next: HubrlPageGradient) => void;
  /** Prefixo para ids unicos quando existem varios editores (ex. pagina vs link). */
  fieldIdPrefix?: string;
};

const PRESETS: HubrlPageGradient[] = (
  [
    createDefaultHubrlPageGradient(),
    {
      kind: "linear" as const,
      angleDeg: 90,
      stops: [
        { id: "p2-a", color: "#0f766e", position: 0 },
        { id: "p2-b", color: "#14b8a6", position: 50 },
        { id: "p2-c", color: "#ccfbf1", position: 100 },
      ],
    },
    {
      kind: "radial" as const,
      angleDeg: 0,
      stops: [
        { id: "p3-a", color: "#fef08a", position: 0 },
        { id: "p3-b", color: "#f97316", position: 55 },
        { id: "p3-c", color: "#7f1d1d", position: 100 },
      ],
    },
  ] as const satisfies readonly HubrlPageGradient[]
).map((p) => ({
  ...p,
  stops: p.stops.map((s) => ({ ...s, id: newGradientStopId() })),
}));

function replaceStopIds(g: HubrlPageGradient): HubrlPageGradient {
  return {
    ...g,
    stops: g.stops.map((s) => ({ ...s, id: newGradientStopId() })),
  };
}

type GradientAngleDialProps = {
  angleDeg: number;
  onChange: (deg: number) => void;
  /** `compact` encaixa na linha ao lado do campo de graus. */
  size?: "default" | "compact";
};

function GradientAngleDial({ angleDeg, onChange, size = "default" }: GradientAngleDialProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const commitFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const el = wrapRef.current;
      if (!el) {
        return;
      }
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const rad = Math.atan2(dx, -dy);
      const deg = normalizeGradientAngleDeg((rad * 180) / Math.PI);
      onChange(deg);
    },
    [onChange],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }
      commitFromClient(e.clientX, e.clientY);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [commitFromClient]);

  const a = normalizeGradientAngleDeg(angleDeg);
  const rad = (a * Math.PI) / 180;
  const R = 26;
  const cx = 40;
  const cy = 40;
  const hx = cx + R * Math.sin(rad);
  const hy = cy - R * Math.cos(rad);

  return (
    <div
      ref={wrapRef}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(a)}
      aria-label="Direção do degradê linear; arraste em torno do círculo. Teclas setas ajustam 1 grau, com Shift 15 graus."
      className={`relative shrink-0 cursor-grab touch-none rounded-full border border-border/70 bg-surface/60 shadow-inner outline-none ring-offset-2 transition hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing ${
        size === "compact" ? "size-[3.25rem]" : "size-[4.75rem]"
      }`}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        draggingRef.current = true;
        commitFromClient(e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 15 : 1;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(normalizeGradientAngleDeg(a - step));
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(normalizeGradientAngleDeg(a + step));
        }
      }}
    >
      <svg viewBox="0 0 80 80" className="size-full select-none" aria-hidden>
        <circle cx={cx} cy={cy} r={31} fill="none" className="stroke-border/50" strokeWidth={1.5} />
        {[0, 90, 180, 270].map((deg) => {
          const br = (deg * Math.PI) / 180;
          const x1 = cx + 28 * Math.sin(br);
          const y1 = cy - 28 * Math.cos(br);
          const x2 = cx + 31 * Math.sin(br);
          const y2 = cy - 31 * Math.cos(br);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-fg-muted/35"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}
        <line
          x1={cx}
          y1={cy}
          x2={hx}
          y2={hy}
          className="stroke-accent"
          strokeWidth={2.75}
          strokeLinecap="round"
        />
        <circle cx={hx} cy={hy} r={6} className="fill-accent stroke-2 stroke-white shadow-sm" />
        <circle cx={cx} cy={cy} r={3} className="fill-fg-muted/25" />
      </svg>
    </div>
  );
}

export function HubrlGradientEditor({ value, onChange, fieldIdPrefix = "hubrl-gradient" }: HubrlGradientEditorProps) {
  const gid = fieldIdPrefix;
  const [selectedId, setSelectedId] = useState<string | null>(() => value.stops[0]?.id ?? null);

  useEffect(() => {
    if (!value.stops.some((s) => s.id === selectedId)) {
      setSelectedId(value.stops[0]?.id ?? null);
    }
  }, [value.stops, selectedId]);

  const previewCss = useMemo(() => hubrlPageGradientToCss(value), [value]);

  const updateStops = useCallback(
    (stops: HubrlGradientStop[]) => {
      onChange({ ...value, stops });
    },
    [onChange, value],
  );

  function setKind(kind: HubrlPageGradient["kind"]) {
    onChange({ ...value, kind });
  }

  function setAngle(angleDeg: number) {
    onChange({ ...value, angleDeg });
  }

  function updateStop(id: string, patch: Partial<HubrlGradientStop>) {
    updateStops(value.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeStop(id: string) {
    if (value.stops.length <= 2) {
      return;
    }
    const next = value.stops.filter((s) => s.id !== id);
    updateStops(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }
  }

  function addStop() {
    const sorted = [...value.stops].sort((a, b) => a.position - b.position);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const position =
      prev !== undefined && last !== undefined
        ? Math.min(99, Math.max(1, (prev.position + last.position) / 2))
        : 50;
    const color = last?.color ?? "#ffffff";
    const ns: HubrlGradientStop = { id: newGradientStopId(), color, position };
    updateStops([...value.stops, ns]);
    setSelectedId(ns.id);
  }

  return (
    <div className="grid gap-4">
      <div className="flex w-full flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-fg-muted">Tipo</span>
        <div className="flex rounded-lg border border-border/70 p-0.5">
          <button
            type="button"
            onClick={() => setKind("linear")}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              value.kind === "linear" ? "bg-accent text-white shadow-sm" : "text-fg-muted hover:text-fg"
            }`}
          >
            Linear
          </button>
          <button
            type="button"
            onClick={() => setKind("radial")}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              value.kind === "radial" ? "bg-accent text-white shadow-sm" : "text-fg-muted hover:text-fg"
            }`}
          >
            Radial
          </button>
        </div>
        {value.kind === "linear" ? (
          <div className="ml-auto flex items-center gap-2">
            <GradientAngleDial angleDeg={value.angleDeg} onChange={setAngle} size="compact" />
            <label htmlFor={`${gid}-angle-deg`} className="flex items-center gap-1.5 text-xs text-fg-muted">
              <span className="whitespace-nowrap">Ângulo (°)</span>
              <input
                id={`${gid}-angle-deg`}
                type="number"
                min={0}
                max={360}
                step={1}
                value={Math.round(normalizeGradientAngleDeg(value.angleDeg))}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v)) {
                    setAngle(normalizeGradientAngleDeg(v));
                  }
                }}
                className="input-field w-14 py-1 text-center text-xs tabular-nums"
              />
            </label>
          </div>
        ) : null}
      </div>

      <GradientStopTrack
        gradientCss={previewCss}
        stops={value.stops}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onPositionChange={(id, position) => updateStop(id, { position })}
      />

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-fg-muted">Paradas</p>
        <ul className="m-0 grid max-h-[200px] list-none gap-1.5 overflow-y-auto p-0">
          {[...value.stops]
            .sort((a, b) => a.position - b.position)
            .map((stop) => {
              const active = stop.id === selectedId;
              return (
                <li
                  key={stop.id}
                  className={`flex flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5 transition ${
                    active ? "border-accent bg-accent-muted/40" : "border-border/60 bg-surface/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(stop.id)}
                    className="size-7 shrink-0 rounded border border-border/80 shadow-sm"
                    style={{ backgroundColor: stop.color }}
                    title="Selecionar parada"
                    aria-label={`Parada ${stop.position}%`}
                  />
                  <div className="min-w-0 flex-1">
                    <ColorPickerField
                      id={`${gid}-color-${stop.id}`}
                      value={stop.color}
                      onChange={(c) => updateStop(stop.id, { color: c })}
                    />
                  </div>
                  <label className="flex shrink-0 items-center gap-1 text-xs text-fg-muted">
                    %
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={stop.position}
                      onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                      className="input-field w-14 py-1 text-xs"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeStop(stop.id)}
                    disabled={value.stops.length <= 2}
                    className="btn-secondary shrink-0 px-2 py-1 text-xs disabled:opacity-40"
                    aria-label="Remover parada"
                  >
                    ×
                  </button>
                </li>
              );
            })}
        </ul>
        <button type="button" onClick={addStop} className="btn-secondary mt-2 w-full py-1.5 text-xs">
          Adicionar Cor
        </button>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-fg-muted">Predefinições</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const next = replaceStopIds(preset);
                onChange(next);
                setSelectedId(next.stops[0]?.id ?? null);
              }}
              className="size-9 rounded-full border-2 border-border/70 shadow-sm ring-offset-2 transition hover:ring-2 hover:ring-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ backgroundImage: hubrlPageGradientToCss(preset) }}
              aria-label={`Predefinição ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type TrackProps = {
  gradientCss: string;
  stops: HubrlGradientStop[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, position: number) => void;
};

function GradientStopTrack({ gradientCss, stops, selectedId, onSelect, onPositionChange }: TrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const setFromClientX = useCallback(
    (clientX: number, id: string) => {
      const el = trackRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const raw = ((clientX - rect.left) / rect.width) * 100;
      const pct = Math.min(100, Math.max(0, raw));
      onPositionChange(id, pct);
    },
    [onPositionChange],
  );

  useEffect(() => {
    if (!dragId) {
      return;
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      if (x === undefined) {
        return;
      }
      setFromClientX(x, dragId);
    };
    const onUp = () => setDragId(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragId, setFromClientX]);

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fg-muted">Preview e posição</p>
      <div
        ref={trackRef}
        className="relative h-9 w-full overflow-visible rounded-lg border border-border/70 shadow-inner"
        style={{ backgroundImage: gradientCss }}
        onMouseDown={(e) => {
          if (e.target !== trackRef.current) {
            return;
          }
          const rect = trackRef.current?.getBoundingClientRect();
          if (!rect) {
            return;
          }
          const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
          const nearest = stops.reduce((best, s) => {
            const d = Math.abs(s.position - pct);
            const bd = Math.abs(best.position - pct);
            return d < bd ? s : best;
          }, stops[0]);
          if (nearest) {
            onSelect(nearest.id);
            setDragId(nearest.id);
            setFromClientX(e.clientX, nearest.id);
          }
        }}
      >
        {stops.map((s) => {
          const selected = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              className={`absolute top-1/2 z-[1] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md outline-none ring-2 ring-black/20 transition ${
                selected ? "scale-110 ring-accent" : "hover:scale-110"
              }`}
              style={{ left: `${s.position}%`, backgroundColor: s.color }}
              aria-label={`Parada ${Math.round(s.position)}%`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(s.id);
                setDragId(s.id);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                onSelect(s.id);
                setDragId(s.id);
                const x = e.touches[0]?.clientX;
                if (x !== undefined) {
                  setFromClientX(x, s.id);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
