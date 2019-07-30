"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegram_1 = require("./telegram");
const vesselsAPI_1 = require("./vesselsAPI");
const models_1 = require("./models");
const telegramBot_1_1 = require("./telegramBot.1");
const countries = require("../countries.json");
function countryFlag(country) {
    let res = countries.find((el) => el.name.common == country || el.cca3 == country);
    return res && res.flag || "";
}
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
        else if (element.message && element.message.text === "/menu") {
            menu(element.message.from.id);
        }
        else if (element.message && element.message.text === "/fav") {
            favorites(element.message.from.id);
        }
        else if (element.message && element.message.text && element.message.text.length > 2) {
            vesselsAPI_1.default.find(encodeURI(element.message.text))
                .then((vessels) => {
                /\d{7}|\d{9}/.test(element.message.text) ?
                    vesselInfo(element.message.from.id, vessels) :
                    vesselFoundList(element.message.from.id, vessels);
            })
                .catch(() => telegram_1.sendMessage(element.message.from.id, "Oops error happend, please try later"));
        }
    });
});
function menu(chat_id) {
    let output = "Please select from the following options 👇";
    let inline_keyboard = [];
    inline_keyboard.push([
        // {
        //     text: `🔎 Search`, callback_data: CallbackQueryActions.search
        // }, 
        {
            text: `🚢 My fleet`, callback_data: telegramBot_1_1.CallbackQueryActions.favorites //url: "tg://fav"
        }, {
            text: `💬 Cotact us`, url: telegram_1.contactUsURL
        }
    ]);
    telegram_1.sendMessage(chat_id, output, { inline_keyboard });
}
function vesselFoundList(chat_id, vessels) {
    let text = "Vessels not found";
    if (vessels.length) {
        vessels.length > 15 && (vessels.length = 15);
        text = `Found vessels: ${vessels.length} 🔎🚢\nPlease select from the following 👇`;
    }
    vesselButtonList(chat_id, text, vessels);
}
function favorites(chat_id) {
    models_1.Favorite.findAll({ where: { user_id: chat_id } }).then((data) => {
        vesselButtonList(chat_id, "🚢 My fleet", data);
    });
}
function vesselInfo(chat_id, vessel) {
    let output = "";
    telegramBot_1_1.VesselPropertyArray.forEach((property, i) => {
        if (!(i % 2))
            return;
        else if (property == telegramBot_1_1.VesselProperty.estimatedArrivalDate || property == telegramBot_1_1.VesselProperty.lastReportDate)
            vessel[property] = (new Date(vessel[property])).toLocaleString();
        output += `${property}: ${[vessel[property]]}\n`;
    });
    let inline_keyboard = [];
    inline_keyboard.push([
        {
            text: `🧭 Show location`, callback_data: telegramBot_1_1.CallbackQueryActions.location
        },
        {
            text: `⭐ Add to my fleet`, callback_data: telegramBot_1_1.CallbackQueryActions.favoritesAdd
        },
    ]);
    telegram_1.sendMessage(chat_id, output, { inline_keyboard }).then(queryCreate.bind({ chat_id, data: vessel }));
}
function vesselButtonList(chat_id, text, vessels) {
    let array = [];
    vessels.forEach((element, i) => {
        array.push({ text: `${countryFlag(element.country)} ${element.name}`, callback_data: telegramBot_1_1.CallbackQueryActions.href + ":" + i });
    });
    telegram_1.sendMessage(chat_id, text, { inline_keyboard: buttonsGrid(array, 3) }).then(queryCreate.bind({ chat_id, data: vessels }));
}
function buttonsGrid(array, maxColumn) {
    let keyboard = [];
    for (let c = 0, i = 0; i < array.length; c++) {
        keyboard.push([]);
        keyboard.forEach((el, index) => {
            if (c != index)
                return;
            for (let j = 1; j <= maxColumn && i < array.length; j++, i++) {
                el.push(array[i]);
            }
        });
    }
    return keyboard;
}
function queryCreate(message) {
    let message_id = message.body.result.message_id;
    models_1.Query.create({
        message_id,
        chat_id: this.chat_id,
        data: JSON.stringify(this.data),
    });
}
function callbackQueryHandler(callback_query) {
    if (callback_query.message && callback_query.message.message_id) {
        let chat_id = callback_query.from.id;
        let action = callback_query.data.split(":");
        switch (action[0]) {
            case telegramBot_1_1.CallbackQueryActions.search:
                telegram_1.answerCallbackQuery(callback_query.id);
                break;
            case telegramBot_1_1.CallbackQueryActions.favorites:
                favorites(chat_id);
                telegram_1.answerCallbackQuery(callback_query.id);
                break;
            default:
                models_1.Query.findOne({
                    where: {
                        chat_id,
                        message_id: callback_query.message.message_id
                    }
                }).then((query) => {
                    if (!query)
                        return;
                    let data = JSON.parse(query.data);
                    let href = action.length == 2 ? data[action[1]]["href"] : data["href"];
                    switch (action[0]) {
                        case telegramBot_1_1.CallbackQueryActions.href:
                            vesselsAPI_1.default.getOne(href)
                                .then((vessel) => vesselInfo(chat_id, vessel))
                                .catch(() => telegram_1.sendMessage(chat_id, "Oops error happend, please try later"));
                            break;
                        case telegramBot_1_1.CallbackQueryActions.location:
                            telegram_1.sendLocation(chat_id, data["Coordinates"]);
                            break;
                        case telegramBot_1_1.CallbackQueryActions.favoritesAdd:
                            models_1.Favorite.create({
                                user_id: chat_id,
                                name: data[telegramBot_1_1.VesselProperty.name],
                                href
                            });
                            break;
                    }
                    telegram_1.answerCallbackQuery(callback_query.id);
                }).catch(() => telegram_1.sendMessage(chat_id, "Query result is too old, please submit new one"));
                break;
        }
    }
}
//# sourceMappingURL=telegramBot.js.map