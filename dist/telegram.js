"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req = require("request");
const { telegram } = require("../env.json");
const telegramApi = telegram.apiUrl + telegram.apiKey + "/";
const request = req.defaults({
    baseUrl: telegramApi,
    json: true
});
class InlineKeyboardMarkup extends Array {
}
exports.InlineKeyboardMarkup = InlineKeyboardMarkup;
function sendMessage(message) {
    request.get({
        url: "/sendMessage",
        qs: message
    }, function (error, httpResponse, body) {
        // console.log(body)
    });
}
exports.sendMessage = sendMessage;
function sendMessageText(chat_id, text = "EMPTY") {
    // console.log(chat_id)
    // console.log(text)
    request.get({
        url: "/sendMessage",
        qs: {
            chat_id,
            text: text
        }
    }, function (error, httpResponse, body) {
        console.log(body);
    });
}
exports.sendMessageText = sendMessageText;
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