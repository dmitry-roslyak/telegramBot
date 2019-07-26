"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req = require("request");
const util = require('util');
const { telegram } = require("../env.json");
const telegramApi = telegram.apiUrl + telegram.apiKey + "/";
const request = req.defaults({
    baseUrl: telegramApi,
    json: true
});
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
    const requestGet = util.promisify(request.get);
    return requestGet({
        url: "/sendMessage",
        qs: message
    });
    // request.get({
    //     url: "/sendMessage",
    //     qs: message
    // }, function (error, httpResponse, body) {
    //     // console.log(body)
    // })
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
function subscribe(callback) {
    let offset = null;
    let func = function (error, httpResponse, data) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            error && console.error(error);
            httpResponse && console.warn(`httpResponse.statusCode: ${httpResponse.statusCode}`);
            setInterval(getUpdates, 120 * 1000);
            return;
        }
        offset = data.result.length ? data.result[data.result.length - 1].update_id + 1 : null;
        !data.ok && console.warn(data);
        data.result.length && callback(data.result);
        getUpdates();
    };
    getUpdates();
    function getUpdates() {
        request.get({
            url: "/getupdates",
            qs: {
                offset: offset,
                timeout: 120
            }
        }, func);
    }
}
exports.subscribe = subscribe;
//# sourceMappingURL=telegram.js.map