import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value, onChange, min = 1, max, disabled = false, label = 'Quantity' }) {
  const clamp = (n) => Math.max(min, max != null ? Math.min(max, n) : n);
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
      />
      <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={disabled || (max != null && value >= max)} aria-label="Increase quantity">
        <Plus size={16} />
      </button>
    </div>
  );
}
