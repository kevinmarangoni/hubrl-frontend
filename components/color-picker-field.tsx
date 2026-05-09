"use client";

import * as Popover from "@radix-ui/react-popover";
import { ColorResult, SketchPicker } from "react-color";

type ColorPickerFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

export function ColorPickerField({ id, value, onChange }: ColorPickerFieldProps) {
  const normalizedValue = /^#([A-Fa-f0-9]{3}){1,2}$/.test(value) ? value : "#000000";

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="grid gap-1.5 text-sm font-medium text-fg">
        <Popover.Root modal={false}>
          <Popover.Trigger asChild>
            <input
              id={id}
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="#111827"
              className="input-field cursor-pointer"
            />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              sideOffset={8}
              align="start"
              className="z-[200] rounded-xl border border-border/80 bg-surface-elevated/95 p-2 shadow-glass backdrop-blur-xl"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <SketchPicker
                color={normalizedValue}
                disableAlpha
                onChange={(color: ColorResult) => onChange(color.hex)}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </label>
    </div>
  );
}
