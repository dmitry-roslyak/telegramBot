"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const l = {
    Name: "Name",
    Type: "Type",
    Flag: "Flag",
    IMO: "IMO",
    MMSI: "MMSI",
    "Call Sign": "Call Sign",
    builtYear: "Year built",
    Size: "Size",
    // length = "length",
    // beam = "beam",
    GRT: "Gross tonnage",
    DWT: "Dead weight",
    Draught: "Current draught",
    Course: "Course",
    Speed: "Speed",
    Status: "Status",
    Area: "Area",
    Port: "Current port",
    "Last Port": "Last port",
    Destination: "Destination",
    ETA: "Estimated arrival date",
    updatedAt: "Last report date",
    arrived: "arrived",
    departed: "departed",
    menu: "Please select from the following options 👇",
    my_fleet: "🚢 My fleet",
    contact_us: "💬 Cotact us",
    location: "🧭 Location",
    vessel_photo: "📷 Vessel photo",
    vessels_not_found: "vessels_not_found",
    vessel_remove: "❌ Remove vessel",
    vessel_add: "⭐ Add to my fleet",
    errorTrylater: "⚠ Oops error happend, please try later",
    photoNotAvailable: "⚠ Sorry, photo not available for this vessel",
    queryIsTooOld: "⚠ Query result is too old, please submit new one",
    vesselAddToFavorites: "🚢 Vessel has been added to your fleet! type /fleet to review",
    vesselRemoveFromFavorites: "❌🚢 Vessel has been removed from your fleet",
    vesselFavoritesEmpty: "🌊 Your fleet is empty",
    found_vessels: function (length) {
        return `Found vessels: ${length} 🔎🚢\nPlease select from the following 👇`;
    },
    hello: function (user, botName) {
        return `👋 Hello ${user.first_name} ${user.last_name}, welcome to ${botName}!\n Here is my abilities:
* Find vessels by name, mmsi/imo.
* Show vessel latest info, location or view a photo.
* Add vessels to your fleet. /fav to see fleet list.
Send any message to start searching  🔎`;
    },
};
function localization_en(key) {
    let message = "";
    if (arguments.length > 1 && typeof l[key] === "function") {
        message = l[key](...[...arguments].slice(1));
    }
    else if (l[key]) {
        message = l[key];
    }
    else
        message = "localization message not found";
    return message;
}
exports.localization_en = localization_en;
//# sourceMappingURL=en.js.map