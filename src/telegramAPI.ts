import * as req from "request-promise"
import { RequestCallback } from "request";

const telegramApi = process.env.telegram_API_URL + process.env.telegram_API_Key + "/"
const contactUsURL = process.env.telegram_Contact_URL

const request = req.defaults({
    baseUrl: telegramApi,
    json: true
})

function answerCallbackQuery(callback_query_id: string, text?: string, show_alert?: boolean, url?: string, cache_time?: number) {
    return request.get({
        url: "/answerCallbackQuery",
        qs: {
            callback_query_id
        }
    }).catch(err => console.error(err))
}
function sendMessage(chat_id: number, text: string, reply_markup?: Telegram.reply_markup) {
    let message = {
        chat_id,
        text,
        ...(reply_markup && { reply_markup: JSON.stringify(reply_markup) })
    }

    return request.get({
        url: "/sendMessage",
        qs: message
    }).catch(err => console.error(err))
}
function sendLocation(chat_id: number, coordinates: any) {
    if (coordinates && !coordinates.latitude && !coordinates.longitude) {
        return Promise.reject("coordinates not available");
    }

    return request.get({
        url: "/sendLocation",
        qs: {
            chat_id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        }
    }).catch(err => console.error(err))
}
function sendPhoto(chat_id: number | string, photo: string) {
    return request.get({
        url: "/sendPhoto",
        qs: {
            chat_id,
            photo
        }
    }).catch(err => console.error(err))
}
function subscribe(callback: Telegram.SubscribeCallback): void {
    let offset: number = null;

    let func: RequestCallback = function (error, httpResponse, data: { ok: boolean, result: Array<Telegram.Update> }) {
        if (error || (httpResponse && httpResponse.statusCode != 200)) {
            error && console.error(error)
            httpResponse && console.warn(`httpResponse.statusCode: ${httpResponse.statusCode}`)
            // setInterval(getUpdates, 120 * 1000)
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

export { sendMessage, sendLocation, sendPhoto, subscribe, answerCallbackQuery, contactUsURL }