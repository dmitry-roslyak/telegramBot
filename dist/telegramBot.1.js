"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CallbackQueryActions;
(function (CallbackQueryActions) {
    CallbackQueryActions["href"] = "href";
    CallbackQueryActions["location"] = "location";
    CallbackQueryActions["favoritesAdd"] = "favoritesAdd";
    CallbackQueryActions["search"] = "search";
    CallbackQueryActions["contact"] = "contact";
    CallbackQueryActions["favorites"] = "favorites";
    CallbackQueryActions["photo"] = "photo";
})(CallbackQueryActions = exports.CallbackQueryActions || (exports.CallbackQueryActions = {}));
var VesselProperty;
(function (VesselProperty) {
    VesselProperty["name"] = "name";
    VesselProperty["shipType"] = "Ship type";
    VesselProperty["flag"] = "Flag";
    VesselProperty["IMO"] = "IMO";
    VesselProperty["MMSI"] = "MMSI";
    VesselProperty["callsign"] = "Callsign";
    VesselProperty["builtYear"] = "Year of Built";
    VesselProperty["length"] = "length";
    VesselProperty["beam"] = "beam";
    VesselProperty["grossTonnage"] = "Gross Tonnage";
    VesselProperty["deadweight"] = "Summer Deadweight (t)";
    VesselProperty["currentDraught"] = "Current draught";
    VesselProperty["course"] = "course";
    VesselProperty["speed"] = "speed";
    VesselProperty["destination"] = "Destination";
    VesselProperty["estimatedArrivalDate"] = "ETA";
    VesselProperty["lastReportDate"] = "Last report ";
    VesselProperty["coordinates"] = "Coordinates";
    VesselProperty["href"] = "href";
})(VesselProperty = exports.VesselProperty || (exports.VesselProperty = {}));
var VesselMetricSystem;
(function (VesselMetricSystem) {
    VesselMetricSystem["length"] = "m";
    VesselMetricSystem["currentDraught"] = "m";
    VesselMetricSystem["beam"] = "m";
    VesselMetricSystem["speed"] = "kn";
    VesselMetricSystem["grossTonnage"] = "t";
    VesselMetricSystem["deadweight"] = "t";
})(VesselMetricSystem = exports.VesselMetricSystem || (exports.VesselMetricSystem = {}));
exports.VesselPropertyArray = [
    "name", VesselProperty.name,
    "shipType", VesselProperty.shipType,
    "flag", VesselProperty.flag,
    "IMO", VesselProperty.IMO,
    "MMSI", VesselProperty.MMSI,
    "callsign", VesselProperty.callsign,
    "builtYear", VesselProperty.builtYear,
    "length", VesselProperty.length,
    "beam", VesselProperty.beam,
    "grossTonnage", VesselProperty.grossTonnage,
    "deadweight", VesselProperty.deadweight,
    "currentDraught", VesselProperty.currentDraught,
    "course", VesselProperty.course,
    "speed", VesselProperty.speed,
    "destination", VesselProperty.destination,
    "estimatedArrivalDate", VesselProperty.estimatedArrivalDate,
    "lastReportDate", VesselProperty.lastReportDate
];
//# sourceMappingURL=telegramBot.1.js.map