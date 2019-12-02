"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegramAPI_1 = require("./telegramAPI");
const vesselsAPI_1 = require("./vesselsAPI");
const telegramBot_t_1 = require("./telegramBot.t");
const db_1 = require("./db");
const telegramBotUI_1 = require("./telegramBotUI");
const answerCallbackActions = [telegramBot_t_1.CallbackQueryActions.href, telegramBot_t_1.CallbackQueryActions.location, telegramBot_t_1.CallbackQueryActions.photo, telegramBot_t_1.CallbackQueryActions.favoritesAdd, telegramBot_t_1.CallbackQueryActions.favoritesRemove];
telegramAPI_1.subscribe(function (messages) {
    messages.forEach(element => new UpdateHandler(element));
});
class UpdateHandler {
    constructor(element) {
        UpdateHandler._self = this;
        if (element.message) {
            this.user = element.message.from;
            this.commandsHandler(element.message.text);
        }
        else if (element.callback_query && element.callback_query.message) {
            this.user = element.callback_query.from;
            let action = element.callback_query.data.split(":");
            if (answerCallbackActions.includes(action[0])) {
                db_1.DB.queryfindOne(this.chat_id, element.callback_query.message.message_id).then((query) => {
                    if (!query)
                        return Promise.reject("Query not found");
                    let data = JSON.parse(query.data);
                    let href = action.length == 2 ? data[action[1]]["href"] : data["href"];
                    this.callbackQueryHandler(element.callback_query, action[0], href, data);
                }).catch((err) => {
                    console.error(err);
                    telegramAPI_1.answerCallbackQuery(element.callback_query.id);
                    this.sendMessage(telegramBot_t_1.UI_template.queryIsTooOld);
                });
            }
            else
                this.callbackQueryHandler(element.callback_query, action[0]);
        }
    }
    get chat_id() {
        return this._chat_id;
    }
    set user(user) {
        this._user = user;
        this._chat_id = user.id;
        this.UI = new telegramBotUI_1.UI(user);
    }
    commandsHandler(text) {
        if (text === "/start") {
            this.sendMessage(telegramBot_t_1.UI_template.hello);
        }
        else if (text === "/menu") {
            this.sendMessage(telegramBot_t_1.UI_template.menu);
        }
        else if (text === "/fav" || text === "/fleet") {
            db_1.DB.favorites(this.chat_id)
                .then((vessels) => {
                vessels.length ? this.sendMessage(telegramBot_t_1.UI_template.vesselListFav, vessels) : this.sendMessage(telegramBot_t_1.UI_template.favEmpty);
            })
                .catch(err => console.error(err));
        }
        else if (text && text.length > 2) {
            if (/\d{7}|\d{9}/.test(text)) {
                vesselsAPI_1.default.find(encodeURI(text))
                    .then(this.vesselWithFavorite)
                    .then((vessel) => this.sendMessage(telegramBot_t_1.UI_template.vesselInfo, vessel))
                    .catch(() => this.sendMessage(telegramBot_t_1.UI_template.errorTrylater));
            }
            else {
                vesselsAPI_1.default.find(encodeURI(text))
                    .then((vessels) => this.sendMessage(telegramBot_t_1.UI_template.vesselList, vessels))
                    .catch(() => this.sendMessage(telegramBot_t_1.UI_template.errorTrylater));
            }
        }
    }
    callbackQueryHandler(callback_query, action, href, data, payload) {
        switch (action) {
            case telegramBot_t_1.CallbackQueryActions.search:
                telegramAPI_1.answerCallbackQuery(callback_query.id);
                break;
            case telegramBot_t_1.CallbackQueryActions.favorites:
                db_1.DB.favorites(this.chat_id)
                    .catch(() => this.sendMessage(telegramBot_t_1.UI_template.errorTrylater))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.href:
                vesselsAPI_1.default.getOne(href)
                    .then(this.vesselWithFavorite)
                    .then((vessel) => this.sendMessage(telegramBot_t_1.UI_template.vesselInfo, vessel))
                    .catch(() => this.sendMessage(telegramBot_t_1.UI_template.errorTrylater))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.location:
                vesselsAPI_1.default.getOne(href)
                    .then((vessel) => telegramAPI_1.sendLocation(this.chat_id, vessel["Coordinates"]))
                    .catch(() => this.sendMessage(telegramBot_t_1.UI_template.errorTrylater))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.photo:
                vesselsAPI_1.default.imageFind(data[telegramBot_t_1.VesselProperty.MMSI])
                    .then((imgSrc) => telegramAPI_1.sendPhoto(this.chat_id, imgSrc))
                    .catch(() => this.sendMessage(telegramBot_t_1.UI_template.photoNotAvailable))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.favoritesAdd:
                db_1.DB.favoriteFindOneOrCreate(this.chat_id, data, href)
                    .then(() => this.sendMessage(telegramBot_t_1.UI_template.favAdd))
                    .catch(err => console.error(err))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
            case telegramBot_t_1.CallbackQueryActions.favoritesRemove:
                db_1.DB.favoriteRemove(this.chat_id, href)
                    .then(() => this.sendMessage(telegramBot_t_1.UI_template.favRemove))
                    .catch(err => console.error(err))
                    .finally(() => telegramAPI_1.answerCallbackQuery(callback_query.id));
                break;
        }
    }
    vesselWithFavorite(vessel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return Promise.resolve(Object.assign(Object.assign({}, vessel), { isFavorite: !!(yield db_1.DB.favoriteFindOne(UpdateHandler._self.chat_id, vessel)) }));
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    sendMessage(templateMessage, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let message;
            let localized = this.UI.localize(templateMessage, data);
            try {
                if (localized.inline_keyboard) {
                    message = yield telegramAPI_1.sendMessage(this.chat_id, localized.text, { inline_keyboard: localized.inline_keyboard });
                }
                else {
                    message = yield telegramAPI_1.sendMessage(this.chat_id, localized.text);
                }
                data && db_1.DB.queryCreate(this.chat_id, message, data);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
//# sourceMappingURL=telegramBot.js.map