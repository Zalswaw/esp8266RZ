let serverHost = ""
let serverPath = "/iot.php"
let useSSL = false  // new: pakai SSL atau tidak

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
    // STATUS
    //============================
    //% subcategory="Firebase"
    //% block="Upload success"
    export function isSuccess(): boolean {
        return uploadSuccess
    }

    //============================
    // SEND SENSOR
    //============================
    //% subcategory="Firebase"
    //% block="Send Sensor|name %name|value %value"
    export function sendSensor(name: string, value: number) {

        uploadSuccess = false

        // cek koneksi
        if (!esp8266.isWifiConnected()) return
        if (serverHost == "") return

        // buka koneksi TCP atau SSL
        let port = useSSL ? 443 : 80
        let proto = useSSL ? "SSL" : "TCP"

        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"" + proto + "\",\"" + serverHost + "\"," + port,
            "OK",
            5000
        )) return

        // siapkan data
        let data = name + ":" + value
        let safeData = esp8266.formatUrl(data)
        let url = serverPath + "?path=iot&data=" + safeData

        // HTTP request
        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"

        // kirim request
        esp8266.sendCommand("AT+CIPSEND=" + request.length)
        esp8266.sendCommand(request)

        // cek apakah data terkirim
        if (esp8266.getResponse("SEND OK", 3000) == "") return

        // tunggu server proses
        basic.pause(1000)

        // tutup koneksi
        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        uploadSuccess = true
    }
}
