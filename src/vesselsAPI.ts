import * as req from "request-promise";

const {
    vesselApi
} = require("../env.json");

const request = req.defaults({
    baseUrl: vesselApi,
    json: true
})

let requestHandler = function (error: any, httpResponse?: any, body?: any) {
    if (error || (httpResponse && httpResponse.statusCode != 200)) {
        error && console.error(error)
        httpResponse && console.warn(`httpResponse.statusCode: ${httpResponse.statusCode}`)
    }
}

const vesselAPI = {
    getOne: function (vesselHref: string) {
        return request.get({
            url: "/view",
            qs: {
                vesselHref
            }
        }).catch(requestHandler)
    },
    find: function (text: string) {
        return request.get({
            url: "/search/" + text,
        }).catch(requestHandler)
    },
    imageFind: function (mmsi: string | number) {
        return request.get({
            url: "/imageFind/",
            qs: {
                mmsi
            }
        }).catch(requestHandler)
    },
}

export default vesselAPI