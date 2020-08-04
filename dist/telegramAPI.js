"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const legacyURL = require("url");
const telegramApi = process.env.telegram_API_URL + process.env.telegram_API_Key + "/";
function answerCallbackQuery(callback_query_id
// text?: string,
// show_alert?: boolean,
// url?: string,
// cache_time?: number
) {
    const url = legacyURL.format({
        pathname: telegramApi + "answerCallbackQuery",
        query: { callback_query_id },
    });
    return node_fetch_1.default(url)
        .then((res) => res.json())
        .catch((err) => console.error(err));
}
exports.answerCallbackQuery = answerCallbackQuery;
function sendMessage(chat_id, text, reply_markup) {
    const url = legacyURL.format({
        pathname: telegramApi + "sendMessage",
        query: Object.assign({ chat_id,
            text }, (reply_markup && { reply_markup: JSON.stringify(reply_markup) })),
    });
    return node_fetch_1.default(url)
        .then((res) => res.json())
        .catch((err) => console.error(err));
}
exports.sendMessage = sendMessage;
function sendLocation(chat_id, coordinates) {
    const url = legacyURL.format({
        pathname: telegramApi + "sendLocation",
        query: {
            chat_id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
        },
    });
    return node_fetch_1.default(url)
        .then((res) => res.json())
        .catch((err) => console.error(err));
}
exports.sendLocation = sendLocation;
function sendPhoto(chat_id, photo) {
    const url = legacyURL.format({
        pathname: telegramApi + "sendPhoto",
        query: {
            chat_id,
            photo,
        },
    });
    return node_fetch_1.default(url)
        .then((res) => res.json())
        .catch((err) => console.error(err));
}
exports.sendPhoto = sendPhoto;
function subscribe(callback) {
    function getUpdates(offset) {
        const url = legacyURL.format({
            pathname: telegramApi + "getupdates",
            query: {
                offset,
                timeout: 120,
            },
        });
        node_fetch_1.default(url)
            .then((res) => res.json())
            .then((data) => {
            if (data.ok && data.result.length) {
                callback(data.result);
                getUpdates(data.result[data.result.length - 1].update_id + 1);
            }
            else if (data.ok) {
                getUpdates(null);
            }
            else
                throw Error("getUpdates responce data is not ok: " + JSON.stringify(data));
        })
            .catch((err) => console.error(err));
    }
    getUpdates(null);
}
exports.subscribe = subscribe;
//# sourceMappingURL=telegramAPI.js.map