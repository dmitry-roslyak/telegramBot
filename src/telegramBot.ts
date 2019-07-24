import { Telegram, sendLocation, sendMessage, InlineKeyboardMarkup, answerCallbackQuery } from "./telegram";
import vesselAPI from "./vesselsAPI";

interface Vessel {
    [property: string]: string
}

interface VesselsListItem {
    href: string
    name: string
    country: string
}

interface VesselsList extends Array<VesselsListItem> { }

Telegram(function (messages) {
    messages.forEach((element: any) => {
        console.log(`callback_query: ${!!element.callback_query}`)
        console.log(element)
        if (element.message && element.message.text === "test") {
            test(element.message.from.id, "Its working")
            // sendMessage(element.message.from.id, "Its working")
        } else if (element.callback_query) {
            let data = JSON.parse(element.callback_query.data)
            let chat_id = element.callback_query.from.id;
            if (data["href"]) {
                vesselAPI.getOne(data["href"])
                    .then((vessel: any) => vesselInfo(chat_id, vessel))
                    .catch(() => sendMessage(chat_id, "Oops error happend, please try later"))
            } else if (data["locationShow"]) {
                sendLocation(element.callback_query.from.id, data["locationShow"])
            } else if (data["vesselFavoriteAdd"]) {
                sendMessage(element.callback_query.from.id, "My fleet currently not available")
            }
            answerCallbackQuery(element.callback_query.id)
        } else if (element.message && element.message.text === "/start") {
            sendMessage(element.message.from.id, "Драсьте")
        } else if (element.message && element.message.text && element.message.text.includes('/')) {
            sendMessage(element.message.from.id, "Messages with format /commands, currently not available")
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

    vessels.forEach((element, i) => {
        let cbData = JSON.stringify({
            'href': element.href
        })
        cbData = cbData.length > 64 ? "0" : cbData
        i < 9 && inline_keyboard.push([{ text: `${i}) ${element.name}(${element.country})`, callback_data: cbData }])
        // output += `${i}) ${element.name}(${element.country})\n`
    });

    sendMessage(chat_id, text, { inline_keyboard })
}

function vesselInfo(chat_id: number, vessel: Vessel) {
    let output = "";

    for (const key in vessel) {
        if ("Coordinates" == key) continue;
        output += `${key}: ${vessel[key]}\n`
    }

    let inline_keyboard: InlineKeyboardMarkup = []

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
    ])

    sendMessage(chat_id, output, { inline_keyboard })
}

function test(chat_id: number, data: any) {
    let inline_keyboard: InlineKeyboardMarkup = []

    inline_keyboard.push([
        {
            text: `🗺 Show location`, callback_data: "1"
        },
        {
            text: `⭐ Add to my fleet`, callback_data: "2"
        },
    ])
    sendMessage(chat_id, data, { inline_keyboard })
}
