import {
  VesselPropertyArray,
  VesselProperty,
  CallbackQueryActions,
  Vessel,
  VesselsList,
  UI_template,
  VesselMeasurementSystem,
} from "./telegramBot.t";
import { localization_en } from "./localizations/en";
import { Telegram } from "./telegram";
const countries = require("../countries.json");

const locales: any = {
  en: localization_en,
};

const botName = process.env.tg_bot_link.match(/(?<=t.me\/)[^]+/) || "bot";
const contactUsURL = process.env.telegram_Contact_URL;

class UI {
  private locale: any;
  private user: Telegram.User;

  constructor(user: Telegram.User) {
    this.user = user;
    if (locales[user.language_code]) {
      this.locale = locales[user.language_code];
    } else {
      this.locale = locales.en;
    }
  }

  public localize(
    template: UI_template,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    data?: any
  ): { text: string; inline_keyboard?: Telegram.InlineKeyboardMarkup } {
    if (
      template === UI_template.notFound ||
      template === UI_template.queryIsTooOld ||
      template === UI_template.photoNotAvailable ||
      template === UI_template.errorTrylater ||
      template === UI_template.favAdd ||
      template === UI_template.favEmpty ||
      template === UI_template.favRemove
    ) {
      return { text: this.locale(template) };
    } else if (template === UI_template.hello) {
      return { text: this.locale("hello", this.user, botName) };
    } else if (template === UI_template.menu) {
      const inline_keyboard: Telegram.InlineKeyboardMarkup = [];

      inline_keyboard.push([
        {
          text: this.locale("my_fleet"),
          callback_data: CallbackQueryActions.favorites,
        },
        {
          text: this.locale("contact_us"),
          url: contactUsURL,
        },
      ]);
      return { text: this.locale("menu"), inline_keyboard };
    } else if (template === UI_template.vesselInfo) {
      const vessel: Vessel = data;
      let text = "";

      VesselPropertyArray.forEach((property) => {
        if (!vessel[property]) return;
        let info;
        if (property === VesselProperty.estimatedArrivalDate || property === VesselProperty.lastReportDate) {
          info = UI.dateToLocaleString(vessel[property]);
        } else if (property === VesselProperty.flag) {
          info = `${UI.countryFlag(vessel[property])} ${vessel[property]}`;
        } else if (property === VesselProperty.port || property === VesselProperty.lastPort) {
          info = UI.portToString(
            vessel[property],
            property === VesselProperty.port ? this.locale("arrived") : this.locale("departed")
          );
        } else info = vessel[property];
        if (info) {
          text += `${this.locale(property)}: ${info} ${VesselMeasurementSystem[property] || ""} \n`;
        }
      });

      const inline_keyboard: Telegram.InlineKeyboardMarkup = [];
      const btnArray = [];
      btnArray.push({
        text: this.locale("location"),
        callback_data: CallbackQueryActions.location,
      });
      vessel[VesselProperty.MMSI] &&
        btnArray.push({
          text: this.locale("vessel_photo"),
          callback_data: CallbackQueryActions.photo,
        });
      btnArray.push(
        vessel.isFavorite
          ? { text: this.locale("vessel_remove"), callback_data: CallbackQueryActions.favoritesRemove }
          : { text: this.locale("vessel_add"), callback_data: CallbackQueryActions.favoritesAdd }
      );
      inline_keyboard.push(btnArray);

      return { text, inline_keyboard };
    } else if (template === UI_template.vesselList) {
      const vessels: VesselsList = data;

      vessels.length > 15 && (vessels.length = 15);
      const text = this.locale("found_vessels", vessels.length);

      return { text, inline_keyboard: UI.buttonsGrid(this.vesselList(vessels), 3) };
    } else if (UI_template.vesselListFav) {
      return { text: this.locale("my_fleet"), inline_keyboard: UI.buttonsGrid(this.vesselList(data), 3) };
    } else return { text: this.locale() };
  }

  private vesselList(vessels: VesselsList) {
    const array: any[] = [];

    vessels.forEach((element, i) => {
      array.push({
        text: `${UI.countryFlag(element.country)} ${element.name}`,
        callback_data: CallbackQueryActions.href + ":" + i,
      });
    });

    return array;
  }

  public static portToString(port: Record<string, string>, str: string): string {
    try {
      let output = "";
      output += `${UI.countryFlag(port.country)} ${port.name} `;
      const dateStr = UI.dateToLocaleString(port.date);
      if (dateStr) output += `${dateStr} ${str}`;
      return output;
    } catch (error) {
      console.log(error);
    }
  }

  public static dateToLocaleString(date: string): string {
    // console.log(date);
    try {
      return date ? new Date(date).toLocaleString() : null;
    } catch (error) {
      console.log(error);
    }
  }

  public static countryFlag(country: string): string {
    try {
      const res = countries.find(
        (el: any) => el.cca2 === country || el.common.toUpperCase() === country.toUpperCase() || el.cca3 === country
      );
      return (res && res.flag) || country;
    } catch (error) {
      console.log(error);
    }
  }

  public static buttonsGrid(array: any[], maxColumn?: number): Telegram.InlineKeyboardMarkup {
    const keyboard: Telegram.InlineKeyboardMarkup = [];
    for (let c = 0, i = 0; i < array.length; c++) {
      keyboard.push([]);
      keyboard.forEach((el: any, index: number) => {
        if (c !== index) return;
        for (let j = 1; j <= maxColumn && i < array.length; j++, i++) {
          el.push(array[i]);
        }
      });
    }
    return keyboard;
  }
}

export { UI };
