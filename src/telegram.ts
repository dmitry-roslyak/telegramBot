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
    reply_markup?: reply_markup
}
type reply_markup = InlineKeyboardMarkup | string



interface InlineKeyboardButton {
    text: string
    url?: string
    callback_data?: string
}
class InlineKeyboardMarkup extends Array<Array<InlineKeyboardButton>> { }

function sendMessage(message: Message) {
    request.get({
        url: "/sendMessage",
        qs: message
    }, function (error, httpResponse, body) {
        // console.log(body)
    })
}
function sendMessageText(chat_id: number, text: string = "EMPTY") {
    // console.log(chat_id)
    // console.log(text)
    request.get({
        url: "/sendMessage",
        qs: {
            chat_id,
            text: text
        }
    }, function (error, httpResponse, body) {
        console.log(body)
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
function Telegram(callback: RequestCallback): any {
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

export { sendMessage, sendMessageText, sendLocation, Telegram, InlineKeyboardMarkup }