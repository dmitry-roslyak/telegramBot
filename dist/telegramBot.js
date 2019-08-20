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
const telegramBot_t_1 = require("./telegramBot.t");
const db_1 = require("./db");
const answerCallbackActions = [telegramBot_t_1.CallbackQueryActions.href, telegramBot_t_1.CallbackQueryActions.location, telegramBot_t_1.CallbackQueryActions.photo, telegramBot_t_1.CallbackQueryActions.favoritesAdd, telegramBot_t_1.CallbackQueryActions.favoritesRemove];
const countries = require("../countries.json");
const botName = process.env.tg_bot_link.match(/(?<=t.me\/)[^]+/);
const msg = `, welcome to ${botName ? botName[0] : ""}!\n Here is my abilities:
* Find vessels by name, mmsi/imo.
* Show vessel latest info, location or view a photo.
* Add vessels to your fleet. /fav to see fleet list.
Send any message to start searching  🔎`;
function countryFlag(country) {
    let res = countries.find((el) => el.common == country || el.cca3 == country);
    return res && res.flag || "";
}
telegramAPI_1.subscribe(function (messages) {
    messages.forEach(element => new UpdateHandler(element));
});
class UpdateHandler {
    get chat_id() {
        return this._chat_id;
    }
    set user(user) {
        this._user = user;
        this._chat_id = user.id;
        this.db = new db_1.DB(user.id);
    }
    constructor(element) {
        if (element.message) {
            this.user = element.message.from;
            this.messageHandler(element.message.text);
        }
        else if (element.callback_query && element.callback_query.message) {
            this.user = element.callback_query.from;
            let action = element.callback_query.data.split(":");
            if (answerCallbackActions.includes(action[0])) {
                this.db.queryfindOne(element.callback_query.message.message_id).then((query) => {
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
                this.callbackQueryHandler(element.callback_query, action[0]);
        }
    }
    messageHandler(text) {
        if (text === "/start") {
            telegramAPI_1.sendMessage(this.chat_id, `👋 Hello ${this._user.first_name} ${this._user.last_name}${msg}`);
        }
        else if (text === "/menu") {
            this.menu();
        }
        else if (text === "/fav") {
            this.db.favorites()
                .then((data) => {
                this.vesselButtonList("🚢 My fleet", data);
            })
                .catch(err => console.error(err));
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
            let favoriteVessel = yield this.db.favoriteFindOne(vessel)
                .catch(err => console.error(err));
            inline_keyboard.push([
                {
                    text: `🧭 Location`, callback_data: telegramBot_t_1.CallbackQueryActions.location
                },
                {
                    text: `📷 Vessel photo`, callback_data: telegramBot_t_1.CallbackQueryActions.photo
                },
                favoriteVessel ?
                    { text: `❌ Remove vessel`, callback_data: telegramBot_t_1.CallbackQueryActions.favoritesRemove } :
                    { text: `⭐ Add to my fleet`, callback_data: telegramBot_t_1.CallbackQueryActions.favoritesAdd },
            ]);
            let message = yield telegramAPI_1.sendMessage(this.chat_id, output, { inline_keyboard });
            this.db.queryCreate(message, vessel)
                .catch(err => console.error(err));
        });
    }
    vesselButtonList(text, vessels) {
        return __awaiter(this, void 0, void 0, function* () {
            let array = [];
            vessels.forEach((element, i) => {
                array.push({ text: `${countryFlag(element.country)} ${element.name}`, callback_data: telegramBot_t_1.CallbackQueryActions.href + ":" + i });
            });
            let message = yield telegramAPI_1.sendMessage(this.chat_id, text, { inline_keyboard: this.buttonsGrid(array, 3) });
            this.db.queryCreate(message, vessels)
                .catch(err => console.error(err));
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
    callbackQueryHandler(callback_query, action, href, data, payload) {
        switch (action) {
            case telegramBot_t_1.CallbackQueryActions.search:
                telegramAPI_1.answerCallbackQuery(callback_query.id);
                break;
            case telegramBot_t_1.CallbackQueryActions.favorites:
                this.db.favorites()
                    .catch(() => telegramAPI_1.sendMessage(this.chat_id, "Oops error happend, please try later"))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.href:
                vesselsAPI_1.default.getOne(href)
                    .then((vessel) => this.vesselInfo(vessel))
                    .catch(() => telegramAPI_1.sendMessage(this.chat_id, "Oops error happend, please try later"))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.location:
                vesselsAPI_1.default.getOne(href)
                    .then((vessel) => telegramAPI_1.sendLocation(this.chat_id, vessel["Coordinates"]))
                    .catch(() => telegramAPI_1.sendMessage(this.chat_id, "Oops error happend, please try later"))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.photo:
                vesselsAPI_1.default.imageFind(data[telegramBot_t_1.VesselProperty.MMSI])
                    .then((imgSrc) => telegramAPI_1.sendPhoto(this.chat_id, imgSrc))
                    .catch(() => telegramAPI_1.sendMessage(this.chat_id, "Sorry, photo not available for this vessel"))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.favoritesAdd:
                this.db.favoriteFindOneOrCreate(data, href)
                    .catch(err => console.error(err))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.favoritesRemove:
                this.db.favoriteRemove(href)
                    .catch(err => console.error(err))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
        }
    }
}
//# sourceMappingURL=telegramBot.js.map