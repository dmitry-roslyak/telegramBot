import { sendLocation, sendMessage, answerCallbackQuery, subscribe, sendPhoto } from "./telegramAPI";
import vesselAPI from "./vesselsAPI";
import { CallbackQueryActions, Vessel, VesselProperty, UI_template, VesselsList } from "./telegramBot.t";
import { DB } from "./db";
import { UI } from "./telegramBotUI";
import { Telegram } from "./telegram";

const answerCallbackActions = [
  CallbackQueryActions.href,
  CallbackQueryActions.location,
  CallbackQueryActions.photo,
  CallbackQueryActions.favoritesAdd,
  CallbackQueryActions.favoritesRemove,
] as string[];

subscribe(function (messages) {
  messages.forEach((element) => new UpdateHandler(element));
});

class UpdateHandler {
  private _chat_id: number;
  // private _user: Telegram.User;
  private UI: UI;

  public get chat_id(): number {
    return this._chat_id;
  }

  // eslint-disable-next-line accessor-pairs
  public set user(user: Telegram.User) {
    // this._user = user;
    this._chat_id = user.id;
    this.UI = new UI(user);
  }

  constructor(element: Telegram.Update) {
    if (element.message) {
      this.user = element.message.from;
      this.commandsHandler(element.message.text);
    } else if (element.callback_query && element.callback_query.message) {
      this.user = element.callback_query.from;
      const action = element.callback_query.data.split(":");
      if (answerCallbackActions.includes(action[0])) {
        DB.queryfindOne(this.chat_id, element.callback_query.message.message_id).then((query) => {
          if (!query) {
            answerCallbackQuery(element.callback_query.id);
            return this.sendMessage(UI_template.queryIsTooOld);
          }
          const data = JSON.parse(query.data);
          const href = action.length === 2 ? data[action[1]].href : data.href;
          this.callbackQueryHandler(element.callback_query, action[0], href, data);
        });
      } else this.callbackQueryHandler(element.callback_query, action[0]);
    }
  }

  private commandsHandler(text: string) {
    if (text === "/start") {
      this.sendMessage(UI_template.hello);
    } else if (text === "/menu") {
      this.sendMessage(UI_template.menu);
    } else if (text === "/fav" || text === "/fleet") {
      DB.favorites(this.chat_id).then((vessels) => {
        vessels.length ? this.sendMessage(UI_template.vesselListFav, vessels) : this.sendMessage(UI_template.favEmpty);
      });
    } else if (text && text.length > 2) {
      if (/\d{7}|\d{9}/.test(text)) {
        vesselAPI
          .find(text)
          .then(this.vesselWithFavorite.bind(this))
          .then((vessel) =>
            vessel ? this.sendMessage(UI_template.vesselInfo, vessel) : this.sendMessage(UI_template.notFound)
          );
      } else {
        vesselAPI
          .find(text)
          .then((vessels: VesselsList) =>
            vessels && vessels.length
              ? this.sendMessage(UI_template.vesselList, vessels)
              : this.sendMessage(UI_template.notFound)
          );
      }
    }
  }

  private callbackQueryHandler(callback_query: Telegram.CallbackQuery, action: string, href?: string, data?: any) {
    switch (action) {
      case CallbackQueryActions.href:
        vesselAPI
          .getOne(href)
          .then(this.vesselWithFavorite.bind(this))
          .then((vessel) =>
            vessel ? this.sendMessage(UI_template.vesselInfo, vessel) : this.sendMessage(UI_template.errorTrylater)
          )
          .then(() => answerCallbackQuery(callback_query.id));
        break;
      case CallbackQueryActions.location:
        vesselAPI
          .getOne(href)
          .then((vessel) =>
            vessel ? sendLocation(this.chat_id, vessel.Coordinates) : this.sendMessage(UI_template.errorTrylater)
          )
          .then(() => answerCallbackQuery(callback_query.id));
        break;
      case CallbackQueryActions.photo:
        vesselAPI
          .imageFind(data[VesselProperty.MMSI])
          .then((imgSrc) =>
            imgSrc ? sendPhoto(this.chat_id, imgSrc) : this.sendMessage(UI_template.photoNotAvailable)
          )
          .then(() => answerCallbackQuery(callback_query.id));
        break;
      case CallbackQueryActions.favoritesAdd:
        DB.favoriteFindOneOrCreate(this.chat_id, data, href)
          .then((fav) => this.sendMessage(fav ? UI_template.favAdd : UI_template.errorTrylater))
          .then(() => answerCallbackQuery(callback_query.id));
        break;
      case CallbackQueryActions.favoritesRemove:
        DB.favoriteRemove(this.chat_id, href)
          .then(() => this.sendMessage(UI_template.favRemove))
          .then(() => answerCallbackQuery(callback_query.id));
        break;
    }
  }

  private async vesselWithFavorite(vessel: Vessel) {
    return Promise.resolve({
      ...vessel,
      isFavorite: !!(await DB.favoriteFindOne(this.chat_id, vessel)),
    });
  }

  private async sendMessage(templateMessage: UI_template, data?: any) {
    let message;
    const localized = this.UI.localize(templateMessage, data);
    if (localized.inline_keyboard) {
      message = await sendMessage(this.chat_id, localized.text, { inline_keyboard: localized.inline_keyboard });
    } else {
      message = await sendMessage(this.chat_id, localized.text);
    }
    data && message.result && DB.queryCreate(this.chat_id, message.result.message_id, data);
  }
}
