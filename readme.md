# IoT - Monitoramento de Ambiente com ESP8266

Projeto de IoT desenvolvido para a disciplina IMD0907. Monitora temperatura, umidade e presença via ESP8266, com persistência em VM e dashboard web em tempo real.

## Visão geral da arquitetura

```
ESP8266 (MicroPython)
  │  publica via MQTT
  ▼
VM (Mosquitto broker)
  ├── logger.py  ->  SQLite (historico.db)
  └── api.py     ->  REST API (Flask :5000)
                         │
                    dashboard (Next.js)
```

Para testes sem o hardware, o `publisher.py` simula o ESP publicando no broker público HiveMQ. O `subscriber.py` monitora as mensagens no terminal.

## Estrutura do repositório

```
iot/
├── api/
│   ├── api.py          # API Flask + controle MQTT (LED, servo)
│   └── logger.py       # Subscriber MQTT → SQLite
├── iot/
│   ├── main.py         # Firmware MicroPython para o ESP8266
│   ├── publisher.py    # Simulador PC (publica no HiveMQ)
│   ├── subscriber.py   # Monitor PC (lê do HiveMQ)
│   └── config.example.py  # Exemplo de configuração do ESP
└── dashboard/          # Frontend Next.js
```

## Hardware

| Componente | Pino ESP8266 | GPIO |
|---|---|---|
| DHT11 (temp/umid) | D4 | GPIO2 |
| PIR (presença) | D5 | GPIO14 |
| LED temperatura | D7 | GPIO13 |
| LED presença | D6 | GPIO12 |
| Servo (porta) | D2 | GPIO4 |

## Configuração

### ESP8266

Copie `iot/config.example.py` para `iot/config.py` e preencha:

```python
WIFI_SSID     = "nome_da_sua_rede"
WIFI_PASSWORD = "senha_do_wifi"
BROKER_IP     = "ip_da_sua_vm"
```

Faça o upload de `config.py` e `main.py` para o ESP com o ampy ou Thonny.

### VM

Instale as dependências e suba os serviços:

```bash
pip install flask flask-cors paho-mqtt

# em terminais separados:
python api/logger.py   # persiste leituras no SQLite
python api/api.py      # sobe a REST API na porta 5000
```

A VM precisa ter o Mosquitto rodando na porta 1883:

```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

### Dashboard

```bash
cd dashboard
cp .env.local.example .env.local
# edite .env.local com o IP da sua VM

npm install
npm run dev   # http://localhost:3000
```

### Simulação sem ESP (PC)

```bash
pip install paho-mqtt

python iot/publisher.py   # publica dados simulados no HiveMQ
python iot/subscriber.py  # monitora os tópicos no terminal
```

## API endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/historico` | Últimas 100 leituras |
| GET | `/api/ultima` | Leitura mais recente |
| POST | `/api/controle/led` | Liga/desliga LEDs `{"estado": true}` |
| POST | `/api/controle/porta` | Abre/fecha servo `{"aberta": true}` |

## Tópicos MQTT

Prefixo: `imd0907/cassio_lourrayni/sala/`

| Tópico | Direção | Conteúdo |
|---|---|---|
| `/temperatura` | ESP → broker | float °C |
| `/umidade` | ESP → broker | float % |
| `/presenca` | ESP → broker | `0` ou `1` |
| `/alerta` | broker → ESP | `temperatura_alta` |
| `/led` | broker → ESP | `0` ou `1` |
| `/servo` | broker → ESP | ângulo `0`–`180` |

## Autores

- **Cassio** - dashboard, firmware ESP8266 (`main.py`)
- **Lourrayni** - API Flask, logger, publisher e subscriber
