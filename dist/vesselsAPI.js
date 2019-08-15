"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req = require("request-promise");
const request = req.defaults({
    baseUrl: process.env.vessel_API,
    json: true
});
let requestHandler = function (error, httpResponse, body) {
    if (error || (httpResponse && httpResponse.statusCode != 200)) {
        error && console.error(error);
        httpResponse && console.warn(`httpResponse.statusCode: ${httpResponse.statusCode}`);
    }
};
const vesselAPI = {
    getOne: function (vesselHref) {
        return request.get({
            url: "/view",
            qs: {
                vesselHref
            }
        }).catch(requestHandler);
    },
    find: function (text) {
        return request.get({
            url: "/search/" + text,
        }).catch(requestHandler);
    },
    imageFind: function (mmsi) {
        return request.get({
            url: "/imageFind/",
            qs: {
                mmsi
            }
        }).catch(requestHandler);
    },
};
exports.default = vesselAPI;
//# sourceMappingURL=vesselsAPI.js.map