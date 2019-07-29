import { sendLocation, sendMessage, answerCallbackQuery, subscribe, InlineKeyboardMarkup, ReplyKeyboardMarkup } from "./telegram";
import vesselAPI from "./vesselsAPI";
import { Favorite, Query } from "./models";
import { Telegram } from "./telegram.1";

interface Vessel {
    [property: string]: string
}

interface VesselsListItem {
    href: string
    name: string
    country: string
}

interface VesselsList extends Array<VesselsListItem> { }

enum CallbackQueryActions {
    href = "href",
    location = "location",
    favoritesAdd = "favoritesAdd"
}

subscribe(function (messages) {
    messages.forEach(element => {
        console.log(element)
        if (element.message && element.message.text === "test") {
            sendMessage(element.message.from.id, "Its working")
        } else if (element.callback_query) {
            callbackQueryHandler(element.callback_query)
        } else if (element.message && element.message.text === "/start") {
            sendMessage(element.message.from.id, "Драсьте")
        } else if (element.message && element.message.text === "/fav") {
            Favorite.findAll({ where: { user_id: element.message.from.id } }).then((f: any) => {
                favorites(element.message.from.id, f)
            })
        } else if (element.message && element.message.text) {
            vesselAPI.find(element.message.text)
                .then((vessels: any) => {
                    /\d{7}|\d{9}/.test(element.message.text) ?
                        vesselInfo(element.message.from.id, vessels) :
                        vesselFoundList(element.message.from.id, vessels)
                })
                .catch(() => sendMessage(element.message.from.id, "Oops error happend, please try later"))
        }
    });
})

function vesselFoundList(chat_id: number, vessels: VesselsList) {
    let inline_keyboard: InlineKeyboardMarkup = []
    let text = "Vessels not found"

    if (vessels.length) {
        text = `
            Found vessels: ${vessels.length}\n
            Please select from the following:
        `;
    }
    // console.time("Found items buttons create")
    vessels.forEach((element, i) => {
        i < 9 && inline_keyboard.push([{ text: `${vesselFlag(element.country)} ${element.name}`, callback_data: CallbackQueryActions.href + ":" + i }])
    });
    // console.timeEnd("Found items buttons create")

    sendMessage(chat_id, text, { inline_keyboard }).then(queryCreate.bind({ chat_id, data: vessels }))
}

function vesselFlag(country: string) {
    return `(${country})`
}

function vesselInfo(chat_id: number, vessel: Vessel) {
    let output = "";

    for (const key in vessel) {
        if ("Coordinates" == key || "href" == key) continue;
        output += `${key}: ${vessel[key]}\n`
    }

    let inline_keyboard: InlineKeyboardMarkup = []

    inline_keyboard.push([
        {
            text: `🗺 Show location`, callback_data: CallbackQueryActions.location
        },
        {
            text: `⭐ Add to my fleet`, callback_data: CallbackQueryActions.favoritesAdd
        },
    ])
    sendMessage(chat_id, output, { inline_keyboard }).then(queryCreate.bind({ chat_id, data: vessel }))
}

function favorites(chat_id: number, data: Array<any>) {
    let inline_keyboard: InlineKeyboardMarkup = []

    let output = "🚢 My fleet:"
    data.forEach((element, i) => {
        inline_keyboard.push([
            {
                text: element.name, callback_data: CallbackQueryActions.href + ":" + i
            }
        ])
    });

    sendMessage(chat_id, output, { inline_keyboard }).then(queryCreate.bind({ chat_id, data: data }))
}

function queryCreate(message: any) {
    let message_id = message.body.result.message_id
    Query.create({
        message_id,
        chat_id: this.chat_id,
        data: JSON.stringify(this.data),
    })
}

function test(chat_id: number, data: string) {
    let keyboard: ReplyKeyboardMarkup = []

    keyboard.push([
        {
            text: `🗺 Show location`
        },
        {
            text: `⭐ Add to my fleet`
        },
    ])
    sendMessage(chat_id, data, { keyboard })
}

function callbackQueryHandler(callback_query: Telegram.CallbackQuery) {
    if (callback_query.message && callback_query.message.message_id) {
        Query.findOne({
            where: {
                chat_id: callback_query.from.id,
                message_id: callback_query.message.message_id
            }
        }).then((query: any) => {
            if (!query) return;
            let action = callback_query.data.split(":")
            let data = JSON.parse(query.data)
            let chat_id = callback_query.from.id
            let href = action.length == 2 ? data[action[1]]["href"] : data["href"]

            switch (action[0]) {
                case CallbackQueryActions.href:
                    vesselAPI.getOne(href)
                        .then((vessel: any) => vesselInfo(chat_id, vessel))
                        .catch(() => sendMessage(chat_id, "Oops error happend, please try later"))
                    break;
                case CallbackQueryActions.location:
                    sendLocation(chat_id, data["Coordinates"])
                    break;
                case CallbackQueryActions.favoritesAdd:
                    Favorite.create({
                        user_id: chat_id,
                        name: data["name"],
                        href
                    })
                    break;
            }
            answerCallbackQuery(callback_query.id)
        })
    }
}
