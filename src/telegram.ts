import * as req from "request";
import { RequestCallback } from "request";


const {
    telegram
} = require("../env.json");

const telegramApi = telegram.apiUrl + telegram.apiKey + "/"

const request = req.defaults({
    baseUrl: telegramApi,
    json: true
})

interface Message {
    chat_id: number
    text: string
    reply_markup?: reply_markup | string
}

interface reply_markup {
    inline_keyboard?: InlineKeyboardMarkup
    keyboard?: ReplyKeyboardMarkup
}

interface InlineKeyboardButton {
    text: string
    url?: string
    callback_data?: string
}

interface KeyboardButton {
    text: string
    request_contact?: boolean
    request_location?: boolean
}

interface ReplyKeyboardMarkup extends Array<Array<KeyboardButton | string>> { }
interface InlineKeyboardMarkup extends Array<Array<InlineKeyboardButton>> { }

// function sendMessage(message: Message) {
//     request.get({
//         url: "/sendMessage",
//         qs: message
//     }, function (error, httpResponse, body) {
//         // console.log(body)
//     })
// }
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
    request.get({
        url: "/sendMessage",
        qs: message
    }, function (error, httpResponse, body) {
        // console.log(body)
    })
}
function sendLocation(chat_id: number, coordinates: any) {
    if (coordinates && !coordinates.latitude && !coordinates.longitude) {
        console.log("coordinates not available")
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
    })
}
function Telegram(callback: RequestCallback): void {
    let offset: number = null;

    function func(error: any, httpResponse: any, data: any) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            // if (error || httpResponse.statusCode != 200 || !data.length) {
            console.error(`httpResponse.statusCode: ${httpResponse.statusCode}`)
            console.error(error)
            return
        }
        offset = data.result.length ? data.result[data.result.length - 1].update_id + 1 : null
        console.log(data)
        data.result.length && callback.call(null, data.result)
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
        }, func)
    }
}

export { sendMessage, sendLocation, Telegram, InlineKeyboardMarkup, answerCallbackQuery }