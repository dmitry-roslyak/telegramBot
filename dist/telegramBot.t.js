"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CallbackQueryActions;
(function (CallbackQueryActions) {
    CallbackQueryActions["href"] = "href";
    CallbackQueryActions["location"] = "location";
    CallbackQueryActions["favoritesAdd"] = "favoritesAdd";
    CallbackQueryActions["favoritesRemove"] = "favoritesRemove";
    CallbackQueryActions["search"] = "search";
    CallbackQueryActions["contact"] = "contact";
    CallbackQueryActions["favorites"] = "favorites";
    CallbackQueryActions["photo"] = "photo";
})(CallbackQueryActions = exports.CallbackQueryActions || (exports.CallbackQueryActions = {}));
var VesselProperty;
(function (VesselProperty) {
    VesselProperty["name"] = "Name";
    VesselProperty["shipType"] = "Type";
    VesselProperty["flag"] = "Flag";
    VesselProperty["IMO"] = "IMO";
    VesselProperty["MMSI"] = "MMSI";
    VesselProperty["callsign"] = "Call Sign";
    VesselProperty["builtYear"] = "builtYear";
    VesselProperty["size"] = "Size";
    // length = "length",
    // beam = "beam",
    VesselProperty["GRT"] = "GRT";
    VesselProperty["DWT"] = "DWT";
    VesselProperty["currentDraught"] = "Draught";
    VesselProperty["course"] = "Course";
    VesselProperty["speed"] = "Speed";
    VesselProperty["status"] = "Status";
    VesselProperty["area"] = "Area";
    VesselProperty["port"] = "Port";
    VesselProperty["lastPort"] = "Last Port";
    VesselProperty["destination"] = "Destination";
    VesselProperty["estimatedArrivalDate"] = "ETA";
    VesselProperty["lastReportDate"] = "updatedAt";
    VesselProperty["coordinates"] = "Coordinates";
    VesselProperty["href"] = "href";
})(VesselProperty = exports.VesselProperty || (exports.VesselProperty = {}));
exports.VesselMeasurementSystem = {
    [VesselProperty.GRT + ""]: "t",
    [VesselProperty.DWT + ""]: "t",
    [VesselProperty.speed + ""]: "kn",
    [VesselProperty.size + ""]: "m",
    [VesselProperty.currentDraught + ""]: "m",
};
exports.VesselPropertyArray = [
    VesselProperty.name,
    VesselProperty.shipType,
    VesselProperty.flag,
    VesselProperty.IMO,
    VesselProperty.MMSI,
    VesselProperty.callsign,
    VesselProperty.builtYear,
    VesselProperty.size,
    // VesselProperty.length,
    // VesselProperty.beam,
    VesselProperty.GRT,
    VesselProperty.DWT,
    VesselProperty.status,
    VesselProperty.speed,
    VesselProperty.course,
    VesselProperty.currentDraught,
    VesselProperty.area,
    VesselProperty.port,
    VesselProperty.lastPort,
    VesselProperty.destination,
    VesselProperty.estimatedArrivalDate,
    VesselProperty.lastReportDate,
];
var UI_template;
(function (UI_template) {
    UI_template["notFound"] = "notFound";
    UI_template["queryIsTooOld"] = "queryIsTooOld";
    UI_template["photoNotAvailable"] = "photoNotAvailable";
    UI_template["errorTrylater"] = "errorTrylater";
    UI_template["hello"] = "hello";
    UI_template["menu"] = "menu";
    UI_template["vesselInfo"] = "vesselInfo";
    UI_template["vesselList"] = "vesselList";
    UI_template["vesselListFav"] = "vesselListFav";
    UI_template["favAdd"] = "vesselAddToFavorites";
    UI_template["favEmpty"] = "vesselFavoritesEmpty";
    UI_template["favRemove"] = "vesselRemoveFromFavorites";
})(UI_template = exports.UI_template || (exports.UI_template = {}));
//# sourceMappingURL=telegramBot.t.js.map