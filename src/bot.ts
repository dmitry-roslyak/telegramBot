import { Telegram, sendLocation, sendMessage, InlineKeyboardMarkup } from "./telegram";
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
            sendMessage({ chat_id: element.message.from.id, text: "bomj" })
        } else if (element.callback_query) {
            vesselInfo(element.callback_query.from.id, element.callback_query.data)
        } else if (element.message && element.message.text === "/start") {
            sendMessage({ chat_id: element.message.from.id, text: "Драсьте" })
        } else if (element.message && element.message.text.includes('/')) {
            sendMessage({ chat_id: element.message.from.id, text: "Messages with format /commands, currently not available" })
        } else if (element.message && element.message.text) {
            vesselSearch(element.message.from.id, element.message.text)
        }
    });
})
function vesselInfoSend(chat_id: number, data: any) {
    let output = "";

    for (const key in data) {
        if ("Coordinates" == key) break;
        output += `${key}: ${data[key]}\n`
    }

    sendMessage({ chat_id, text: output })
    sendLocation(chat_id, data["Coordinates"])
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
            sendMessage({ chat_id, text: "Oops error happend, please try later" })
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
            sendMessage({ chat_id, text: "Oops error happend, please try later" })
            return;
        }

        if (/\d{7}|\d{9}/.test(text)) {
            vesselInfoSend(chat_id, data)
        } else {
            let ar: InlineKeyboardMarkup = []

            data.forEach((element: any, i: number) => {
                i < 9 && ar.push([{ text: `${i}) ${element.name}(${element.country})`, callback_data: element.href }])
                // output += `${i}) ${element.name}(${element.country})\n`
            });
            // let rp = JSON.stringify({
            //     keyboard: [["Yes", "No"]]
            // })
            let text
            if (data.length) {
                text = `
                    Found vessels: ${data.length}\n
                    Please select from the following:
                `;
            } else text = "Vessels not found"

            let reply_markup = JSON.stringify({
                // force_reply: true,
                inline_keyboard: ar
            })
            sendMessage({ chat_id, text, reply_markup })
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