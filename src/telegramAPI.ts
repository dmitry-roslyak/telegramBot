import fetch from "node-fetch";
import { Telegram } from "./telegram";
import { Coordinates } from "./telegramBot.t";
const legacyURL = require("url");

const telegramApi = process.env.telegram_API_URL + process.env.telegram_API_Key + "/";

function answerCallbackQuery(
  callback_query_id: string
  // text?: string,
  // show_alert?: boolean,
  // url?: string,
  // cache_time?: number
): Promise<void> {
  const url = legacyURL.format({
    pathname: telegramApi + "answerCallbackQuery",
    query: { callback_query_id },
  });

  return fetch(url)
    .then((res) => res.json())
    .catch((err) => console.error(err));
}
function sendMessage(chat_id: number, text: string, reply_markup?: Telegram.reply_markup): Promise<any> {
  const url = legacyURL.format({
    pathname: telegramApi + "sendMessage",
    query: {
      chat_id,
      text,
      ...(reply_markup && { reply_markup: JSON.stringify(reply_markup) }),
    },
  });

  return fetch(url)
    .then((res) => res.json())
    .catch((err) => console.error(err));
}
function sendLocation(chat_id: number, coordinates: Coordinates): Promise<void> {
  const url = legacyURL.format({
    pathname: telegramApi + "sendLocation",
    query: {
      chat_id,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
  });

  return fetch(url)
    .then((res) => res.json())
    .catch((err) => console.error(err));
}
function sendPhoto(chat_id: number | string, photo: string): Promise<void> {
  const url = legacyURL.format({
    pathname: telegramApi + "sendPhoto",
    query: {
      chat_id,
      photo,
    },
  });

  return fetch(url)
    .then((res) => res.json())
    .catch((err) => console.error(err));
}
function subscribe(callback: Telegram.SubscribeCallback): void {
  function getUpdates(offset: number) {
    const url = legacyURL.format({
      pathname: telegramApi + "getupdates",
      query: {
        offset,
        timeout: 120,
      },
    });

    fetch(url)
      .then((res) => res.json())
      .then((data: { ok: boolean; result: Array<Telegram.Update> }) => {
        if (data.ok && data.result.length) {
          callback(data.result);
          getUpdates(data.result[data.result.length - 1].update_id + 1);
        } else if (data.ok) {
          getUpdates(null);
        } else throw Error("getUpdates responce data is not ok: " + JSON.stringify(data));
      })
      .catch((err) => console.error(err));
  }
  getUpdates(null);
}

export { sendMessage, sendLocation, sendPhoto, subscribe, answerCallbackQuery };
