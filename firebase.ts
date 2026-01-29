let serverHost = ""
let serverPath = "/iot.php"

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

        if (!esp8266.isWifiConnected()) return
        if (serverHost == "") return


        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"TCP\",\"" + serverHost + "\",80",
            "OK",
            5000
        )) return


        let data = name + ":" + value
        let safeData = esp8266.formatUrl(data)

        let url = serverPath + "?path=iot&data=" + safeData


        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"


        esp8266.sendCommand("AT+CIPSEND=" + request.length)
        esp8266.sendCommand(request)


        if (esp8266.getResponse("SEND OK", 3000) == "") return
        if (esp8266.getResponse("200 OK", 5000) == "") return

        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        uploadSuccess = true
    }

}
