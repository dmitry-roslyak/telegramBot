import { sendLocation, sendMessage, answerCallbackQuery, subscribe, sendPhoto } from "./telegramAPI";
import vesselAPI from "./vesselsAPI";
import { CallbackQueryActions, Vessel, VesselProperty, UI_template } from "./telegramBot.t";
import { DB } from "./db";
import { UI } from "./telegramBotUI";
import { Telegram } from "./telegram";

const answerCallbackActions = Object.keys(CallbackQueryActions);

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
      const [action, index] = element.callback_query.data.split(":");
      if (answerCallbackActions.includes(action)) {
        DB.queryfindOne(this.chat_id, element.callback_query.message.message_id)
          .then((query) => {
            if (!query) {
              return this.sendMessage(UI_template.queryIsTooOld);
            }
            const data = JSON.parse(query.data);
            return this.callbackQueryHandler(action, data instanceof Array ? data[+index] : data);
          })
          .then(() => answerCallbackQuery(element.callback_query.id));
      } else this.sendMessage(UI_template.queryIsTooOld);
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
          .getOne(VesselProperty.MMSI, text)
          .then((vessel) => this.vesselWithFavorite(vessel))
          .then((vessel) =>
            vessel ? this.sendMessage(UI_template.vesselInfo, vessel) : this.sendMessage(UI_template.notFound)
          );
      } else {
        vesselAPI
          .find(text)
          .then((vessels) =>
            vessels && vessels.length
              ? this.sendMessage(UI_template.vesselList, vessels)
              : this.sendMessage(UI_template.notFound)
          );
      }
    }
  }

  private callbackQueryHandler(action: string, data: Vessel) {
    switch (action) {
      case CallbackQueryActions.href:
        return vesselAPI
          .getOne(VesselProperty.href, data[VesselProperty.href])
          .then((vessel) => this.vesselWithFavorite(vessel))
          .then((vessel) =>
            vessel ? this.sendMessage(UI_template.vesselInfo, vessel) : this.sendMessage(UI_template.errorTrylater)
          );
      case CallbackQueryActions.location:
        return vesselAPI
          .getOne(VesselProperty.href, data[VesselProperty.href])
          .then((vessel) =>
            vessel ? sendLocation(this.chat_id, vessel.Coordinates) : this.sendMessage(UI_template.errorTrylater)
          );
      case CallbackQueryActions.photo:
        return vesselAPI
          .imageFind(data[VesselProperty.MMSI])
          .then((imgSrc) =>
            imgSrc ? sendPhoto(this.chat_id, imgSrc) : this.sendMessage(UI_template.photoNotAvailable)
          );
      case CallbackQueryActions.favoritesAdd:
        return DB.favoriteFindOneOrCreate(this.chat_id, data).then((fav) =>
          this.sendMessage(fav ? UI_template.favAdd : UI_template.errorTrylater)
        );
      case CallbackQueryActions.favoritesRemove:
        return DB.favoriteRemove(this.chat_id, data).then(() => this.sendMessage(UI_template.favRemove));
    }
  }

  private async vesselWithFavorite(vessel: Vessel) {
    return Promise.resolve({
      ...vessel,
      isFavorite: !!(await DB.favoriteFindOne(this.chat_id, vessel)),
    });
  }

  private async sendMessage(templateMessage: UI_template, data?: unknown) {
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
