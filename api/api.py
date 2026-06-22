
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import paho.mqtt.client as mqtt

app = Flask(__name__)
CORS(app)  
DB_PATH = "historico.db"
BROKER_IP   = "localhost"
BROKER_PORT = 1883
BASE        = "imd0907/cassio_lourrayni/sala"

TOPIC_LED   = BASE + "/led"
TOPIC_SERVO = BASE + "/servo"

mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="api_vm_imd0907")
mqtt_client.connect(BROKER_IP, BROKER_PORT)
mqtt_client.loop_start() 


@app.route("/api/historico")
def historico():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT timestamp, temperatura, umidade, presenca
        FROM leituras
        ORDER BY id DESC
        LIMIT 100
    """)
    linhas = cursor.fetchall()
    conn.close()

    dados = [dict(linha) for linha in reversed(linhas)]
    return jsonify(dados)


@app.route("/api/ultima")
def ultima_leitura():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT timestamp, temperatura, umidade, presenca
        FROM leituras
        ORDER BY id DESC
        LIMIT 1
    """)
    linha = cursor.fetchone()
    conn.close()

    if linha:
        return jsonify(dict(linha))
    return jsonify({"erro": "nenhuma leitura encontrada"}), 404


@app.route("/api/controle/led", methods=["POST"])
def controlar_led():
    dados = request.get_json(silent=True) or {}
    estado = dados.get("estado")

    if estado is None:
        return jsonify({"erro": "campo 'estado' é obrigatório (true/false)"}), 400

    payload = "1" if estado else "0"
    mqtt_client.publish(TOPIC_LED, payload, qos=1)

    return jsonify({"ok": True, "topico": TOPIC_LED, "valor": payload})


@app.route("/api/controle/porta", methods=["POST"])
def controlar_porta():
    dados = request.get_json(silent=True) or {}
    aberta = dados.get("aberta")

    if aberta is None:
        return jsonify({"erro": "campo 'aberta' é obrigatório (true/false)"}), 400

    angulo = "90" if aberta else "0"
    mqtt_client.publish(TOPIC_SERVO, angulo, qos=1)

    return jsonify({"ok": True, "topico": TOPIC_SERVO, "valor": angulo})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)