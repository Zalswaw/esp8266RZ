```typescript id="nxtb5p"
let serverHost = ""
let serverPath = "/iot.php"
let useSSL = false

namespace firebase {

    let uploadSuccess = false

    //============================
    // SET HOST
    //============================
    //% subcategory="Firebase"
    //% block="Set Server Host %host"
    export function setHost(host: string) {

        serverHost = host
            .replace("http://", "")
            .replace("https://", "")
            .replace("/", "")
            .trim()
    }

    //============================
    // USE SSL
    //============================
    //% subcategory="Firebase"
    //% block="Use SSL %ssl"
    export function setUseSSL(ssl: boolean) {

        useSSL = ssl
    }

    //============================
    // SET PATH
    //============================
    //% subcategory="Firebase"
    //% block="Set Server Path %path"
    export function setPath(path: string) {

        if (path.charAt(0) != "/") {

            path = "/" + path
        }

        serverPath = path
    }

    //============================
    // STATUS UPLOAD
    //============================
    //% subcategory="Firebase"
    //% block="Upload success"
    export function isSuccess(): boolean {

        return uploadSuccess
    }

    //============================
    // SEND SENSOR (ANGKA)
    //============================
    //% subcategory="Firebase"
    //% block="Send Sensor|name %name|value %value"
    export function sendSensor(name: string, value: number) {

        uploadSuccess = false

        if (!esp8266.isWifiConnected()) return
        if (serverHost == "") return

        let port = useSSL ? 443 : 80
        let proto = useSSL ? "SSL" : "TCP"

        // tutup koneksi lama
        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        basic.pause(200)

        // connect server
        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"" + proto + "\",\"" + serverHost + "\"," + port,
            "OK",
            5000
        )) return

        let data = name + ":" + value

        let safeData = esp8266.formatUrl(data)

        let url = serverPath + "?data=" + safeData

        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"

        // kirim panjang request
        esp8266.sendCommand("AT+CIPSEND=" + request.length)

        basic.pause(500)

        // kirim request
        esp8266.sendCommand(request)

        // tunggu SEND OK
        if (esp8266.getResponse("SEND OK", 5000) == "") {

            esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

            return
        }

        basic.pause(300)

        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        uploadSuccess = true
    }

    //============================
    // SEND STRING
    //============================
    //% subcategory="Firebase"
    //% block="Send Text|name %name|value %value"
    export function sendString(name: string, value: string) {

        uploadSuccess = false

        if (!esp8266.isWifiConnected()) return
        if (serverHost == "") return

        let port = useSSL ? 443 : 80
        let proto = useSSL ? "SSL" : "TCP"

        // tutup koneksi lama
        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        basic.pause(200)

        // connect server
        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"" + proto + "\",\"" + serverHost + "\"," + port,
            "OK",
            5000
        )) return

        let data = name + ":" + value

        let safeData = esp8266.formatUrl(data)

        let url = serverPath + "?data=" + safeData

        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"

        // kirim panjang request
        esp8266.sendCommand("AT+CIPSEND=" + request.length)

        basic.pause(500)

        // kirim request
        esp8266.sendCommand(request)

        // tunggu SEND OK
        if (esp8266.getResponse("SEND OK", 5000) == "") {

            esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

            return
        }

        basic.pause(300)

        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        uploadSuccess = true
    }

    //============================
    // GET RELAY
    //============================
    //% subcategory="Firebase"
    //% block="Get Relay %relay"
    export function getRelay(relay: number): number {

        if (!esp8266.isWifiConnected()) return -1
        if (serverHost == "") return -1

        let port = useSSL ? 443 : 80
        let proto = useSSL ? "SSL" : "TCP"

        // tutup koneksi lama
        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        basic.pause(200)

        // connect server
        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"" + proto + "\",\"" + serverHost + "\"," + port,
            "OK",
            5000
        )) return -1

        let url = serverPath + "?relay=" + relay

        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"

        // kirim panjang request
        esp8266.sendCommand("AT+CIPSEND=" + request.length)

        basic.pause(500)

        // kirim request
        esp8266.sendCommand(request)

        // ambil response
        let response = esp8266.getResponse("CLOSED", 5000)

        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        // bersihkan response
        response = response.replace("\r", "")
        response = response.replace("\n", "")
        response = response.trim()

        //============================
        // CEK RELAY DARI BELAKANG
        //============================

        for (let i = response.length - 1; i >= 0; i--) {

            let c = response.charAt(i)

            if (c == "1") {

                return 1
            }

            if (c == "0") {

                return 0
            }
        }

        return -1
    }
}
```
