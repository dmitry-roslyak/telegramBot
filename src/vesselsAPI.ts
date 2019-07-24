import * as req from "request";

const {
    vesselApi
} = require("../env.json");

const request = req.defaults({
    baseUrl: vesselApi,
    json: true
})

let requestHandler: req.RequestCallback = function (error, httpResponse, body) {
    if (error || (httpResponse && httpResponse.statusCode != 200)) {
        error && console.error(error)
        httpResponse && console.warn(`httpResponse.statusCode: ${httpResponse.statusCode}`)
        this.reject(error || httpResponse)
    } else this.resolve(body)
}

const vesselAPI = {
    getOne: function (vesselHref: string) {
        return new Promise((resolve, reject) => {
            request.get({
                url: "/view",
                qs: {
                    vesselHref
                }
            }, requestHandler.bind({ resolve, reject }))
        })
    },
    find: function (text: string) {
        return new Promise((resolve, reject) => {
            request.get({
                url: "/search/" + text,
            }, requestHandler.bind({ resolve, reject }))
        })
    }
}

export default vesselAPI