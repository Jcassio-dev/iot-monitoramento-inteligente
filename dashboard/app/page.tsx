"use client";

import { useEffect, useState, useCallback } from "react";
import { Leitura, buscarHistorico, controlarLed, controlarPorta } from "./lib/api";
import { GraficoHistorico } from "./components/GraficoHistorico";
import { PortaIlustracao } from "./components/PortaIlustracao";
import { ControleSwitch } from "./components/ControleSwitch";

export default function Home() {
  const [dados, setDados] = useState<Leitura[]>([]);
  const [conectado, setConectado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [ledAtivo, setLedAtivo] = useState(false);
  const [portaAberta, setPortaAberta] = useState(false);
  const [carregandoLed, setCarregandoLed] = useState(false);
  const [carregandoPorta, setCarregandoPorta] = useState(false);

  const atualizar = useCallback(async () => {
    try {
      const historico = await buscarHistorico();
      setDados(historico);
      setConectado(true);
      setErro(null);

      if (historico.length > 0) {
        const ultima = historico[historico.length - 1];
        setPortaAberta(ultima.presenca === 1);
      }
    } catch {
      setConectado(false);
      setErro("Não foi possível conectar à API. Verifique se o IP está correto e a API está rodando.");
    }
  }, []);

  useEffect(() => {
    atualizar();
    const interval = setInterval(atualizar, 5000);
    return () => clearInterval(interval);
  }, [atualizar]);

  const ultima = dados[dados.length - 1];

  async function handleToggleLed() {
    setCarregandoLed(true);
    try {
      await controlarLed(!ledAtivo);
      setLedAtivo(!ledAtivo);
    } catch {
      setErro("Falha ao controlar o LED.");
    } finally {
      setCarregandoLed(false);
    }
  }

  async function handleTogglePorta() {
    setCarregandoPorta(true);
    try {
      await controlarPorta(!portaAberta);
      setPortaAberta(!portaAberta);
    } catch {
      setErro("Falha ao controlar a porta.");
    } finally {
      setCarregandoPorta(false);
    }
  }

  return (
    <main className="flex-1 px-5 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto">
        {/* Eyebrow / status de conexão */}
        <div className="flex items-center gap-2 mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-wire">
          <span
            className={`w-1.5 h-1.5 rounded-full ${conectado ? "dot-live" : ""}`}
            style={{ backgroundColor: conectado ? "var(--ok)" : "var(--wire)" }}
          />
          <span>{conectado ? "conectado" : "conectando"}</span>
        </div>

        {/* Título */}
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(32px,6vw,48px)] leading-[1.05] font-semibold mb-2">
          central do <em className="italic font-light text-signal">ambiente</em>
        </h1>
        <p className="font-mono text-[13px] text-wire mb-10 max-w-[46ch]">
          Historico de temperatura e umidade, e controle remoto da porta e do indicador via MQTT.
        </p>

        {erro && (
          <div className="mb-6 px-4 py-3 rounded border font-mono text-[12px]" style={{ borderColor: "var(--signal)", color: "var(--signal)", backgroundColor: "var(--signal-soft, #c4541f1a)" }}>
            {erro}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded border p-4" style={{ borderColor: "var(--line)", backgroundColor: "rgba(255,255,255,0.4)" }}>
            <div className="font-mono text-[10px] uppercase tracking-wide text-wire mb-2">temperatura</div>
            <div className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-signal">
              {ultima ? `${ultima.temperatura.toFixed(1)}°` : "—"}
            </div>
          </div>
          <div className="rounded border p-4" style={{ borderColor: "var(--line)", backgroundColor: "rgba(255,255,255,0.4)" }}>
            <div className="font-mono text-[10px] uppercase tracking-wide text-wire mb-2">umidade</div>
            <div className="font-[family-name:var(--font-display)] text-[28px] font-semibold" style={{ color: "#3a6b8a" }}>
              {ultima ? `${ultima.umidade.toFixed(0)}%` : "—"}
            </div>
          </div>
          <div className="rounded border p-4" style={{ borderColor: "var(--line)", backgroundColor: "rgba(255,255,255,0.4)" }}>
            <div className="font-mono text-[10px] uppercase tracking-wide text-wire mb-2">presença</div>
            <div
              className="font-[family-name:var(--font-display)] text-[20px] font-semibold mt-2"
              style={{ color: ultima?.presenca ? "var(--ok)" : "var(--wire)" }}
            >
              {ultima ? (ultima.presenca ? "detectada" : "ausente") : "—"}
            </div>
          </div>
        </div>

        {/* Graficos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <section className="rounded border p-5" style={{ borderColor: "var(--line)", backgroundColor: "rgba(255,255,255,0.5)" }}>
            <h2 className="font-[family-name:var(--font-display)] text-[15px] font-medium mb-4">
              Temperatura
            </h2>
            {dados.length > 0 ? (
              <GraficoHistorico dados={dados} tipo="temperatura" />
            ) : (
              <div className="h-[200px] flex items-center justify-center font-mono text-[12px] text-wire">
                aguardando leituras...
              </div>
            )}
          </section>

          <section className="rounded border p-5" style={{ borderColor: "var(--line)", backgroundColor: "rgba(255,255,255,0.5)" }}>
            <h2 className="font-[family-name:var(--font-display)] text-[15px] font-medium mb-4">
              Umidade
            </h2>
            {dados.length > 0 ? (
              <GraficoHistorico dados={dados} tipo="umidade" />
            ) : (
              <div className="h-[200px] flex items-center justify-center font-mono text-[12px] text-wire">
                aguardando leituras...
              </div>
            )}
          </section>
        </div>

        {/* Controles */}
        {process.env.NEXT_PUBLIC_SHOW_CONTROLS === "true" && (
          <section className="rounded border p-5" style={{ borderColor: "var(--line)", backgroundColor: "rgba(255,255,255,0.5)" }}>
            <h2 className="font-[family-name:var(--font-display)] text-[17px] font-medium mb-2">
              Controle remoto
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="divide-y" style={{ borderColor: "var(--line)" }}>
                <ControleSwitch
                  label="Porta"
                  descricao="Abre ou fecha o servo motor"
                  ativo={portaAberta}
                  carregando={carregandoPorta}
                  onToggle={handleTogglePorta}
                />
                <ControleSwitch
                  label="LED indicador"
                  descricao="Acende o LED de presença manualmente"
                  ativo={ledAtivo}
                  carregando={carregandoLed}
                  onToggle={handleToggleLed}
                />
              </div>

              <div className="flex flex-col items-center gap-2 sm:border-l sm:pl-6" style={{ borderColor: "var(--line)" }}>
                <PortaIlustracao aberta={portaAberta} />
                <span className="font-mono text-[11px] uppercase tracking-wide" style={{ color: portaAberta ? "var(--ok)" : "var(--wire)" }}>
                  {portaAberta ? "aberta" : "fechada"}
                </span>
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 flex justify-between flex-wrap gap-2 font-mono text-[11px] text-wire">
          <span>tópico base: <b className="text-ink">imd0907/cassio_lourrayni/sala</b></span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Jcassio-dev/iot-monitoramento-inteligente"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              github
            </a>
            <span>atualiza a cada <b className="text-ink">5s</b></span>
          </div>
        </div>
      </div>
    </main>
  );
}
