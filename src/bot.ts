import { Telegram, sendLocation, sendMessage, InlineKeyboardMarkup, Message } from "./telegram";
import * as req from "request";

const {
    vesselApi
} = require("../env.json");

const request = req.defaults({
    baseUrl: vesselApi,
    json: true
})
// let commandQuery: any = {}

let a = Telegram(function (messages) {
    messages.forEach((element: any) => {
        console.log(`callback_query: ${!!element.callback_query}`)
        console.log(element)
        // if (element.message && commandQuery[element.message.from.id] && commandQuery[element.message.from.id].length){}
        if (element.message && element.message.text === "vasia") {
            test(element.message.from.id, "bomj")
            // sendMessage(element.message.from.id, "bomj")
        } else if (element.callback_query) {
            let data = JSON.parse(element.callback_query.data)
            if (data["href"]) {
                vesselInfo(element.callback_query.from.id, data["href"])
            } else if (data["locationShow"]) {
                sendLocation(element.callback_query.from.id, data["locationShow"])
            } else if (data["vesselFavoriteAdd"]) {
                sendMessage(element.callback_query.from.id, "My fleet currently not available")
            }
        } else if (element.message && element.message.text === "/start") {
            sendMessage(element.message.from.id, "Драсьте")
        } else if (element.message && element.message.text.includes('/')) {
            sendMessage(element.message.from.id, "Messages with format /commands, currently not available")
        } else if (element.message && element.message.text) {
            vesselSearch(element.message.from.id, element.message.text)
        }
    });
})
function vesselInfoSend(chat_id: number, data: any) {
    let output = "";

    for (const key in data) {
        if ("Coordinates" == key) continue;
        output += `${key}: ${data[key]}\n`
    }

    let inline_keyboard: InlineKeyboardMarkup = []

    inline_keyboard.push([
        {
            text: `🗺 Show location`, callback_data: JSON.stringify({
                'locationShow': data["Coordinates"]
            })
        },
        {
            text: `⭐ Add to my fleet`, callback_data: JSON.stringify({
                'vesselFavoriteAdd': data["IMO / MMSI"]
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


function vesselInfo(chat_id: number, vesselHref: string) {
    request.get({
        url: "/view",
        qs: {
            vesselHref
        }
    }, function (error, httpResponse, data) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            console.log(`error ${error}`)
            console.error(`httpResponse.statusCode: ${httpResponse && httpResponse.statusCode}`)
            sendMessage(chat_id, "Oops error happend, please try later")
            return;
        }
        vesselInfoSend(chat_id, data)
    })
}

function vesselSearch(chat_id: number, text: string) {
    request.get({
        url: "/search/" + text,
    }, function (error, httpResponse, data) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            console.log(`error ${error}`)
            console.error(`httpResponse.statusCode: ${httpResponse && httpResponse.statusCode}`)
            sendMessage(chat_id, "Oops error happend, please try later")
            return;
        }

        if (/\d{7}|\d{9}/.test(text)) {
            vesselInfoSend(chat_id, data)
        } else {
            let inline_keyboard: InlineKeyboardMarkup = []
            let text = "Vessels not found"
            if (data.length) {
                text = `
                    Found vessels: ${data.length}\n
                    Please select from the following:
                `;
            }

            data.forEach((element: any, i: number) => {
                let cbData = JSON.stringify({
                    'href': element.href
                })
                cbData = cbData.length > 64 ? "0" : cbData
                i < 9 && inline_keyboard.push([{ text: `${i}) ${element.name}(${element.country})`, callback_data: cbData }])
                // output += `${i}) ${element.name}(${element.country})\n`
            });

            sendMessage(chat_id, text, { inline_keyboard })
        }
    })
}
// function addQuery(res: any) {
//     if (commandQuery[res.result.chat.id]) {
//         commandQuery[res.result.chat.id].push("search result")
//     } else {
//         commandQuery[res.result.chat.id] = []
//     }
// }

export default a