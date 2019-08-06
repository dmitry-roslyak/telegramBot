import * as req from "request";
import { RequestCallback } from "request";
import { Telegram } from "./telegram.1";
import InlineKeyboardMarkup = Telegram.InlineKeyboardMarkup
import ReplyKeyboardMarkup = Telegram.ReplyKeyboardMarkup

const util = require('util');
const {
    telegram
} = require("../env.json");

const telegramApi = telegram.apiUrl + telegram.apiKey + "/"

const contactUsURL = telegram.contactURL

const request = req.defaults({
    baseUrl: telegramApi,
    json: true
})

interface reply_markup {
    inline_keyboard?: Telegram.InlineKeyboardMarkup
    keyboard?: Telegram.ReplyKeyboardMarkup
}

interface SubscribeCallback {
    (updates: Array<Telegram.Update>): void
}

function answerCallbackQuery(callback_query_id: string, text?: string, show_alert?: boolean, url?: string, cache_time?: number) {
    request.get({
        url: "/answerCallbackQuery",
        qs: {
            callback_query_id
        }
    }, function (error, httpResponse, body) {
    })
}
function sendMessage(chat_id: number, text: string, reply_markup?: reply_markup) {
    let message = {
        chat_id,
        text,
        ...(reply_markup && { reply_markup: JSON.stringify(reply_markup) })
    }

    const requestGet = util.promisify(request.get);

    return requestGet({
        url: "/sendMessage",
        qs: message
    })
    // request.get({
    //     url: "/sendMessage",
    //     qs: message
    // }, function (error, httpResponse, body) {
    //     // console.log(body)
    // })
}
function sendLocation(chat_id: number, coordinates: any) {
    if (coordinates && !coordinates.latitude && !coordinates.longitude) {
        console.log("coordinates not available")
        return;
    }

    const requestGet = util.promisify(request.get);

    return requestGet({
        url: "/sendLocation",
        qs: {
            chat_id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        }
    })
}
function sendPhoto(chat_id: number | string, photo: string) {
    request.get({
        url: "/sendPhoto",
        qs: {
            chat_id,
            photo
        }
    }, function (error, httpResponse, body) {
        // console.log(body)
    })
}
function subscribe(callback: SubscribeCallback): void {
    let offset: number = null;

    let func: RequestCallback = function (error, httpResponse, data: { ok: boolean, result: Array<Telegram.Update> }) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            error && console.error(error)
            httpResponse && console.warn(`httpResponse.statusCode: ${httpResponse.statusCode}`)
            setInterval(getUpdates, 120 * 1000)
            return
        }
        offset = data.result.length ? data.result[data.result.length - 1].update_id + 1 : null
        !data.ok && console.warn(data)
        data.result.length && callback(data.result)
        getUpdates();
    }

    getUpdates();

    function getUpdates() {
        request.get({
            url: "/getupdates",
            qs: {
                offset: offset,
                timeout: 120
            }
        }, func)
    }
}

export { sendMessage, sendLocation, sendPhoto, subscribe, answerCallbackQuery, InlineKeyboardMarkup, ReplyKeyboardMarkup, contactUsURL }