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
}

function formatarHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function GraficoHistorico({ dados }: GraficoHistoricoProps) {
  const dadosFormatados = dados.map((d) => ({
    hora: formatarHora(d.timestamp),
    temperatura: d.temperatura,
    umidade: d.umidade,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dadosFormatados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="hora"
            tick={{ fontSize: 10, fill: "var(--wire)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            minTickGap={40}
          />
          <YAxis
            yAxisId="temp"
            tick={{ fontSize: 10, fill: "var(--signal)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <YAxis
            yAxisId="umid"
            orientation="right"
            tick={{ fontSize: 10, fill: "#3a6b8a", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 4,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperatura"
            stroke="var(--signal)"
            strokeWidth={2}
            dot={false}
            name="Temperatura (°C)"
          />
          <Line
            yAxisId="umid"
            type="monotone"
            dataKey="umidade"
            stroke="#3a6b8a"
            strokeWidth={2}
            dot={false}
            name="Umidade (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
