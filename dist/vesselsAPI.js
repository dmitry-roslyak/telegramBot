"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req = require("request-promise");
const request = req.defaults({
    baseUrl: process.env.vessel_API,
    json: true
});
const vesselAPI = {
    getOne: function (vesselHref) {
        let pr = request.get({
            url: "/view",
            qs: {
                vesselHref
            }
        });
        pr.catch(err => console.error(err));
        return pr;
    },
    find: function (text) {
        let pr = request.get({
            url: "/search/" + text,
        });
        pr.catch(err => console.error(err));
        return pr;
    },
    imageFind: function (mmsi) {
        let pr = request.get({
            url: "/imageFind/",
            qs: {
                mmsi
            }
        });
        pr.catch(err => console.error(err));
        return pr;
    },
};
exports.default = vesselAPI;
//# sourceMappingURL=vesselsAPI.js.map