"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegramBot_t_1 = require("./telegramBot.t");
const en_1 = require("./localizations/en");
const countries = require("../countries.json");
const locales = {
    en: en_1.localization_en
};
const botName = process.env.tg_bot_link.match(/(?<=t.me\/)[^]+/) || "bot";
const contactUsURL = process.env.telegram_Contact_URL;
class UI {
    constructor(user) {
        if (locales[user.language_code]) {
            this.locale = locales[user.language_code];
        }
        else {
            this.locale = locales["en"];
        }
    }
    localize(template, data) {
        if (template == telegramBot_t_1.UI_template.queryIsTooOld || template == telegramBot_t_1.UI_template.photoNotAvailable ||
            template == telegramBot_t_1.UI_template.errorTrylater || template == telegramBot_t_1.UI_template.favAdd || template == telegramBot_t_1.UI_template.favEmpty ||
            template == telegramBot_t_1.UI_template.favRemove) {
            return { text: this.locale(template) };
        }
        else if (template == telegramBot_t_1.UI_template.hello) {
            return { text: this.locale("hello", this.user, botName) };
        }
        else if (template == telegramBot_t_1.UI_template.menu) {
            let inline_keyboard = [];
            inline_keyboard.push([
                {
                    text: this.locale("my_fleet"), callback_data: telegramBot_t_1.CallbackQueryActions.favorites
                }, {
                    text: this.locale("contact_us"), url: contactUsURL
                }
            ]);
            return { text: this.locale("menu"), inline_keyboard };
        }
        else if (template == telegramBot_t_1.UI_template.vesselInfo) {
            let vessel = data;
            let text = "";
            telegramBot_t_1.VesselPropertyArray.forEach((property) => {
                let str;
                if (property == telegramBot_t_1.VesselProperty.estimatedArrivalDate || property == telegramBot_t_1.VesselProperty.lastReportDate) {
                    str = (new Date(vessel[property])).toLocaleString();
                }
                else if (property == telegramBot_t_1.VesselProperty.flag) {
                    str = `${UI.countryFlag(vessel[property])} ${vessel[property]}`;
                }
                else if (property == telegramBot_t_1.VesselProperty.port || property == telegramBot_t_1.VesselProperty.lastPort) {
                    str = `${UI.countryFlag(vessel[property].country)} ${vessel[property].name} ${(new Date(vessel[property].date)).toLocaleString()} ${property == telegramBot_t_1.VesselProperty.port ? this.locale("arrived") : this.locale("departed")}`;
                }
                else
                    str = vessel[property];
                // text += `${property}: ${str}\n`
                text += `${this.locale(property)}: ${str}\n`;
            });
            let inline_keyboard = [];
            let btnArray = [];
            btnArray.push({
                text: this.locale("location"), callback_data: telegramBot_t_1.CallbackQueryActions.location
            });
            vessel[telegramBot_t_1.VesselProperty.MMSI] && btnArray.push({
                text: this.locale("vessel_photo"), callback_data: telegramBot_t_1.CallbackQueryActions.photo
            });
            btnArray.push(vessel.isFavorite ?
                { text: this.locale("vessel_remove"), callback_data: telegramBot_t_1.CallbackQueryActions.favoritesRemove } :
                { text: this.locale("vessel_add"), callback_data: telegramBot_t_1.CallbackQueryActions.favoritesAdd });
            inline_keyboard.push(btnArray);
            return { text, inline_keyboard };
        }
        else if (template == telegramBot_t_1.UI_template.vesselList) {
            let vessels = data;
            let text = "";
            text = this.locale("vessels_not_found");
            if (vessels.length) {
                vessels.length > 15 && (vessels.length = 15);
                text = this.locale("found_vessels", vessels.length);
            }
            return { text, inline_keyboard: UI.buttonsGrid(this.vesselList(vessels), 3) };
        }
        else if (telegramBot_t_1.UI_template.vesselListFav)
            return { text: this.locale("my_fleet"), inline_keyboard: UI.buttonsGrid(this.vesselList(data), 3) };
        else
            return { text: this.locale() };
    }
    vesselList(vessels) {
        let array = [];
        vessels.forEach((element, i) => {
            array.push({ text: `${UI.countryFlag(element.country)} ${element.name}`, callback_data: telegramBot_t_1.CallbackQueryActions.href + ":" + i });
        });
        return array;
    }
    static countryFlag(country) {
        let res = countries.find((el) => el.cca2 == country || el.common.toUpperCase() == country.toUpperCase() || el.cca3 == country);
        return res && res.flag || "";
    }
    static buttonsGrid(array, maxColumn) {
        let keyboard = [];
        for (let c = 0, i = 0; i < array.length; c++) {
            keyboard.push([]);
            keyboard.forEach((el, index) => {
                if (c != index)
                    return;
                for (let j = 1; j <= maxColumn && i < array.length; j++, i++) {
                    el.push(array[i]);
                }
            });
        }
        return keyboard;
    }
}
exports.UI = UI;
//# sourceMappingURL=telegramBotUI.js.map