"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegram_1 = require("./telegram");
const vesselsAPI_1 = require("./vesselsAPI");
telegram_1.subscribe(function (messages) {
    messages.forEach(element => {
        console.log(element);
        if (element.message && element.message.text === "test") {
            test(element.message.from.id, "Its working");
            // sendMessage(element.message.from.id, "Its working")
        }
        else if (element.callback_query) {
            let data = JSON.parse(element.callback_query.data);
            let chat_id = element.callback_query.from.id;
            if (data["href"]) {
                vesselsAPI_1.default.getOne(data["href"])
                    .then((vessel) => vesselInfo(chat_id, vessel))
                    .catch(() => telegram_1.sendMessage(chat_id, "Oops error happend, please try later"));
            }
            else if (data["locationShow"]) {
                telegram_1.sendLocation(chat_id, data["locationShow"]);
            }
            else if (data["vesselFavoriteAdd"]) {
                telegram_1.sendMessage(chat_id, "My fleet currently not available");
            }
            telegram_1.answerCallbackQuery(element.callback_query.id);
        }
        else if (element.message && element.message.text === "/start") {
            telegram_1.sendMessage(element.message.from.id, "Драсьте");
        }
        else if (element.message && element.message.text && element.message.text.includes('/')) {
            telegram_1.sendMessage(element.message.from.id, "Messages with format /commands, currently not available");
        }
        else if (element.message && element.message.text) {
            vesselsAPI_1.default.find(element.message.text)
                .then((vessels) => {
                /\d{7}|\d{9}/.test(element.message.text) ?
                    vesselInfo(element.message.from.id, vessels) :
                    vesselFoundList(element.message.from.id, vessels);
            })
                .catch(() => telegram_1.sendMessage(element.message.from.id, "Oops error happend, please try later"));
        }
    });
});
function vesselFoundList(chat_id, vessels) {
    let inline_keyboard = [];
    let text = "Vessels not found";
    if (vessels.length) {
        text = `
            Found vessels: ${vessels.length}\n
            Please select from the following:
        `;
    }
    vessels.forEach((element, i) => {
        let cbData = JSON.stringify({
            'href': element.href
        });
        cbData = cbData.length > 64 ? "0" : cbData;
        i < 9 && inline_keyboard.push([{ text: `${i}) ${element.name}(${element.country})`, callback_data: cbData }]);
        // output += `${i}) ${element.name}(${element.country})\n`
    });
    telegram_1.sendMessage(chat_id, text, { inline_keyboard });
}
function vesselInfo(chat_id, vessel) {
    let output = "";
    for (const key in vessel) {
        if ("Coordinates" == key)
            continue;
        output += `${key}: ${vessel[key]}\n`;
    }
    let inline_keyboard = [];
    inline_keyboard.push([
        {
            text: `🗺 Show location`, callback_data: JSON.stringify({
                'locationShow': vessel["Coordinates"]
            })
        },
        {
            text: `⭐ Add to my fleet`, callback_data: JSON.stringify({
                'vesselFavoriteAdd': vessel["IMO / MMSI"]
            })
        },
    ]);
    telegram_1.sendMessage(chat_id, output, { inline_keyboard });
}
function test(chat_id, data) {
    let inline_keyboard = [];
    inline_keyboard.push([
        {
            text: `🗺 Show location`, callback_data: "1"
        },
        {
            text: `⭐ Add to my fleet`, callback_data: "2"
        },
    ]);
    telegram_1.sendMessage(chat_id, data, { inline_keyboard });
}
//# sourceMappingURL=telegramBot.js.map