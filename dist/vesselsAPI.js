"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req = require("request");
const { vesselApi } = require("../env.json");
const request = req.defaults({
    baseUrl: vesselApi,
    json: true
});
let requestHandler = function (error, httpResponse, body) {
    if (error || (httpResponse && httpResponse.statusCode != 200)) {
        error && console.error(error);
        httpResponse && console.warn(`httpResponse.statusCode: ${httpResponse.statusCode}`);
        this.reject(error || httpResponse);
    }
    else
        this.resolve(body);
};
const vesselAPI = {
    getOne: function (vesselHref) {
        return new Promise((resolve, reject) => {
            request.get({
                url: "/view",
                qs: {
                    vesselHref
                }
            }, requestHandler.bind({ resolve, reject }));
        });
    },
    find: function (text) {
        return new Promise((resolve, reject) => {
            request.get({
                url: "/search/" + text,
            }, requestHandler.bind({ resolve, reject }));
        });
    },
    imageFind: function (mmsi) {
        return new Promise((resolve, reject) => {
            request.get({
                url: "/imageFind/",
                qs: {
                    mmsi
                }
            }, requestHandler.bind({ resolve, reject }));
        });
    },
};
exports.default = vesselAPI;
//# sourceMappingURL=vesselsAPI.js.map