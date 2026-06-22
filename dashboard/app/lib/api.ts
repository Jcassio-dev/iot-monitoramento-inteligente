export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export interface Leitura {
  timestamp: string;
  temperatura: number;
  umidade: number;
  presenca: number;
}

export async function buscarHistorico(): Promise<Leitura[]> {
  const resp = await fetch(`${API_BASE}/api/historico`, { cache: "no-store" });
  if (!resp.ok) throw new Error("Falha ao buscar histórico");
  return resp.json();
}

export async function controlarLed(estado: boolean): Promise<void> {
  const resp = await fetch(`${API_BASE}/api/controle/led`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  if (!resp.ok) throw new Error("Falha ao controlar LED");
}

export async function controlarPorta(aberta: boolean): Promise<void> {
  const resp = await fetch(`${API_BASE}/api/controle/porta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aberta }),
  });
  if (!resp.ok) throw new Error("Falha ao controlar porta");
}
