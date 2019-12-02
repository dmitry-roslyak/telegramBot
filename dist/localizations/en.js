"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const l = {
    "menu": "Please select from the following options 👇",
    "my_fleet": "🚢 My fleet",
    "contact_us": "💬 Cotact us",
    "location": "🧭 Location",
    "vessel_photo": "📷 Vessel photo",
    "vessels_not_found": "❌ Remove vessel",
    "vessel_remove": "❌ Remove vessel",
    "vessel_add": "⭐ Add to my fleet",
    "errorTrylater": "Oops error happend, please try later",
    "photoNotAvailable": "Sorry, photo not available for this vessel",
    "queryIsTooOld": "Query result is too old, please submit new one",
    "found_vessels": function (length) {
        return `Found vessels: ${length} 🔎🚢\nPlease select from the following 👇`;
    },
    "hello": function (user, botName) {
        return `👋 Hello ${user.first_name} ${user.last_name}, welcome to ${botName}!\n Here is my abilities:
* Find vessels by name, mmsi/imo.
* Show vessel latest info, location or view a photo.
* Add vessels to your fleet. /fav to see fleet list.
Send any message to start searching  🔎`;
    }
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