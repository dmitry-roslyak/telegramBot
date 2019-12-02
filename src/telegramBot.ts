import { sendLocation, sendMessage, answerCallbackQuery, subscribe, sendPhoto } from "./telegramAPI";
import vesselAPI from "./vesselsAPI";
import { CallbackQueryActions, Vessel, VesselProperty, UI_template } from "./telegramBot.t";
import { DB } from "./db";
import { UI } from "./telegramBotUI";

const answerCallbackActions = [CallbackQueryActions.href, CallbackQueryActions.location, CallbackQueryActions.photo, CallbackQueryActions.favoritesAdd, CallbackQueryActions.favoritesRemove] as string[]

subscribe(function (messages) {
    messages.forEach(element => new UpdateHandler(element));
})

class UpdateHandler {
    private _chat_id: number
    private _user: Telegram.User
    private UI: UI
    private static _self: UpdateHandler

    public get chat_id(): number {
        return this._chat_id
    }

    public set user(user: Telegram.User) {
        this._user = user
        this._chat_id = user.id;
        this.UI = new UI(user);
    }

    constructor(element: Telegram.Update) {
        UpdateHandler._self = this;
        if (element.message) {
            this.user = element.message.from
            this.commandsHandler(element.message.text);
        } else if (element.callback_query && element.callback_query.message) {
            this.user = element.callback_query.from
            let action = element.callback_query.data.split(":")
            if (answerCallbackActions.includes(action[0])) {
                DB.queryfindOne(this.chat_id, element.callback_query.message.message_id).then((query: any) => {
                    if (!query) return Promise.reject("Query not found")
                    let data = JSON.parse(query.data)
                    let href = action.length == 2 ? data[action[1]]["href"] : data["href"]
                    this.callbackQueryHandler(element.callback_query, action[0], href, data)
                }).catch((err) => {
                    console.error(err);
                    answerCallbackQuery(element.callback_query.id)
                    this.sendMessage(UI_template.queryIsTooOld)
                })
            } else
                this.callbackQueryHandler(element.callback_query, action[0])
        }
    }

    private commandsHandler(text: string) {
        if (text === "/start") {
            this.sendMessage(UI_template.hello);
        } else if (text === "/menu") {
            this.sendMessage(UI_template.menu)
        } else if (text === "/fav" || text === "/fleet") {
            DB.favorites(this.chat_id)
                .then((vessels: Array<any>) => {
                    vessels.length ? this.sendMessage(UI_template.vesselListFav, vessels) : this.sendMessage(UI_template.favEmpty)
                })
                .catch(err => console.error(err))
        } else if (text && text.length > 2) {
            if (/\d{7}|\d{9}/.test(text)) {
                vesselAPI.find(encodeURI(text))
                    .then(this.vesselWithFavorite)
                    .then((vessel: any) => this.sendMessage(UI_template.vesselInfo, vessel))
                    .catch(() => this.sendMessage(UI_template.errorTrylater))

            } else {
                vesselAPI.find(encodeURI(text))
                    .then((vessels: any) => this.sendMessage(UI_template.vesselList, vessels))
                    .catch(() => this.sendMessage(UI_template.errorTrylater))
            }
        }
    }

    private callbackQueryHandler(callback_query: Telegram.CallbackQuery, action: string, href?: string, data?: any, payload?: string) {
        switch (action) {
            case CallbackQueryActions.search:
                answerCallbackQuery(callback_query.id)
                break;
            case CallbackQueryActions.favorites:
                DB.favorites(this.chat_id)
                    .catch(() => this.sendMessage(UI_template.errorTrylater))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.href:
                vesselAPI.getOne(href)
                    .then(this.vesselWithFavorite)
                    .then((vessel: any) => this.sendMessage(UI_template.vesselInfo, vessel))
                    .catch(() => this.sendMessage(UI_template.errorTrylater))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.location:
                vesselAPI.getOne(href)
                    .then((vessel: any) => sendLocation(this.chat_id, vessel["Coordinates"]))
                    .catch(() => this.sendMessage(UI_template.errorTrylater))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.photo:
                vesselAPI.imageFind(data[VesselProperty.MMSI])
                    .then((imgSrc: string) => sendPhoto(this.chat_id, imgSrc))
                    .catch(() => this.sendMessage(UI_template.photoNotAvailable))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.favoritesAdd:
                DB.favoriteFindOneOrCreate(this.chat_id, data, href)
                    .then(() => this.sendMessage(UI_template.favAdd))
                    .catch(err => console.error(err))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.favoritesRemove:
                DB.favoriteRemove(this.chat_id, href)
                    .catch(err => console.error(err))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
        }
    }

    private async vesselWithFavorite(vessel: Vessel) {
        try {
            return Promise.resolve({
                ...vessel,
                isFavorite: !!await DB.favoriteFindOne(UpdateHandler._self.chat_id, vessel)
            })
        } catch (error) {
            console.log(error);
        }
    }

    private async sendMessage(templateMessage: UI_template, data?: any) {
        let message;
        let localized = this.UI.localize(templateMessage, data);
        try {
            if (localized.inline_keyboard) {
                message = await sendMessage(this.chat_id, localized.text, { inline_keyboard: localized.inline_keyboard })
            } else {
                message = await sendMessage(this.chat_id, localized.text)
            }
            data && DB.queryCreate(this.chat_id, message, data)
        } catch (error) {
            console.log(error)
        }
    }
}
