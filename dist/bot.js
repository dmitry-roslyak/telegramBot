"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegram_1 = require("./telegram");
const req = require("request");
const { vesselApi } = require("../env.json");
const request = req.defaults({
    baseUrl: vesselApi,
    json: true
});
// let commandQuery: any = {}
let a = telegram_1.Telegram(function (messages) {
    messages.forEach((element) => {
        console.log(`callback_query: ${!!element.callback_query}`);
        console.log(element);
        // if (element.message && commandQuery[element.message.from.id] && commandQuery[element.message.from.id].length){}
        if (element.message && element.message.text === "vasia") {
            telegram_1.sendMessage({ chat_id: element.message.from.id, text: "bomj" });
        }
        else if (element.callback_query) {
            vesselInfo(element.callback_query.from.id, element.callback_query.data);
        }
        else if (element.message && element.message.text === "/start") {
            telegram_1.sendMessage({ chat_id: element.message.from.id, text: "Драсьте" });
        }
        else if (element.message && element.message.text.includes('/')) {
            telegram_1.sendMessage({ chat_id: element.message.from.id, text: "Messages with format /commands, currently not available" });
        }
        else if (element.message && element.message.text) {
            vesselSearch(element.message.from.id, element.message.text);
        }
    });
});
function vesselInfoSend(chat_id, data) {
    let output = "";
    for (const key in data) {
        if ("Coordinates" == key)
            break;
        output += `${key}: ${data[key]}\n`;
    }
    telegram_1.sendMessage({ chat_id, text: output });
    telegram_1.sendLocation(chat_id, data["Coordinates"]);
}
function vesselInfo(chat_id, vesselHref) {
    request.get({
        url: "/view",
        qs: {
            vesselHref
        }
    }, function (error, httpResponse, data) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            console.log(`error ${error}`);
            console.error(`httpResponse.statusCode: ${httpResponse && httpResponse.statusCode}`);
            telegram_1.sendMessage({ chat_id, text: "Oops error happend, please try later" });
            return;
        }
        vesselInfoSend(chat_id, data);
    });
}
function vesselSearch(chat_id, text) {
    request.get({
        url: "/search/" + text,
    }, function (error, httpResponse, data) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            console.log(`error ${error}`);
            console.error(`httpResponse.statusCode: ${httpResponse && httpResponse.statusCode}`);
            telegram_1.sendMessage({ chat_id, text: "Oops error happend, please try later" });
            return;
        }
        if (/\d{7}|\d{9}/.test(text)) {
            vesselInfoSend(chat_id, data);
        }
        else {
            let ar = [];
            data.forEach((element, i) => {
                i < 9 && ar.push([{ text: `${i}) ${element.name}(${element.country})`, callback_data: element.href }]);
                // output += `${i}) ${element.name}(${element.country})\n`
            });
            // let rp = JSON.stringify({
            //     keyboard: [["Yes", "No"]]
            // })
            let text;
            if (data.length) {
                text = `
                    Found vessels: ${data.length}\n
                    Please select from the following:
                `;
            }
            else
                text = "Vessels not found";
            let reply_markup = JSON.stringify({
                // force_reply: true,
                inline_keyboard: ar
            });
            telegram_1.sendMessage({ chat_id, text, reply_markup });
        }
    });
}
// function addQuery(res: any) {
//     if (commandQuery[res.result.chat.id]) {
//         commandQuery[res.result.chat.id].push("search result")
//     } else {
//         commandQuery[res.result.chat.id] = []
//     }
// }
exports.default = a;
//# sourceMappingURL=bot.js.map