import paho.mqtt.client as mqtt
import sqlite3
from datetime import datetime

BROKER_IP   = "localhost"  
BROKER_PORT = 1883
CLIENT_ID   = "logger_vm_imd0907"

BASE           = "imd0907/cassio_lourrayni/sala"
TOPIC_TEMP     = BASE + "/temperatura"
TOPIC_UMID     = BASE + "/umidade"
TOPIC_PRESENCA = BASE + "/presenca"

DB_PATH = "historico.db"

#  BANCO DE DADOS
def inicializar_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leituras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            temperatura REAL,
            umidade REAL,
            presenca INTEGER
        )
    """)
    conn.commit()
    conn.close()
    print(f"Banco de dados inicializado em {DB_PATH}")

def salvar_leitura(temperatura, umidade, presenca):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO leituras (timestamp, temperatura, umidade, presenca) VALUES (?, ?, ?, ?)",
        (datetime.now().isoformat(), temperatura, umidade, presenca)
    )
    conn.commit()
    conn.close()

dados = {"temperatura": None, "umidade": None, "presenca": None}

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Logger conectado ao Mosquitto local!")
        client.subscribe(TOPIC_TEMP)
        client.subscribe(TOPIC_UMID)
        client.subscribe(TOPIC_PRESENCA)
        print(f"Monitorando: {BASE}/*")
    else:
        print(f"Falha na conexão, código: {rc}")

def on_message(client, userdata, message):
    payload = message.payload.decode().strip()
    agora = datetime.now().strftime("%H:%M:%S")

    if message.topic == TOPIC_TEMP:
        dados["temperatura"] = float(payload)
        print(f"[{agora}] Temperatura: {payload}°C")

    elif message.topic == TOPIC_UMID:
        dados["umidade"] = float(payload)
        print(f"[{agora}] Umidade: {payload}%")

    elif message.topic == TOPIC_PRESENCA:
        dados["presenca"] = int(payload)
        print(f"[{agora}] Presença: {dados['presenca']}")

    if dados["temperatura"] is not None and dados["umidade"] is not None and dados["presenca"] is not None:
        salvar_leitura(dados["temperatura"], dados["umidade"], dados["presenca"])
        print(f"[{agora}] >>> Linha salva no banco de dados")
        dados["temperatura"] = None
        dados["umidade"] = None
        dados["presenca"] = None

if __name__ == "__main__":
    inicializar_db()

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=CLIENT_ID)
    client.on_connect = on_connect
    client.on_message = on_message

    print("Conectando ao broker local...")
    client.connect(BROKER_IP, BROKER_PORT)

    try:
        client.loop_forever()
    except KeyboardInterrupt:
        print("\nLogger encerrado.")
        client.disconnect()