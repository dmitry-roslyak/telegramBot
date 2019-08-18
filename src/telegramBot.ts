import { sendLocation, sendMessage, answerCallbackQuery, subscribe, InlineKeyboardMarkup, ReplyKeyboardMarkup, contactUsURL, sendPhoto } from "./telegramAPI";
import vesselAPI from "./vesselsAPI";
import { Telegram } from "./telegramAPI.t";
import { VesselsList, CallbackQueryActions, VesselPropertyArray, Vessel, VesselProperty, VesselMetricSystem } from "./telegramBot.t";
import { DB } from "./db";

const answerCallbackActions = [CallbackQueryActions.href, CallbackQueryActions.location, CallbackQueryActions.photo, CallbackQueryActions.favoritesAdd, CallbackQueryActions.favoritesRemove] as string[]
const countries = require("../countries.json")

function countryFlag(country: string) {
    let res = countries.find((el: any) => el.common == country || el.cca3 == country)
    return res && res.flag || ""
}

subscribe(function (messages) {
    messages.forEach(element => new UpdateHandler(element));
})

class UpdateHandler {
    private _chat_id: number
    private db: DB

    public get chat_id(): number {
        return this._chat_id
    }

    public set chat_id(chat_id: number) {
        this._chat_id = chat_id;
        this.db = new DB(chat_id)
    }

    constructor(element: Telegram.Update) {
        if (element.message) {
            this.chat_id = element.message.from.id
            this.messageHandler(element.message.text);
        } else if (element.callback_query && element.callback_query.message) {
            this.chat_id = element.callback_query.from.id
            let action = element.callback_query.data.split(":")
            if (answerCallbackActions.includes(action[0])) {
                this.db.queryfindOne(element.callback_query.message.message_id).then((query: any) => {
                    if (!query) return Promise.reject("Query not found")
                    let data = JSON.parse(query.data)
                    let href = action.length == 2 ? data[action[1]]["href"] : data["href"]
                    this.callbackQueryHandler(element.callback_query, action[0], href, data)
                }).catch((err) => {
                    console.error(err);
                    answerCallbackQuery(element.callback_query.id)
                    sendMessage(this.chat_id, "Query result is too old, please submit new one")
                })
            } else
                this.callbackQueryHandler(element.callback_query, action[0])
        }
    }

    private messageHandler(text: string) {
        if (text === "/start") {
            sendMessage(this.chat_id, "Драсьте")
        } else if (text === "/menu") {
            this.menu()
        } else if (text === "/fav") {
            this.db.favorites()
                .then((data: Array<any>) => {
                    this.vesselButtonList("🚢 My fleet", data)
                })
                .catch(err => console.error(err))
        } else if (text && text.length > 2) {
            vesselAPI.find(encodeURI(text))
                .then((vessels: any) => {
                    /\d{7}|\d{9}/.test(text) ? this.vesselInfo(vessels) : this.vesselFoundList(vessels)
                })
                .catch(() => sendMessage(this.chat_id, "Oops error happend, please try later"))
        }
    }

    private menu() {
        let output = "Please select from the following options 👇";

        let inline_keyboard: InlineKeyboardMarkup = []

        inline_keyboard.push([
            // {
            //     text: `🔎 Search`, callback_data: CallbackQueryActions.search
            // },  
            {
                text: `🚢 My fleet`, callback_data: CallbackQueryActions.favorites
            }, {
                text: `💬 Cotact us`, url: contactUsURL
            }
        ])

        sendMessage(this.chat_id, output, { inline_keyboard })
    }

    private vesselFoundList(vessels: VesselsList) {
        let text = "Vessels not found"

        if (vessels.length) {
            vessels.length > 15 && (vessels.length = 15)
            text = `Found vessels: ${vessels.length} 🔎🚢\nPlease select from the following 👇`;
        }

        this.vesselButtonList(text, vessels)
    }

    private async vesselInfo(vessel: Vessel) {
        let output = "";

        VesselPropertyArray.forEach((property, i) => {
            if (!(i % 2)) return
            else if (property == VesselProperty.estimatedArrivalDate || property == VesselProperty.lastReportDate)
                vessel[property] = (new Date(vessel[property])).toLocaleString()
            else if (vessel[property])
                output += `${property}: ${[vessel[property]]}\n`
        })

        let inline_keyboard: InlineKeyboardMarkup = []
        let favoriteVessel = await this.db.favoriteFindOne(vessel)
            .catch(err => console.error(err))

        inline_keyboard.push([
            {
                text: `🧭 Location`, callback_data: CallbackQueryActions.location
            },
            {
                text: `📷 Vessel photo`, callback_data: CallbackQueryActions.photo
            },
            favoriteVessel ?
                { text: `❌ Remove vessel`, callback_data: CallbackQueryActions.favoritesRemove } :
                { text: `⭐ Add to my fleet`, callback_data: CallbackQueryActions.favoritesAdd }
            ,
        ])
        let message = await sendMessage(this.chat_id, output, { inline_keyboard })
        this.db.queryCreate(message, vessel)
            .catch(err => console.error(err))
    }

    private async vesselButtonList(text: string, vessels: VesselsList) {
        let array: any[] = []

        vessels.forEach((element, i) => {
            array.push({ text: `${countryFlag(element.country)} ${element.name}`, callback_data: CallbackQueryActions.href + ":" + i })
        });

        let message = await sendMessage(this.chat_id, text, { inline_keyboard: this.buttonsGrid(array, 3) })
        this.db.queryCreate(message, vessels)
            .catch(err => console.error(err))
    }

    private buttonsGrid(array: any[], maxColumn?: number) {
        let keyboard: InlineKeyboardMarkup = []
        for (let c = 0, i = 0; i < array.length; c++) {
            keyboard.push([])
            keyboard.forEach((el: any, index: number) => {
                if (c != index) return
                for (let j = 1; j <= maxColumn && i < array.length; j++ , i++) {
                    el.push(array[i])
                }
            })
        }
        return keyboard;
    }

    private callbackQueryHandler(callback_query: Telegram.CallbackQuery, action: string, href?: string, data?: any, payload?: string) {
        switch (action) {
            case CallbackQueryActions.search:
                answerCallbackQuery(callback_query.id)
                break;
            case CallbackQueryActions.favorites:
                this.db.favorites()
                    .catch(() => sendMessage(this.chat_id, "Oops error happend, please try later"))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.href:
                vesselAPI.getOne(href)
                    .then((vessel: any) => this.vesselInfo(vessel))
                    .catch(() => sendMessage(this.chat_id, "Oops error happend, please try later"))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.location:
                vesselAPI.getOne(href)
                    .then((vessel: any) => sendLocation(this.chat_id, vessel["Coordinates"]))
                    .catch(() => sendMessage(this.chat_id, "Oops error happend, please try later"))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.photo:
                vesselAPI.imageFind(data[VesselProperty.MMSI])
                    .then((imgSrc: string) => sendPhoto(this.chat_id, imgSrc))
                    .catch(() => sendMessage(this.chat_id, "Sorry, photo not available for this vessel"))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.favoritesAdd:
                this.db.favoriteFindOneOrCreate(data, href)
                    .catch(err => console.error(err))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
            case CallbackQueryActions.favoritesRemove:
                this.db.favoriteRemove(href)
                    .catch(err => console.error(err))
                    .finally(() => answerCallbackQuery(callback_query.id))
                break;
        }
    }
}
