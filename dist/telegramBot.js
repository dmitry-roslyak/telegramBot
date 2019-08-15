"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegramAPI_1 = require("./telegramAPI");
const vesselsAPI_1 = require("./vesselsAPI");
const models_1 = require("./models");
const telegramBot_t_1 = require("./telegramBot.t");
const sequelize_1 = require("sequelize");
const countries = require("../countries.json");
function countryFlag(country) {
    let res = countries.find((el) => el.common == country || el.cca3 == country);
    return res && res.flag || "";
}
telegramAPI_1.subscribe(function (messages) {
    messages.forEach(element => new UpdateHandler(element));
});
class UpdateHandler {
    constructor(element) {
        if (element.message) {
            this.chat_id = element.message.from.id;
            this.messageHandler(element.message.text);
        }
        else if (element.callback_query && element.callback_query.message) {
            this.chat_id = element.callback_query.from.id;
            let action = element.callback_query.data.split(":");
            if ([telegramBot_t_1.CallbackQueryActions.href, telegramBot_t_1.CallbackQueryActions.location, telegramBot_t_1.CallbackQueryActions.photo, telegramBot_t_1.CallbackQueryActions.favoritesAdd].includes(action[0])) {
                models_1.Query.findOne({
                    where: {
                        chat_id: this.chat_id,
                        message_id: element.callback_query.message.message_id
                    }
                }).then((query) => {
                    if (!query)
                        return Promise.reject("Query not found");
                    let data = JSON.parse(query.data);
                    let href = action.length == 2 ? data[action[1]]["href"] : data["href"];
                    this.callbackQueryHandler(element.callback_query, action[0], href, data);
                }).catch((err) => {
                    console.error(err);
                    telegramAPI_1.answerCallbackQuery(element.callback_query.id);
                    telegramAPI_1.sendMessage(this.chat_id, "Query result is too old, please submit new one");
                });
            }
            else
                this.callbackQueryHandler(element.callback_query, action[0], action[1]);
        }
    }
    messageHandler(text) {
        if (text === "/start") {
            telegramAPI_1.sendMessage(this.chat_id, "Драсьте");
        }
        else if (text === "/menu") {
            this.menu();
        }
        else if (text === "/fav") {
            this.favorites();
        }
        else if (text && text.length > 2) {
            vesselsAPI_1.default.find(encodeURI(text))
                .then((vessels) => {
                /\d{7}|\d{9}/.test(text) ? this.vesselInfo(vessels) : this.vesselFoundList(vessels);
            })
                .catch(() => telegramAPI_1.sendMessage(this.chat_id, "Oops error happend, please try later"));
        }
    }
    menu() {
        let output = "Please select from the following options 👇";
        let inline_keyboard = [];
        inline_keyboard.push([
            // {
            //     text: `🔎 Search`, callback_data: CallbackQueryActions.search
            // },  
            {
                text: `🚢 My fleet`, callback_data: telegramBot_t_1.CallbackQueryActions.favorites
            }, {
                text: `💬 Cotact us`, url: telegramAPI_1.contactUsURL
            }
        ]);
        telegramAPI_1.sendMessage(this.chat_id, output, { inline_keyboard });
    }
    vesselFoundList(vessels) {
        let text = "Vessels not found";
        if (vessels.length) {
            vessels.length > 15 && (vessels.length = 15);
            text = `Found vessels: ${vessels.length} 🔎🚢\nPlease select from the following 👇`;
        }
        this.vesselButtonList(text, vessels);
    }
    favorites() {
        return models_1.Favorite.findAll({ where: { user_id: this.chat_id } }).then((data) => {
            this.vesselButtonList("🚢 My fleet", data);
        });
    }
    vesselInfo(vessel) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = "";
            telegramBot_t_1.VesselPropertyArray.forEach((property, i) => {
                if (!(i % 2))
                    return;
                else if (property == telegramBot_t_1.VesselProperty.estimatedArrivalDate || property == telegramBot_t_1.VesselProperty.lastReportDate)
                    vessel[property] = (new Date(vessel[property])).toLocaleString();
                else if (vessel[property])
                    output += `${property}: ${[vessel[property]]}\n`;
            });
            let inline_keyboard = [];
            let favoriteVessel = yield this.favoriteFindOne(vessel);
            inline_keyboard.push([
                {
                    text: `🧭 Location`, callback_data: telegramBot_t_1.CallbackQueryActions.location
                },
                {
                    text: `📷 Vessel photo`, callback_data: telegramBot_t_1.CallbackQueryActions.photo
                },
                favoriteVessel ?
                    { text: `❌ Remove vessel`, callback_data: telegramBot_t_1.CallbackQueryActions.favoritesRemove + ":" + favoriteVessel.id } :
                    { text: `⭐ Add to my fleet`, callback_data: telegramBot_t_1.CallbackQueryActions.favoritesAdd },
            ]);
            let message = yield telegramAPI_1.sendMessage(this.chat_id, output, { inline_keyboard });
            this.queryCreate(message, vessel);
        });
    }
    vesselButtonList(text, vessels) {
        return __awaiter(this, void 0, void 0, function* () {
            let array = [];
            vessels.forEach((element, i) => {
                array.push({ text: `${countryFlag(element.country)} ${element.name}`, callback_data: telegramBot_t_1.CallbackQueryActions.href + ":" + i });
            });
            let message = yield telegramAPI_1.sendMessage(this.chat_id, text, { inline_keyboard: this.buttonsGrid(array, 3) });
            this.queryCreate(message, vessels);
        });
    }
    buttonsGrid(array, maxColumn) {
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
    queryCreate(message, data) {
        let message_id = message.result.message_id;
        models_1.Query.create({
            message_id,
            chat_id: this.chat_id,
            data: JSON.stringify(data),
        }).catch(err => console.error(err));
    }
    favoriteFindOne(data) {
        return models_1.Favorite.findOne({
            where: {
                [sequelize_1.Op.and]: { user_id: this.chat_id },
                [sequelize_1.Op.or]: [{ href: data[telegramBot_t_1.VesselProperty.href] }, { mmsi: data[telegramBot_t_1.VesselProperty.MMSI] }, { name: data[telegramBot_t_1.VesselProperty.name], country: data[telegramBot_t_1.VesselProperty.flag] }],
            }
        });
    }
    callbackQueryHandler(callback_query, action, href, data, payload) {
        switch (action) {
            case telegramBot_t_1.CallbackQueryActions.search:
                telegramAPI_1.answerCallbackQuery(callback_query.id);
                break;
            case telegramBot_t_1.CallbackQueryActions.favorites:
                this.favorites().finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.href:
                vesselsAPI_1.default.getOne(href)
                    .then((vessel) => this.vesselInfo(vessel))
                    .catch(() => telegramAPI_1.sendMessage(this.chat_id, "Oops error happend, please try later"))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.location:
                telegramAPI_1.sendLocation(this.chat_id, data["Coordinates"])
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.photo:
                vesselsAPI_1.default.imageFind(data[telegramBot_t_1.VesselProperty.MMSI])
                    .then((imgSrc) => telegramAPI_1.sendPhoto(this.chat_id, imgSrc))
                    .catch(() => telegramAPI_1.sendMessage(this.chat_id, "Sorry, photo not available for this vessel"))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.favoritesAdd:
                this.favoriteFindOne(data).then(fav => {
                    fav || models_1.Favorite.create({
                        user_id: this.chat_id,
                        name: data[telegramBot_t_1.VesselProperty.name],
                        country: data[telegramBot_t_1.VesselProperty.flag],
                        href
                    });
                })
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.favoritesRemove:
                models_1.Favorite.findByPk(href).then(fav => fav && fav.destroy())
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
        }
    }
}
//# sourceMappingURL=telegramBot.js.map