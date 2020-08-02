"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const req = require("request-promise");
const telegramApi = process.env.telegram_API_URL + process.env.telegram_API_Key + "/";
const request = req.defaults({
    baseUrl: telegramApi,
    json: true,
});
function answerCallbackQuery(callback_query_id, text, show_alert, url, cache_time) {
    return request
        .get({
        url: "/answerCallbackQuery",
        qs: {
            callback_query_id,
        },
    })
        .catch((err) => console.error(err));
}
exports.answerCallbackQuery = answerCallbackQuery;
function sendMessage(chat_id, text, reply_markup) {
    const message = Object.assign({ chat_id,
        text }, (reply_markup && { reply_markup: JSON.stringify(reply_markup) }));
    return request
        .get({
        url: "/sendMessage",
        qs: message,
    })
        .catch((err) => console.error(err));
}
exports.sendMessage = sendMessage;
function sendLocation(chat_id, coordinates) {
    if (coordinates && !coordinates.latitude && !coordinates.longitude) {
        return Promise.reject(new Error("coordinates not available"));
    }
    return request
        .get({
        url: "/sendLocation",
        qs: {
            chat_id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
        },
    })
        .catch((err) => console.error(err));
}
exports.sendLocation = sendLocation;
function sendPhoto(chat_id, photo) {
    return request
        .get({
        url: "/sendPhoto",
        qs: {
            chat_id,
            photo,
        },
    })
        .catch((err) => console.error(err));
}
exports.sendPhoto = sendPhoto;
function subscribe(callback) {
    let offset = null;
    const func = function (error, httpResponse, data) {
        if (error || (httpResponse && httpResponse.statusCode !== 200)) {
            error && console.error(error);
            httpResponse && console.warn(`httpResponse.statusCode: ${httpResponse.statusCode}`);
            // setInterval(getUpdates, 120 * 1000)
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
                timeout: 120,
            },
        }, func);
    }
}
exports.subscribe = subscribe;
//# sourceMappingURL=telegramAPI.js.map