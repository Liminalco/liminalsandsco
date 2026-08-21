import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export interface NumFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  /** Hide the slider and render only the numeric input. */
  compact?: boolean;
  className?: string;
}

/**
 * Labelled numeric control: a slider paired with a precise number input.
 * Used across the Design Studio text + transform panels.
 */
export function NumField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  compact = false,
  className,
}: NumFieldProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const safe = Number.isFinite(value) ? clamp(value) : min;

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            aria-label={label}
            className="h-7 w-20 px-2 text-right font-mono text-xs"
            min={min}
            max={max}
            step={step}
            value={safe}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
          />
          {suffix && (
            <span className="font-mono text-[10px] text-muted-foreground">{suffix}</span>
          )}
        </div>
      </div>
      {!compact && (
        <Slider
          min={min}
          max={max}
          step={step}
          value={[safe]}
          onValueChange={([v]) => onChange(clamp(v))}
          aria-label={`${label} slider`}
        />
      )}
    </div>
  );
}

export default NumField;
