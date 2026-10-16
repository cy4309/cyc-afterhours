"use client";

import { useEffect, useState } from "react";
import { createStoryTweak, type StoryTweak } from "./storyConfig";
import type { StoryRuntime } from "./storyRuntime";

type SliderDef = {
  key: keyof StoryTweak;
  label: string;
  min: number;
  max: number;
  step: number;
};

const LIGHT_SLIDERS: SliderDef[] = [
  { key: "key", label: "Key", min: 0, max: 3, step: 0.05 },
  { key: "rim", label: "Rim", min: 0, max: 3, step: 0.05 },
  { key: "fill", label: "Fill", min: 0, max: 3, step: 0.05 },
  { key: "ambient", label: "Ambient", min: 0, max: 3, step: 0.05 },
  { key: "hero", label: "Hold", min: 0, max: 3, step: 0.05 },
  { key: "fog", label: "Fog", min: 0, max: 3, step: 0.05 },
];

const POSITION_SLIDERS: SliderDef[] = [
  { key: "camX", label: "Cam X", min: -4, max: 4, step: 0.05 },
  { key: "camY", label: "Cam Y", min: -4, max: 4, step: 0.05 },
  { key: "camZ", label: "Cam Z", min: -6, max: 6, step: 0.05 },
  { key: "lookX", label: "Look X", min: -3, max: 3, step: 0.05 },
  { key: "lookY", label: "Look Y", min: -3, max: 3, step: 0.05 },
  { key: "lookZ", label: "Look Z", min: -3, max: 3, step: 0.05 },
  { key: "keyX", label: "Key X", min: -4, max: 4, step: 0.05 },
  { key: "keyY", label: "Key Y", min: -4, max: 4, step: 0.05 },
  { key: "keyZ", label: "Key Z", min: -4, max: 4, step: 0.05 },
];

function formatValue(value: number) {
  return value.toFixed(2);
}

type StoryTunePanelProps = {
  runtime: StoryRuntime;
  mobile?: boolean;
};

export function StoryTunePanel({ runtime, mobile = false }: StoryTunePanelProps) {
  const [open, setOpen] = useState(!mobile);
  const [draft, setDraft] = useState<StoryTweak>(() => ({ ...runtime.tweak }));

  useEffect(() => {
    if (mobile) setOpen(false);
  }, [mobile]);

  const setField = (key: keyof StoryTweak, value: number) => {
    runtime.tweak[key] = value;
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    const next = createStoryTweak();
    Object.assign(runtime.tweak, next);
    setDraft(next);
  };

  return (
    <aside
      className="pointer-events-auto absolute bottom-4 right-3 z-20 flex w-[min(15.5rem,calc(100vw-1.5rem))] flex-col-reverse text-paper sm:bottom-5 sm:right-5"
      onWheel={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3">
        {open ? (
          <button
            type="button"
            className="text-caption uppercase tracking-caption text-paper/40"
            onClick={reset}
          >
            Reset
          </button>
        ) : null}
        <button
          type="button"
          className="ml-auto text-caption uppercase tracking-caption text-paper/55"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Tune —" : "Tune +"}
        </button>
      </div>

      {open ? (
        <div className="mb-3 max-h-[calc(100dvh-7rem)] overflow-y-auto border border-paper/10 bg-ink/75 px-3 py-3 backdrop-blur-sm">
          <p className="text-caption uppercase tracking-caption text-paper/40">Light</p>
          <div className="mt-2 flex flex-col gap-2">
            {LIGHT_SLIDERS.map((slider) => (
              <TuneSlider
                key={slider.key}
                slider={slider}
                value={draft[slider.key]}
                onChange={setField}
              />
            ))}
          </div>
          <p className="mt-4 text-caption uppercase tracking-caption text-paper/40">Position</p>
          <div className="mt-2 flex flex-col gap-2">
            {POSITION_SLIDERS.map((slider) => (
              <TuneSlider
                key={slider.key}
                slider={slider}
                value={draft[slider.key]}
                onChange={setField}
              />
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function TuneSlider({
  slider,
  value,
  onChange,
}: {
  slider: SliderDef;
  value: number;
  onChange: (key: keyof StoryTweak, value: number) => void;
}) {
  return (
    <label className="grid grid-cols-[3.4rem_1fr_2.1rem] items-center gap-2">
      <span className="text-caption uppercase tracking-caption text-paper/50">{slider.label}</span>
      <input
        type="range"
        min={slider.min}
        max={slider.max}
        step={slider.step}
        value={value}
        aria-label={slider.label}
        className="h-1 w-full cursor-pointer appearance-none bg-paper/20 accent-paper [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-paper"
        onChange={(event) => onChange(slider.key, Number(event.target.value))}
      />
      <span className="text-right text-caption tabular-nums text-paper/45">{formatValue(value)}</span>
    </label>
  );
}
