import type { HubrlLogoProps } from "./types";

/** Marca gráfica hubrl (rede de nós); usa `currentColor` para herdar a cor do texto do pai. */
export function HubrlLogo({ className, "aria-hidden": ariaHidden = true, ...rest }: HubrlLogoProps) {
  return (
    <svg
      viewBox="-60 -70 130 140"
      className={className}
      aria-hidden={ariaHidden}
      {...rest}
    >
      <g>
        <circle cx="0" cy="-52" r="13" fill="currentColor" opacity={1} />
        <circle cx="45" cy="0" r="18" fill="currentColor" opacity={1} />
        <circle cx="-45" cy="0" r="10" fill="currentColor" opacity={0.55} />
        <circle cx="0" cy="52" r="11" fill="currentColor" opacity={0.75} />
        <circle cx="42" cy="-42" r="7" fill="currentColor" opacity={0.4} />

        <line x1="0" y1="-39" x2="38" y2="-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        <line x1="-35" y1="0" x2="27" y2="0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
        <line x1="0" y1="39" x2="38" y2="8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        <line x1="0" y1="-39" x2="-35" y2="-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.35} />
        <line x1="0" y1="39" x2="-33" y2="6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.35} />
        <line x1="7" y1="-48" x2="37" y2="-42" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
        <line x1="41" y1="-35" x2="44" y2="-18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
      </g>
    </svg>
  );
}
