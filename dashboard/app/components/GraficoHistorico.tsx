"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Leitura } from "../lib/api";

interface GraficoHistoricoProps {
  dados: Leitura[];
  tipo: "temperatura" | "umidade";
}

const config = {
  temperatura: {
    cor: "var(--signal)",
    label: "Temperatura (°C)",
    sufixo: "°C",
  },
  umidade: {
    cor: "#3a6b8a",
    label: "Umidade (%)",
    sufixo: "%",
  },
};

const MAX_PONTOS = 300;

function formatarHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = arr.length / max;
  return Array.from({ length: max }, (_, i) => arr[Math.round(i * step)]);
}

export function GraficoHistorico({ dados, tipo }: GraficoHistoricoProps) {
  const { cor, label, sufixo } = config[tipo];

  const amostras = downsample(dados, MAX_PONTOS);
  const dadosFormatados = amostras.map((d) => ({
    hora: formatarHora(d.timestamp),
    valor: d[tipo],
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dadosFormatados} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="hora"
            tick={{ fontSize: 10, fill: "var(--wire)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            minTickGap={40}
          />
          <YAxis
            tick={{ fontSize: 10, fill: cor, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={38}
          />
          <Tooltip
            formatter={(v) => [`${v}${sufixo}`, label]}
            contentStyle={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 4,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
          />
          <Line
            type="monotone"
            dataKey="valor"
            stroke={cor}
            strokeWidth={2}
            dot={false}
            name={label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
