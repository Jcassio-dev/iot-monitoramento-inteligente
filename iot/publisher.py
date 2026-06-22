import paho.mqtt.client as mqtt
import time
import random

# ─────────────────────────────────────────
#  CONFIGURAÇÕES
# ─────────────────────────────────────────
BROKER_IP   = "broker.hivemq.com"
BROKER_PORT = 1883
CLIENT_ID   = "publisher_pc_imd0907"

BASE           = "imd0907/cassio_lourrayni/sala"
TOPIC_TEMP     = BASE + "/temperatura"
TOPIC_UMID     = BASE + "/umidade"
TOPIC_PRESENCA = BASE + "/presenca"

TEMP_LIMITE = 28.0  # acima disso simula alerta

# ─────────────────────────────────────────
#  CONEXÃO
# ─────────────────────────────────────────
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=CLIENT_ID)
client.connect(BROKER_IP, BROKER_PORT)
client.loop_start()

print("Publisher conectado ao HiveMQ")
print(f"Publicando nos tópicos: {BASE}/*")
print("-" * 45)

# ─────────────────────────────────────────
#  LOOP DE PUBLICAÇÃO
# ─────────────────────────────────────────
try:
    while True:
        temperatura = round(random.uniform(24.0, 32.0), 2)
        umidade     = round(random.uniform(50.0, 80.0), 2)
        presenca    = random.choice([0, 0, 0, 1])  # 25% de chance de presença

        client.publish(TOPIC_TEMP,     str(temperatura), qos=0)
        client.publish(TOPIC_UMID,     str(umidade),     qos=0)
        client.publish(TOPIC_PRESENCA, str(presenca),    qos=1)

        alerta = " *** ALERTA: temperatura alta!" if temperatura > TEMP_LIMITE else ""
        pres_str = "SIM" if presenca else "NAO"
        print(f"Temp: {temperatura}°C | Umid: {umidade}% | Presença: {pres_str}{alerta}")

        time.sleep(2)

except KeyboardInterrupt:
    print("\nPublisher encerrado.")
    client.loop_stop()
    client.disconnect()