"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req = require("request");
const { telegram } = require("../env.json");
const telegramApi = telegram.apiUrl + telegram.apiKey + "/";
const request = req.defaults({
    baseUrl: telegramApi,
    json: true
});
// function sendMessage(message: Message) {
//     request.get({
//         url: "/sendMessage",
//         qs: message
//     }, function (error, httpResponse, body) {
//         // console.log(body)
//     })
// }
function answerCallbackQuery(callback_query_id, text, show_alert, url, cache_time) {
    request.get({
        url: "/answerCallbackQuery",
        qs: {
            callback_query_id
        }
    }, function (error, httpResponse, body) {
    });
}
exports.answerCallbackQuery = answerCallbackQuery;
function sendMessage(chat_id, text, reply_markup) {
    let message = Object.assign({ chat_id,
        text }, (reply_markup && { reply_markup: JSON.stringify(reply_markup) }));
    request.get({
        url: "/sendMessage",
        qs: message
    }, function (error, httpResponse, body) {
        // console.log(body)
    });
}
exports.sendMessage = sendMessage;
function sendLocation(chat_id, coordinates) {
    if (coordinates && !coordinates.latitude && !coordinates.longitude) {
        console.log("coordinates not available");
        return;
    }
    request.get({
        url: "/sendLocation",
        qs: {
            chat_id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        }
    }, function (error, httpResponse, body) {
        // console.log(body)
    });
}
exports.sendLocation = sendLocation;
function Telegram(callback) {
    let offset = null;
    function func(error, httpResponse, data) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            // if (error || httpResponse.statusCode != 200 || !data.length) {
            console.error(`httpResponse.statusCode: ${httpResponse.statusCode}`);
            console.error(error);
            return;
        }
        offset = data.result.length ? data.result[data.result.length - 1].update_id + 1 : null;
        console.log(data);
        data.result.length && callback.call(null, data.result);
        subscribe();
    }
    subscribe();
    function subscribe() {
        request.get({
            url: "/getupdates",
            qs: {
                offset: offset,
                timeout: 100
            }
        }, func);
    }
}
exports.Telegram = Telegram;
//# sourceMappingURL=telegram.js.map