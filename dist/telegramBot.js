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
const answerCallbackActions = Object.keys(telegramBot_t_1.CallbackQueryActions);
telegramAPI_1.subscribe(function (messages) {
    messages.forEach((element) => new UpdateHandler(element));
});
class UpdateHandler {
    constructor(element) {
        if (element.message) {
            this.user = element.message.from;
            this.commandsHandler(element.message.text);
        }
        else if (element.callback_query && element.callback_query.message) {
            this.user = element.callback_query.from;
            const [action, index] = element.callback_query.data.split(":");
            if (answerCallbackActions.includes(action)) {
                db_1.DB.queryfindOne(this.chat_id, element.callback_query.message.message_id)
                    .then((query) => {
                    if (!query) {
                        return this.sendMessage(telegramBot_t_1.UI_template.queryIsTooOld);
                    }
                    const data = JSON.parse(query.data);
                    return this.callbackQueryHandler(action, data instanceof Array ? data[+index] : data);
                })
                    .then(() => telegramAPI_1.answerCallbackQuery(element.callback_query.id));
            }
            else
                this.sendMessage(telegramBot_t_1.UI_template.queryIsTooOld);
        }
    }
    get chat_id() {
        return this._chat_id;
    }
    // eslint-disable-next-line accessor-pairs
    set user(user) {
        // this._user = user;
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
            db_1.DB.favorites(this.chat_id).then((vessels) => {
                vessels.length ? this.sendMessage(telegramBot_t_1.UI_template.vesselListFav, vessels) : this.sendMessage(telegramBot_t_1.UI_template.favEmpty);
            });
        }
        else if (text && text.length > 2) {
            if (/\d{7}|\d{9}/.test(text)) {
                vesselsAPI_1.default
                    .find(text)
                    .then(this.vesselWithFavorite.bind(this))
                    .then((vessel) => vessel ? this.sendMessage(telegramBot_t_1.UI_template.vesselInfo, vessel) : this.sendMessage(telegramBot_t_1.UI_template.notFound));
            }
            else {
                vesselsAPI_1.default
                    .find(text)
                    .then((vessels) => vessels && vessels.length
                    ? this.sendMessage(telegramBot_t_1.UI_template.vesselList, vessels)
                    : this.sendMessage(telegramBot_t_1.UI_template.notFound));
            }
        }
    }
    callbackQueryHandler(action, data) {
        switch (action) {
            case telegramBot_t_1.CallbackQueryActions.href:
                return vesselsAPI_1.default
                    .getOne(data[telegramBot_t_1.VesselProperty.href])
                    .then(this.vesselWithFavorite.bind(this))
                    .then((vessel) => vessel ? this.sendMessage(telegramBot_t_1.UI_template.vesselInfo, vessel) : this.sendMessage(telegramBot_t_1.UI_template.errorTrylater));
            case telegramBot_t_1.CallbackQueryActions.location:
                return vesselsAPI_1.default
                    .getOne(data[telegramBot_t_1.VesselProperty.href])
                    .then((vessel) => vessel ? telegramAPI_1.sendLocation(this.chat_id, vessel.Coordinates) : this.sendMessage(telegramBot_t_1.UI_template.errorTrylater));
            case telegramBot_t_1.CallbackQueryActions.photo:
                return vesselsAPI_1.default
                    .imageFind(data[telegramBot_t_1.VesselProperty.MMSI])
                    .then((imgSrc) => imgSrc ? telegramAPI_1.sendPhoto(this.chat_id, imgSrc) : this.sendMessage(telegramBot_t_1.UI_template.photoNotAvailable));
            case telegramBot_t_1.CallbackQueryActions.favoritesAdd:
                return db_1.DB.favoriteFindOneOrCreate(this.chat_id, data).then((fav) => this.sendMessage(fav ? telegramBot_t_1.UI_template.favAdd : telegramBot_t_1.UI_template.errorTrylater));
            case telegramBot_t_1.CallbackQueryActions.favoritesRemove:
                return db_1.DB.favoriteRemove(this.chat_id, data).then(() => this.sendMessage(telegramBot_t_1.UI_template.favRemove));
        }
    }
    vesselWithFavorite(vessel) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(Object.assign(Object.assign({}, vessel), { isFavorite: !!(yield db_1.DB.favoriteFindOne(this.chat_id, vessel)) }));
        });
    }
    sendMessage(templateMessage, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let message;
            const localized = this.UI.localize(templateMessage, data);
            if (localized.inline_keyboard) {
                message = yield telegramAPI_1.sendMessage(this.chat_id, localized.text, { inline_keyboard: localized.inline_keyboard });
            }
            else {
                message = yield telegramAPI_1.sendMessage(this.chat_id, localized.text);
            }
            data && message.result && db_1.DB.queryCreate(this.chat_id, message.result.message_id, data);
        });
    }
}
//# sourceMappingURL=telegramBot.js.map