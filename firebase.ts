```typescript id="0zhzmx"
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
    // HTTP GET
    //============================
    function httpGet(url: string): string {

        if (!esp8266.isWifiConnected()) {

            return ""
        }

        if (serverHost == "") {

            return ""
        }

        let port = useSSL ? 443 : 80
        let proto = useSSL ? "SSL" : "TCP"

        //============================
        // TUTUP KONEKSI LAMA
        //============================

        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        basic.pause(200)

        //============================
        // CONNECT SERVER
        //============================

        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"" + proto + "\",\"" + serverHost + "\"," + port,
            "OK",
            5000
        )) {

            return ""
        }

        basic.pause(300)

        //============================
        // REQUEST HTTP
        //============================

        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"

        //============================
        // SEND LENGTH
        //============================

        esp8266.sendCommand("AT+CIPSEND=" + request.length)

        basic.pause(500)

        //============================
        // SEND REQUEST
        //============================

        esp8266.sendCommand(request)

        //============================
        // WAIT SEND OK
        //============================

        let sendResult = esp8266.getResponse("SEND OK", 5000)

        if (sendResult == "") {

            esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

            return ""
        }

        //============================
        // GET RESPONSE
        //============================

        let response = esp8266.getResponse("CLOSED", 8000)

        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        return response
    }

    //============================
    // GET BODY HTTP
    //============================
    function getBody(response: string): string {

        let body = ""

        let index = response.indexOf("\r\n\r\n")

        if (index >= 0) {

            body = response.substr(index + 4)
        }
        else {

            body = response
        }

        body = body.replace("\r", "")
        body = body.replace("\n", "")
        body = body.trim()

        return body
    }

    //============================
    // SEND SENSOR NUMBER
    //============================
    //% subcategory="Firebase"
    //% block="Send Sensor|name %name|value %value"
    export function sendSensor(name: string, value: number) {

        uploadSuccess = false

        let data = name + ":" + value

        let safeData = esp8266.formatUrl(data)

        let url = serverPath + "?data=" + safeData

        let response = httpGet(url)

        if (response != "") {

            uploadSuccess = true
        }
    }

    //============================
    // SEND STRING
    //============================
    //% subcategory="Firebase"
    //% block="Send Text|name %name|value %value"
    export function sendString(name: string, value: string) {

        uploadSuccess = false

        let data = name + ":" + value

        let safeData = esp8266.formatUrl(data)

        let url = serverPath + "?data=" + safeData

        let response = httpGet(url)

        if (response != "") {

            uploadSuccess = true
        }
    }

   //============================
// GET RELAY
//============================
//% subcategory="Firebase"
//% block="Get Relay %relay"
export function getRelay(relay: number): number {

    let url = serverPath + "?relay=" + relay

    let response = httpGet(url)

    // gagal koneksi
    if (response == "") {

        return -1
    }

    //============================
    // AMBIL KARAKTER TERAKHIR
    //============================

    response = response.replace("\r", "")
    response = response.replace("\n", "")
    response = response.trim()

    // cari dari belakang
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
```
