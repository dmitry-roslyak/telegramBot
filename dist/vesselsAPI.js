"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const legacyURL = require("url");
const vesselAPI = {
    getOne: function (key, value) {
        const url = legacyURL.format({
            pathname: process.env.vessel_API + "/vessel",
            query: { [key]: value },
        });
        return node_fetch_1.default(url)
            .then((res) => res.ok && res.json())
            .catch((err) => console.error(err));
    },
    find: function (name) {
        const url = legacyURL.format({
            pathname: process.env.vessel_API + "/vessel",
            query: { name },
        });
        return node_fetch_1.default(url)
            .then((res) => res.ok && res.json())
            .catch((err) => console.error(err));
    },
    imageFind: function (mmsi) {
        const url = legacyURL.format({
            pathname: process.env.vessel_API + "/photo",
            query: { mmsi },
        });
        return node_fetch_1.default(url)
            .then((res) => (res.ok ? res.text() : null))
            .catch((err) => console.error(err));
    },
};
exports.default = vesselAPI;
//# sourceMappingURL=vesselsAPI.js.map