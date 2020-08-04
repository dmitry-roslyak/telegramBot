"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const legacyURL = require("url");
const vesselAPI = {
    getOne: function (vesselHref) {
        const url = legacyURL.format({
            pathname: process.env.vessel_API + "/view",
            query: { vesselHref },
        });
        return node_fetch_1.default(url)
            .then((res) => res.ok && res.json())
            .catch((err) => console.error(err));
    },
    find: function (text) {
        const url = legacyURL.format({
            pathname: process.env.vessel_API + "/search/" + text,
        });
        return node_fetch_1.default(url)
            .then((res) => res.ok && res.json())
            .catch((err) => console.error(err));
    },
    imageFind: function (mmsi) {
        const url = legacyURL.format({
            pathname: process.env.vessel_API + "/imageFind/",
            query: { mmsi },
        });
        return node_fetch_1.default(url)
            .then((res) => (res.ok ? res.text() : null))
            .catch((err) => console.error(err));
    },
};
exports.default = vesselAPI;
//# sourceMappingURL=vesselsAPI.js.map