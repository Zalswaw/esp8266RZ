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

        esp8266.sendCommand("AT+CIPSEND=" + request.length)
        esp8266.sendCommand(request)

        if (esp8266.getResponse("SEND OK", 3000) == "") return

        basic.pause(500)
        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        uploadSuccess = true
    }

    //============================
    // SEND STRING (JSON / UID NFC)
    //============================
    //% subcategory="Firebase"
    //% block="Send Text|name %name|value %value"
    export function sendString(name: string, value: string) {

        uploadSuccess = false
        if (!esp8266.isWifiConnected()) return
        if (serverHost == "") return

        let port = useSSL ? 443 : 80
        let proto = useSSL ? "SSL" : "TCP"

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

        esp8266.sendCommand("AT+CIPSEND=" + request.length)
        esp8266.sendCommand(request)

        if (esp8266.getResponse("SEND OK", 3000) == "") return

        basic.pause(500)
        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        uploadSuccess = true
    }

    //============================
    // GET RELAY (1-4)
    //============================
    //% subcategory="Firebase"
    //% block="Get Relay %relay"
    export function getRelay(relay: number): number {

        if (!esp8266.isWifiConnected()) return -1
        if (serverHost == "") return -1

        let port = useSSL ? 443 : 80
        let proto = useSSL ? "SSL" : "TCP"

        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"" + proto + "\",\"" + serverHost + "\"," + port,
            "OK",
            5000
        )) return -1

        let url = serverPath + "?relay=" + relay

        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"

        esp8266.sendCommand("AT+CIPSEND=" + request.length)
        esp8266.sendCommand(request)

        let response = esp8266.getResponse("CLOSED", 5000)

        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        if (response.indexOf("1") >= 0) return 1
        if (response.indexOf("0") >= 0) return 0

        return -1
    }
}
