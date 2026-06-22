"use client";

interface ControleSwitchProps {
  label: string;
  descricao: string;
  ativo: boolean;
  carregando?: boolean;
  onToggle: () => void;
}

export function ControleSwitch({ label, descricao, ativo, carregando, onToggle }: ControleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <div className="font-mono text-[13px] tracking-wide uppercase text-ink">{label}</div>
        <div className="font-mono text-[11px] text-wire mt-1">{descricao}</div>
      </div>
      <button
        onClick={onToggle}
        disabled={carregando}
        className="relative w-14 h-8 rounded-full shrink-0 transition-colors disabled:opacity-50"
        style={{ backgroundColor: ativo ? "var(--ok)" : "var(--line)" }}
        aria-pressed={ativo}
        aria-label={label}
      >
        <span
          className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[var(--paper)] shadow transition-transform"
          style={{ transform: ativo ? "translateX(24px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}
