import machine
import dht
import time
import network
from umqtt.simple import MQTTClient
from config import WIFI_SSID, WIFI_PASSWORD, BROKER_IP

BROKER_PORT = 1883
CLIENT_ID     = "esp8266_imd0907_cassio" 


# DHT11            D4            GPIO2
# PIR              D5            GPIO14
# LED Temperatura  D6            GPIO12
# LED Presença     D7            GPIO13
# Servo (porta)    D2            GPIO4

PIN_DHT          = 2
PIN_PIR          = 14
PIN_LED_TEMP     = 13
PIN_LED_PRESENCA = 12
PIN_SERVO        = 4


BASE           = "imd0907/cassio_lourrayni/sala"
TOPIC_TEMP     = (BASE + "/temperatura").encode()
TOPIC_UMID     = (BASE + "/umidade").encode()
TOPIC_PRESENCA = (BASE + "/presenca").encode()
TOPIC_ALERTA   = (BASE + "/alerta").encode()
TOPIC_LED      = (BASE + "/led").encode()
TOPIC_SERVO    = (BASE + "/servo").encode()

TEMP_LIMITE = 29.0  


sensor_dht = dht.DHT11(machine.Pin(PIN_DHT))
pir        = machine.Pin(PIN_PIR, machine.Pin.IN)
led_temp   = machine.Pin(PIN_LED_TEMP,     machine.Pin.OUT)
led_pres   = machine.Pin(PIN_LED_PRESENCA, machine.Pin.OUT)
pwm_servo  = machine.PWM(machine.Pin(PIN_SERVO), freq=50)

def servo_angulo(graus):
    duty = int(40 + (graus / 180) * 75)
    pwm_servo.duty(duty)

servo_angulo(0) 


def conectar_wifi():
    sta = network.WLAN(network.STA_IF)
    sta.active(True)
    if not sta.isconnected():
        print("Conectando ao Wi-Fi...")
        sta.connect(WIFI_SSID, WIFI_PASSWORD)
        tentativas = 0
        while not sta.isconnected() and tentativas < 15:
            time.sleep(1)
            tentativas += 1
            print("Status:", sta.status())

    if sta.isconnected():
        print("Wi-Fi OK!")
        return True
    else:
        print("Falha! Status final:", sta.status())
        return False


def on_message(topic, msg):
    payload = msg.decode().strip()
    print("[MQTT recebido]", topic, "->", payload)

    if topic == TOPIC_LED:
        if payload == "1":
            led_temp.on()
            led_pres.on()
            print("LEDs ligados remotamente")
        elif payload == "0":
            led_temp.off()
            led_pres.off()
            print("LEDs desligados remotamente")

    elif topic == TOPIC_SERVO:
        try:
            angulo = max(0, min(180, int(payload)))
            servo_angulo(angulo)
            estado = "ABERTA" if angulo >= 45 else "FECHADA"
            print("Porta", estado, "(", angulo, "graus)")
        except ValueError:
            print("Angulo invalido:", payload)

    elif topic == TOPIC_ALERTA:
        print("ALERTA:", payload)
        for _ in range(3):
            led_temp.on()
            led_pres.on()
            time.sleep(0.2)
            led_temp.off()
            led_pres.off()
            time.sleep(0.2)


def conectar_mqtt():
    try:
        client = MQTTClient(CLIENT_ID, BROKER_IP, port=BROKER_PORT)
        client.set_callback(on_message)
        client.connect()
        client.subscribe(TOPIC_LED)
        client.subscribe(TOPIC_SERVO)
        client.subscribe(TOPIC_ALERTA)
        print("MQTT conectado!")
        return client
    except Exception as e:
        print("Erro ao conectar MQTT:", e)
        return None


def loop():

    if not conectar_wifi():
        return

    client = conectar_mqtt()
    if client is None:
        print("Abortando loop por falha no MQTT")
        return

    ultimo_envio = 0
    INTERVALO = 2000  #
    presenca_acumulada = 0 

    while True:
        try:
            client.check_msg()
        except Exception as e:
            print("Erro MQTT, reconectando...", e)
            try:
                client = conectar_mqtt()
            except:
                time.sleep(2)
                continue

        if pir.value() == 1:
            presenca_acumulada = 1

        agora = time.ticks_ms()
        if time.ticks_diff(agora, ultimo_envio) >= INTERVALO:
            ultimo_envio = agora

            try:
                sensor_dht.measure()
                temperatura = sensor_dht.temperature()
                umidade     = sensor_dht.humidity()
            except OSError:
                print("Erro ao ler DHT22")
                continue

            presenca = presenca_acumulada
            presenca_acumulada = 0  

            led_temp.value(1 if temperatura > TEMP_LIMITE else 0)
            led_pres.value(presenca)

            servo_angulo(90 if presenca else 0)

            try:
                client.publish(TOPIC_TEMP,     str(temperatura))
                client.publish(TOPIC_UMID,     str(umidade))
                client.publish(TOPIC_PRESENCA, str(presenca))
                print("Temp:", temperatura, "C | Umid:", umidade, "% | Presenca:", presenca)
            except Exception as e:
                print("Erro ao publicar:", e)

        time.sleep_ms(100)

loop()