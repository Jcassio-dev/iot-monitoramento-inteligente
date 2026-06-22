import paho.mqtt.client as mqtt
from datetime import datetime

#  CONFIGURAÇÕES
BROKER_IP   = "broker.hivemq.com"
BROKER_PORT = 1883
CLIENT_ID   = "subscriber_pc_imd0907"

BASE           = "imd0907/cassio_lourrayni/sala"
TOPIC_TEMP     = BASE + "/temperatura"
TOPIC_UMID     = BASE + "/umidade"
TOPIC_PRESENCA = BASE + "/presenca"
TOPIC_ALERTA   = BASE + "/alerta"
TOPIC_LED      = BASE + "/led"
TOPIC_SERVO    = BASE + "/servo"

TEMP_LIMITE = 29.0

#  ESTADO LOCAL
dados = {"temperatura": None, "umidade": None, "presenca": None}

#  CALLBACKS
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Subscriber conectado ao HiveMQ!")
        print(f"Monitorando: {BASE}/*")
        print("-" * 45)
        client.subscribe(TOPIC_TEMP)
        client.subscribe(TOPIC_UMID)
        client.subscribe(TOPIC_PRESENCA)
    else:
        print(f"Falha na conexão, código: {rc}")

def on_message(client, userdata, message):
    topico  = message.topic
    payload = message.payload.decode().strip()
    agora   = datetime.now().strftime("%H:%M:%S")

    if topico == TOPIC_TEMP:
        dados["temperatura"] = float(payload)
        alerta = " *** ALERTA" if dados["temperatura"] > TEMP_LIMITE else ""
        print(f"[{agora}] Temperatura: {payload}°C{alerta}")

        if dados["temperatura"] > TEMP_LIMITE:
            client.publish(TOPIC_ALERTA, "temperatura_alta", qos=1)

    elif topico == TOPIC_UMID:
        dados["umidade"] = float(payload)
        print(f"[{agora}] Umidade: {payload}%")

    elif topico == TOPIC_PRESENCA:
        dados["presenca"] = int(payload)
        estado = "DETECTADA" if dados["presenca"] else "ausente"
        print(f"[{agora}] Presença: {estado}")

        angulo = "90" if dados["presenca"] else "0"
        client.publish(TOPIC_SERVO, angulo, qos=1)
        client.publish(TOPIC_LED, "1" if dados["presenca"] else "0", qos=1)

        if dados["temperatura"] and dados["umidade"]:
            print("-" * 45)

#  CONEXÃO E LOOP
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=CLIENT_ID)
client.on_connect = on_connect
client.on_message = on_message

print("Conectando ao HiveMQ...")
client.connect(BROKER_IP, BROKER_PORT)

try:
    client.loop_forever()
except KeyboardInterrupt:
    print("\nSubscriber encerrado.")
    client.disconnect()