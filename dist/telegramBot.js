"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegram_1 = require("./telegram");
const vesselsAPI_1 = require("./vesselsAPI");
const models_1 = require("./models");
telegram_1.subscribe(function (messages) {
    messages.forEach(element => {
        console.log(element);
        if (element.message && element.message.text === "test") {
            telegram_1.sendMessage(element.message.from.id, "Its working");
        }
        else if (element.callback_query) {
            callbackQueryHandler(element.callback_query);
        }
        else if (element.message && element.message.text === "/start") {
            telegram_1.sendMessage(element.message.from.id, "Драсьте");
        }
        else if (element.message && element.message.text === "/fav") {
            models_1.Favorite.findAll({ where: { user_id: element.message.from.id } }).then((f) => {
                favorites(element.message.from.id, f);
            });
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
        // let cbData = JSON.stringify({
        //     'href': element.href
        // })
        // cbData = cbData.length > 64 ? "0" : cbData
        i < 9 && inline_keyboard.push([{ text: `${i}) ${element.name}(${element.country})`, callback_data: "href:" + i }]);
        // output += `${i}) ${element.name}(${element.country})\n`
    });
    telegram_1.sendMessage(chat_id, text, { inline_keyboard }).then((message) => {
        let message_id = message.body.result.message_id;
        models_1.Query.create({
            message_id,
            chat_id,
            data: JSON.stringify(vessels),
        });
    });
}
function vesselInfo(chat_id, vessel) {
    let output = "";
    for (const key in vessel) {
        if ("Coordinates" == key || "href" == key)
            continue;
        output += `${key}: ${vessel[key]}\n`;
    }
    let inline_keyboard = [];
    inline_keyboard.push([
        {
            text: `🗺 Show location`, callback_data: "location"
        },
        {
            text: `⭐ Add to my fleet`, callback_data: "favoritesAdd"
        },
    ]);
    telegram_1.sendMessage(chat_id, output, { inline_keyboard }).then((message) => {
        let message_id = message.body.result.message_id;
        models_1.Query.create({
            message_id,
            chat_id,
            data: JSON.stringify(vessel),
        });
    });
}
function favorites(chat_id, data) {
    let inline_keyboard = [];
    let output = "🚢 My fleet:";
    data.forEach((element, i) => {
        inline_keyboard.push([
            {
                text: element.name, callback_data: "href:" + i
            }
        ]);
    });
    telegram_1.sendMessage(chat_id, output, { inline_keyboard }).then((message) => {
        let message_id = message.body.result.message_id;
        models_1.Query.create({
            message_id,
            chat_id,
            data: JSON.stringify(data),
        });
    });
}
function test(chat_id, data) {
    let keyboard = [];
    keyboard.push([
        {
            text: `🗺 Show location`
        },
        {
            text: `⭐ Add to my fleet`
        },
    ]);
    telegram_1.sendMessage(chat_id, data, { keyboard });
}
function callbackQueryHandler(callback_query) {
    if (callback_query.message && callback_query.message.message_id) {
        models_1.Query.findOne({
            where: {
                message_id: callback_query.message.message_id
            }
        }).then((query) => {
            if (!query)
                return;
            let action = callback_query.data.split(":");
            let data = JSON.parse(query.data);
            let chat_id = callback_query.from.id;
            let href = action.length == 2 ? data[action[1]]["href"] : data["href"];
            switch (action[0]) {
                case "href":
                    vesselsAPI_1.default.getOne(href)
                        .then((vessel) => vesselInfo(chat_id, vessel))
                        .catch(() => telegram_1.sendMessage(chat_id, "Oops error happend, please try later"));
                    break;
                case "location":
                    telegram_1.sendLocation(chat_id, data["Coordinates"]);
                    break;
                case "favoritesAdd":
                    models_1.Favorite.create({
                        user_id: chat_id,
                        name: data["IMO / MMSI"],
                        href
                    });
                    break;
            }
            telegram_1.answerCallbackQuery(callback_query.id);
        });
    }
}
//# sourceMappingURL=telegramBot.js.map